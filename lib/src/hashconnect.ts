import { Event } from "ts-typed-events";
import {
  AccountId,
  LedgerId,
  SignerSignature,
  Transaction,
  TransactionResponse,
} from "@hashgraph/sdk";
import {
  HashConnectConnectionState,
  HashConnectTypes,
  MessageTypes,
} from "./types";
import Core from "@walletconnect/core";
import SignClient from "@walletconnect/sign-client";
import { ISignClient, SignClientTypes } from "@walletconnect/types";
import { getSdkError } from "@walletconnect/utils";

import AuthClient, { generateNonce } from "@walletconnect/auth-client";
import { HashConnectSigner } from "./signer";
import { AuthenticationHelper, SignClientHelper } from "./utils";
import { networkNamespaces } from "./shared";
import { HederaJsonRpcMethod } from "@hgraph.io/hedera-walletconnect-utils";

global.Buffer = global.Buffer || require("buffer").Buffer;

/**
 * Main interface with hashpack
 */
export class HashConnect {
  readonly connectionStatusChangeEvent =
    new Event<HashConnectConnectionState>();
  readonly pairingEvent = new Event<MessageTypes.SessionData>();
  readonly foundExtensionEvent = new Event<HashConnectTypes.WalletMetadata>();
  readonly foundIframeEvent = new Event<HashConnectTypes.WalletMetadata>();

  private core?: Core;
  private _signClient?: ISignClient;
  private _authClient?: AuthClient;

  private _pairingString?: string;
  get pairingString() {
    return this._pairingString;
  }

  get connectedAccountIds(): AccountId[] {
    const accountIds: AccountId[] = [];

    if (!this._signClient) {
      return accountIds;
    }

    const sessions = this._signClient.session.getAll();
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      if (session.namespaces.hedera?.accounts?.length > 0) {
        for (let j = 0; j < session.namespaces.hedera.accounts.length; j++) {
          const accountStr = session.namespaces.hedera.accounts[j];
          const accountStrParts = accountStr.split(":");
          accountIds.push(
            AccountId.fromString(accountStrParts[accountStrParts.length - 1])
          );
        }
      }
    }

    return accountIds;
  }

  private _connectToIframeParent() {
    if (typeof window === "undefined") {
      if (this._debug) {
        console.log(
          "hashconnect - Cancel iframe connection - no window object"
        );
      }
      return;
    }

    if (!this._pairingString) {
      console.error(
        "hashconnect - Cancel connect to iframe parent wallet - no pairing string"
      );
      return;
    }

    if (this._debug) {
      console.log("hashconnect - Connecting to iframe parent wallet");
    }

    window.parent.postMessage(
      {
        type: "hashconnect-iframe-pairing",
        pairingString: this._pairingString,
      },
      "*"
    );
  }

  private _setupEvents() {
    this.foundIframeEvent.on(async (walletMetadata) => {
      if (this._debug) {
        console.log("hashconnect - Found iframe wallet", walletMetadata);
      }

      // wait for pairing string to be set
      if (!this._pairingString) {
        await new Promise<void>((resolve) => {
          const intervalHandle = setInterval(() => {
            if (this._pairingString) {
              resolve();
              clearInterval(intervalHandle);
            }
          }, 250);
        });
      }

      this._connectToIframeParent();
    });
  }

  constructor(
    readonly ledgerId: LedgerId,
    private readonly projectId: string,
    private readonly metadata: SignClientTypes.Metadata,
    private readonly _debug: boolean = false
  ) {
    this._setupEvents();
  }

  getSigner(accountId: AccountId): HashConnectSigner {
    if (!this._signClient) {
      throw new Error("No sign client");
    }

    const session = SignClientHelper.getSessionForAccount(
      this._signClient,
      this.ledgerId,
      accountId.toString()
    );

    if (!session) {
      throw new Error("No session found for account");
    }

    return new HashConnectSigner(
      accountId,
      this._signClient,
      session.topic,
      this.ledgerId
    );
  }

  async init(): Promise<void> {
    if (this._debug) console.log("hashconnect - Initializing");

    if (typeof window !== "undefined") {
      this.metadata.url = window.location.origin;
    } else if (!this.metadata.url) {
      throw new Error(
        "metadata.url must be defined if not running hashconnect within a browser"
      );
    }

    if (!this.core || !this._signClient || !this._authClient) {
      this.core = new Core({
        projectId: this.projectId,
      });

      if (!this._signClient)
        this._signClient = await SignClient.init({
          core: this.core,
          metadata: this.metadata,
        });
      if (!this._authClient)
        this._authClient = await AuthClient.init({
          metadata: this.metadata,
          core: this.core,
          projectId: this.projectId,
        });

      // add delay for race condition in SignClient.init that causes .connect to never resolve
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
    }

    this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Connected);

    if (this._debug) {
      console.log("hashconnect - Initialized");
    }

    if (this._debug) {
      console.log("hashconnect - connecting");
      console.log({ sessionLength: this._signClient.session.length });
    }

    //generate a pairing string, which you can display and generate a QR code from
    const { uri, approval } = await this._signClient.connect({
      optionalNamespaces: networkNamespaces(
        this.ledgerId,
        ["hashpack_authenticate"],
        []
      ),
      requiredNamespaces: networkNamespaces(
        this.ledgerId,
        Object.values(HederaJsonRpcMethod),
        []
      ),
    });

    let existing_sessions = this._signClient.session.getAll();

    if (existing_sessions.length > 0) {
      this.pairingEvent.emit({
        metadata: this.metadata, // TODO: Make wallet metadata instead of dapp metadata
        accountIds: this.connectedAccountIds.map((a) => a.toString()),
        topic: existing_sessions[0].topic,
        network: this.ledgerId.toString(),
      });

      this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Paired);
    }

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
          this.connectionStatusChangeEvent.emit(
            HashConnectConnectionState.Paired
          );

          this.pairingEvent.emit({
            metadata: this.metadata, // TODO: Make wallet metadata instead of dapp metadata
            accountIds: this.connectedAccountIds.map((a) => a.toString()),
            topic: approved.topic,
            network: this.ledgerId.toString(),
          });
        }
      });
    } else {
      console.error("hashconnect - No approval function found");
    }
  }

  async connect(): Promise<void> {
    await this.init();
  }

  async disconnect() {
    if (!this._signClient) {
      return;
    }

    await Promise.all(
      this._signClient.session.getAll().map(async (session) => {
        await this._signClient?.disconnect({
          topic: session.topic,
          reason: getSdkError("USER_DISCONNECTED"),
        });
      })
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
  ) {
    if (!this._signClient) {
      throw new Error("No sign client");
    }

    const signature = await SignClientHelper.sendAuthenticationRequest(
      this._signClient,
      this.ledgerId,
      serverSigningAccount,
      serverSignature,
      accountId.toString(),
      payload
    );

    const result = await AuthenticationHelper.verifyAuthenticationSignatures(
      this.ledgerId,
      accountId.toString(),
      signature,
      serverSigningAccount.toString(),
      serverSignature,
      payload
    );

    return {
      ...result,
      accountId: accountId.toString(),
      accountSignature: signature,
      serverSigningAccount: serverSigningAccount.toString(),
      serverSignature,
    };
  }

  /**
   * Local wallet stuff
   */

  findLocalWallets() {
    if (typeof window === "undefined") {
      if (this._debug) {
        console.log("hashconnect - Cancel findLocalWallets - no window object");
      }
      return;
    }

    if (this._debug) {
      console.log("hashconnect - Finding local wallets");
    }
    window.addEventListener(
      "message",
      (event) => {
        if (
          event.data.type &&
          event.data.type == "hashconnect-query-extension-response"
        ) {
          if (this._debug) {
            console.log(
              "hashconnect - Local wallet metadata recieved",
              event.data
            );
          }
          if (event.data.metadata) {
            this.foundExtensionEvent.emit(event.data.metadata);
          }
        }

        if (
          event.data.type &&
          event.data.type == "hashconnect-iframe-response"
        ) {
          if (this._debug) {
            console.log(
              "hashconnect - iFrame wallet metadata recieved",
              event.data
            );
          }

          if (event.data.metadata) {
            this.foundIframeEvent.emit(event.data.metadata);
          }
        }
      },
      false
    );

    setTimeout(() => {
      window.postMessage({ type: "hashconnect-query-extension" }, "*");
      if (window.parent) {
        window.parent.postMessage({ type: "hashconnect-iframe-query" }, "*");
      }
    }, 50);
  }

  connectToLocalWallet() {
    if (typeof window === "undefined") {
      if (this._debug) {
        console.log(
          "hashconnect - Cancel connect to local wallet - no window object"
        );
      }
      return;
    }

    if (!this._pairingString) {
      console.error(
        "hashconnect - Cancel connect to local wallet - no pairing string"
      );
      return;
    }

    if (this._debug) {
      console.log("hashconnect - Connecting to local wallet");
    }

    //todo: add extension metadata support
    window.postMessage(
      {
        type: "hashconnect-connect-extension",
        pairingString: this._pairingString,
      },
      "*"
    );
  }
}
