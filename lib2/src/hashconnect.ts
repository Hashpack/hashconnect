import { DAppConnector, DAppMetadata } from "@hashgraph/hedera-wallet-connect";
import { Event } from "ts-typed-events";
import {
  AccountId,
  LedgerId,
  SignerSignature,
  Transaction,
  TransactionResponse,
  Signer,
  PublicKey,
} from "@hashgraph/sdk";
import { HashConnectConnectionState, MessageTypes } from "./types";

global.Buffer = global.Buffer || require("buffer").Buffer;

/**
 * Main interface with hashpack
 */
export class HashConnect {
  connectionStatusChangeEvent = new Event<HashConnectConnectionState>();
  pairingEvent = new Event<MessageTypes.ApprovePairing>();

  private _dappConnector: DAppConnector;
  private _pairingString?: string;
  get pairingString() {
    return this._pairingString;
  }

  get connectedAccountIds(): AccountId[] {
    return this._dappConnector.getSigners().map((s) => s.getAccountId());
  }

  constructor(
    readonly metadata: DAppMetadata,
    private readonly _debug: boolean = false
  ) {
    this._dappConnector = new DAppConnector(metadata);
    (window as any).x = this._dappConnector;
  }

  getSigner(accountId: AccountId): Signer {
    const signers: (Signer & {
      accountId: AccountId;
    })[] = this._dappConnector.getSigners() as any[];

    const signer = signers.find(
      (s) => s.accountId.toString() === accountId.toString()
    );
    if (!signer) {
      throw new Error(
        "No signer found for account id: " + accountId.toString()
      );
    }
    return signer;
  }

  async init(ledgerId: LedgerId): Promise<void> {
    if (this._debug) console.log("hashconnect - Initializing");

    if (typeof window !== "undefined") {
      this.metadata.url = window.location.origin;
    } else if (!this.metadata.url) {
      throw new Error(
        "metadata.url must be defined if not running hashconnect within a browser"
      );
    }

    await this._dappConnector.init([], []);
    this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Connected);

    if (this._debug) {
      console.log("hashconnect - Initialized");
    }

    const existingPair = await this._dappConnector.checkPersistedState();
    if (!existingPair) {
      //generate a pairing string, which you can display and generate a QR code from
      const { uri, approval } = await this._dappConnector.prepareConnectURI(
        ledgerId
      );
      this._pairingString = uri;

      if (this._debug) {
        console.log(`hashconnect - Pairing string created: ${uri}`);
      }

      if (approval) {
        approval().then(async (approved) => {
          if (this._debug) {
            console.log("hashconnect - Approval received", approved);
          }
          if (approved) {
            await this._dappConnector.onSessionConnected(approved);
            this.connectionStatusChangeEvent.emit(
              HashConnectConnectionState.Paired
            );

            this.pairingEvent.emit({
              pairingData: undefined,
              metadata: this.metadata,
              accountIds: this.connectedAccountIds.map((a) => a.toString()),
              topic: approved.topic,
              network: ledgerId.toString(),
            });
          }
        });
      } else {
        console.error("hashconnect - No approval function found");
      }
    } else {
      this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Paired);
    }
  }

  async connect(ledgerId: LedgerId): Promise<void> {
    await this._dappConnector.connect(ledgerId);
  }

  async disconnect() {
    await this._dappConnector.disconnect();
    this.connectionStatusChangeEvent.emit(
      HashConnectConnectionState.Disconnected
    );
  }

  /**
   * Send a transaction to hashpack for signing and execution
   * @param accountId
   * @param transaction
   * @returns
   * @example
   * ```ts
   * const transactionResponse = await hashconnect.sendTransaction(
   *  accountId,
   *  transaction
   * );
   * ```
   * @category Transactions
   */
  async sendTransaction(
    accountId: AccountId,
    transaction: Transaction
  ): Promise<TransactionResponse> {
    const signer = this.getSigner(accountId);
    return await signer.call(transaction);
  }

  /**
   * Sign a message. This is a convenience method that calls `getSigner` and then `sign` on the signer
   * @param accountId
   * @param message
   * @returns
   * @example
   * ```ts
   * const signerSignature = await hashconnect.signMessage(
   *   accountId,
   *   ["Hello World"]
   * );
   */
  async signMessages(
    accountId: AccountId,
    message: string[]
  ): Promise<SignerSignature[]> {
    const signer = this.getSigner(accountId);
    return await signer.sign(message.map((m) => Buffer.from(m)));
  }

  /**
   * Sign a transaction. This is a convenience method that calls `getSigner` and then `signTransaction` on the signer
   * @param accountId
   * @param transaction
   * @returns
   * @example
   * ```ts
   * const transaction = new TransferTransaction()
   *  .addHbarTransfer(accountId, new Hbar(-1))
   *  .addHbarTransfer(toAccountId, new Hbar(1))
   *  .setNodeAccountIds(nodeAccoutIds)
   *  .setTransactionId(TransactionId.generate(accountId))
   *  .freeze();
   * const signedTransaction = await hashconnect.signTransaction(
   *  accountId,
   *  transaction
   * );
   * ```
   * @category Transactions
   */
  async signTransaction(
    accountId: AccountId,
    transaction: Transaction
  ): Promise<Transaction> {
    const signer = this.getSigner(accountId);
    return await signer.signTransaction(transaction);
  }

  /**
   * Verify the server signature of an authentication request and generate a signature for the account
   * @param accountId
   * @param serverSigningAccount
   * @param serverSignature
   * @param payload
   * @returns
   * @example
   * ```ts
   * const { accountSignature } = await hashconnect.authenticate(
   *   accountId,
   *   serverSigningAccountId,
   *   serverSignature,
   *   {
   *     url: "https://example.com",
   *     data: { foo: "bar" },
   *   }
   * );
   * ```
   * @category Authentication
   */
  async authenticate(
    accountId: AccountId,
    serverSigningAccount: AccountId,
    serverSignature: Uint8Array,
    payload: { url: string; data: any }
  ): Promise<{
    accountSignature: Uint8Array;
  }> {
    const signer = this.getSigner(accountId);
    const payloadBytes = new Uint8Array(Buffer.from(JSON.stringify(payload)));
    const signatures = await signer.sign([payloadBytes]);
    return { accountSignature: signatures[0].signature };
  }

  /**
   * Verify that the payload was signed by the account
   * @param accountId
   * @param accountSignature
   * @param payload
   * @param getPublicKey
   * @returns
   * @example
   * ```ts
   * const { isValid, error } = await hashconnect.verifyAuthenticationSignatures(
   *   accountId,
   *   accountSignature,
   *   "Hello World",
   *   async (accountId) => {
   *     // Use custom logic to get the public key of the account
   *     // in this example we use the hedera public mirror node.
   *     const response = await fetch(
   *       `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${accountId.toString()}`
   *     );
   *     const accountInfo = await response.json();
   *     return PublicKey.fromString(accountInfo.key.key);
   *   }
   * );
   * ```
   * @category Authentication
   * @category Signature Verification
   */
  async verifySignature(
    accountId: AccountId,
    accountSignature: Uint8Array,
    payload: any,
    getPublicKey: (accountId: AccountId) => Promise<PublicKey>
  ): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    const payloadBytes = new Uint8Array(Buffer.from(JSON.stringify(payload)));

    const accountPublicKey = await getPublicKey(accountId);
    const accountSignatureIsValid = accountPublicKey.verify(
      payloadBytes,
      accountSignature
    );
    if (!accountSignatureIsValid) {
      return {
        isValid: false,
        error: "Account signature is invalid",
      };
    }

    return { isValid: true };
  }

  /**
   * Verify the signatures of an authentication request by verifying the account and server signatures
   * @param accountId
   * @param accountSignature
   * @param serverSigningAccountId
   * @param serverSignature
   * @param payload
   * @param getPublicKey
   * @returns
   * @example
   * ```ts
   * const { isValid, error } = await hashconnect.verifyAuthenticationSignatures(
   *   accountId,
   *   accountSignature,
   *   serverSigningAccountId,
   *   serverSignature,
   *   {
   *     url: "https://example.com",
   *     data: { foo: "bar" },
   *   },
   *   async (accountId) => {
   *     // Use custom logic to get the public key of the account
   *     // in this example we use the hedera public mirror node.
   *     const response = await fetch(
   *       `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${accountId.toString()}`
   *     );
   *     const accountInfo = await response.json();
   *     return PublicKey.fromString(accountInfo.key.key);
   *   }
   * );
   * ```
   * @category Authentication
   */
  async verifyAuthenticationSignatures(
    accountId: AccountId,
    accountSignature: Uint8Array,
    serverSigningAccountId: AccountId,
    serverSignature: Uint8Array,
    payload: { url: string; data: any },
    getPublicKey: (accountId: AccountId) => Promise<PublicKey>
  ): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    const { isValid: accountSignatureIsValid } = await this.verifySignature(
      accountId,
      accountSignature,
      payload,
      getPublicKey
    );
    const { isValid: serverSignatureIsValid } = await this.verifySignature(
      serverSigningAccountId,
      serverSignature,
      payload,
      getPublicKey
    );

    if (!accountSignatureIsValid && !serverSignatureIsValid) {
      return {
        isValid: false,
        error: "Account and server signatures are invalid",
      };
    } else if (!accountSignatureIsValid) {
      return {
        isValid: false,
        error: "Account signature is invalid",
      };
    } else if (!serverSignatureIsValid) {
      return {
        isValid: false,
        error: "Server signature is invalid",
      };
    }

    return { isValid: true };
  }
}
