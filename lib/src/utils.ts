import { AccountId, LedgerId, PrivateKey, PublicKey } from "@hashgraph/sdk";
import {
  CAIPChainIdToLedgerId,
  HederaWallet,
} from "@hgraph.io/hedera-walletconnect-utils";
import SignClient from "@walletconnect/sign-client";
import { SignClientTypes, SessionTypes } from "@walletconnect/types";

export class ChainIdHelper {
  static getChainIdFromProposal(
    proposal: SignClientTypes.EventArguments["session_proposal"]
  ) {
    if (!proposal.params.requiredNamespaces.hedera) {
      throw new Error("Expected hedera requiredNamespace");
    }

    if (
      !proposal.params.requiredNamespaces.hedera.chains ||
      proposal.params.requiredNamespaces.hedera.chains.length <= 0
    ) {
      throw new Error(
        "Expected hedera.chains to be populated with a value ending in :295, :296, :297, or :298"
      );
    }

    return proposal.params.requiredNamespaces.hedera.chains[0];
  }

  static getChainIdFromSession(session: SessionTypes.Struct) {
    if (!session.namespaces.hedera) {
      throw new Error("Expected hedera requiredNamespace");
    }

    if (
      !session.namespaces.hedera.chains ||
      session.namespaces.hedera.chains.length <= 0
    ) {
      throw new Error(
        "Expected hedera.chains to be populated with a value ending in :295, :296, :297, or :298"
      );
    }

    return session.namespaces.hedera.chains[0];
  }
}

export class AuthenticationHelper {
  static mirrorNodeBaseUrlMainnet =
    "https://mainnet-public.mirrornode.hedera.com";
  static mirrorNodeBaseUrlTestnet = "https://testnet.mirrornode.hedera.com";
  static mirrorNodeBaseUrlPreviewnet =
    "https://previewnet.mirrornode.hedera.com";

  static mirrorNodeAuthTokenMainnet = "";
  static mirrorNodeAuthTokenTestnet = "";
  static mirrorNodeAuthTokenPreviewnet = "";

  static async getPublicKey(
    ledgerId: LedgerId,
    accountId: string
  ): Promise<PublicKey> {
    const ledgerIdStr = ledgerId.toString();
    const baseUrl =
      ledgerIdStr === LedgerId.MAINNET.toString()
        ? this.mirrorNodeBaseUrlMainnet
        : ledgerIdStr === LedgerId.TESTNET.toString()
        ? this.mirrorNodeBaseUrlTestnet
        : this.mirrorNodeBaseUrlPreviewnet;

    const authToken =
      ledgerIdStr === LedgerId.MAINNET.toString()
        ? this.mirrorNodeAuthTokenMainnet
        : ledgerIdStr === LedgerId.TESTNET.toString()
        ? this.mirrorNodeAuthTokenTestnet
        : this.mirrorNodeAuthTokenPreviewnet;
    const headers = new Headers();
    if (authToken) {
      headers.append("Authorization", `Bearer ${authToken}`);
    }

    const url = `${baseUrl}/api/v1/accounts/${accountId}?limit=1&order=asc&transactiontype=cryptotransfer&transactions=false`;
    const response = await fetch(url, {
      headers,
    });
    const json = await response.json();
    return PublicKey.fromString(json.key.key);
  }

  signPayload(payload: any, privateKey: PrivateKey) {
    const payloadBytes = new Uint8Array(Buffer.from(JSON.stringify(payload)));
    const signature = privateKey.sign(payloadBytes);
    return signature;
  }

  /**
   * Verify that the payload was signed by the account
   * @param accountId
   * @param accountSignature
   * @param payload
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
  static async verifySignature(
    ledgerId: LedgerId,
    accountId: string,
    accountSignature: Uint8Array,
    payload: { url: string; data: any }
  ): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    const payloadBytes = new Uint8Array(Buffer.from(JSON.stringify(payload)));

    const accountPublicKey = await this.getPublicKey(ledgerId, accountId);
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
  static async verifyAuthenticationSignatures(
    ledgerId: LedgerId,
    accountId: string,
    accountSignature: Uint8Array,
    serverSigningAccountId: string,
    serverSignature: Uint8Array,
    payload: { url: string; data: any }
  ): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    const { isValid: accountSignatureIsValid } = await this.verifySignature(
      ledgerId,
      accountId,
      accountSignature,
      payload
    );
    const { isValid: serverSignatureIsValid } = await this.verifySignature(
      ledgerId,
      serverSigningAccountId,
      serverSignature,
      payload
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

export class SignClientHelper {
  static getSessionForAccount(
    signClient: SignClient,
    ledgerId: LedgerId,
    accountId: string
  ) {
    const session = signClient.session.getAll().find((session_) => {
      const hasHederaNamespace = !!session_.namespaces.hedera;
      if (!hasHederaNamespace) {
        return false;
      }

      const chainId = ChainIdHelper.getChainIdFromSession(session_);
      const ledgerId_ = CAIPChainIdToLedgerId(chainId);
      const isCorrectLedgerId = ledgerId_.toString() === ledgerId.toString();

      if (!isCorrectLedgerId) {
        return false;
      }

      const account = `${chainId}:${accountId}`;
      const hasAccountId =
        !!session_.namespaces.hedera.accounts.includes(account);
      if (!hasAccountId) {
        return false;
      }

      return true;
    });

    if (!session) {
      throw new Error("Signer could not find session on sign client");
    }

    return session as SessionTypes.Struct & {
      namespaces: {
        hedera: {
          accounts: string[];
          chains: string[];
        };
      };
    };
  }

  static getSessionForTopic(signClient: SignClient, topic: string) {
    const session = signClient.session.getAll().find((session_) => {
      return session_.topic === topic;
    });

    if (!session) {
      throw new Error("Signer could not find session on sign client");
    }

    return session as SessionTypes.Struct & {
      namespaces: {
        hedera: {
          accounts: string[];
          chains: string[];
        };
      };
    };
  }

  static async createHederaWallet(
    signClient: SignClient,
    topic: string,
    accountId: string,
    privateKey: PrivateKey
  ) {
    const session = signClient.session.getAll().find((session) => {
      return session.topic === topic;
    });

    if (!session) {
      throw new Error("Session not found");
    }

    const chainId = ChainIdHelper.getChainIdFromSession(session);
    const ledgerId = CAIPChainIdToLedgerId(chainId);
    const hederaWallet = HederaWallet.init({
      accountId: accountId,
      privateKey: privateKey.toStringRaw(),
      network: ledgerId.toString() as any,
    });

    return hederaWallet;
  }

  static async sendAuthenticationRequest(
    signClient: SignClient,
    topic: string,
    serverSigningAccount: AccountId,
    serverSignature: Uint8Array,
    accountId: string,
    payload: { url: string; data: any }
  ) {
    const payload_ = Buffer.from(JSON.stringify(payload)).toString("base64");
    const serverSignature_ = Buffer.from(serverSignature).toString("base64");

    const session = this.getSessionForTopic(signClient, topic);

    const response = (await signClient.request({
      topic,
      chainId: session.namespaces.hedera.chains[0],
      request: {
        method: "hashpack_authenticate",
        params: {
          signerAccountId: accountId,
          serverSigningAccount: serverSigningAccount.toString(),
          serverSignature: serverSignature_,
          payload: payload_,
        },
      },
    })) as
      | {
          signerAccountId: string;
          signature: string;
        }
      | string;

    if (typeof response === "string") {
      throw new Error(response);
    }

    return new Uint8Array(Buffer.from(response.signature, "base64"));
  }
}
