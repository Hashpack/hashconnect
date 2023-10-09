import { AccountId, LedgerId } from "@hashgraph/sdk";
import { PrivateKeyResolver } from "./private-key-resolver";
import { Event } from "ts-typed-events";
import { HashConnectWalletSignerInterceptor } from "./hashconnect-wallet-signer-interceptor";
import SignClient from "@walletconnect/sign-client";
import { EngineTypes, SignClientTypes } from "@walletconnect/types";
import { MessageTypes } from "../types";
import {
  AuthenticationHelper,
  ChainIdHelper,
  SignClientHelper,
} from "../utils";
import {
  CAIPChainIdToLedgerId,
  HederaSignAndExecuteTransactionParams,
  HederaSignAndExecuteTransactionResponse,
  HederaSignAndReturnTransactionParams,
  HederaSignAndReturnTransactionResponse,
  HederaSignMessageParams,
  HederaSignMessageResponse,
  HederaWallet,
  base64StringToTransaction,
} from "@hgraph.io/hedera-walletconnect-utils";

global.Buffer = global.Buffer || require("buffer").Buffer;

export class HashConnectWallet {
  private _signClient?: SignClient;
  private _pkResolver: PrivateKeyResolver = async (
    _: LedgerId,
    __: AccountId
  ) => {
    throw new Error("No private key resolver defined");
  };
  private _signerInterceptor: HashConnectWalletSignerInterceptor = async (
    _
  ) => {
    throw new Error("No signer interceptor defined");
  };

  private readonly _proposals = new Map<
    number,
    SignClientTypes.EventArguments["session_proposal"]
  >();
  readonly pairingProposalEvent = new Event<MessageTypes.PairingProposal>();

  constructor(
    readonly projectId: string,
    readonly metadata: SignClientTypes.Metadata,
    private readonly _debug: boolean = false
  ) {}

  private async _onReceiveProposal(
    proposal: SignClientTypes.EventArguments["session_proposal"]
  ): Promise<void> {
    if (this._debug) {
      console.log("hashconnect - Received proposal", proposal);
    }

    const chainId = ChainIdHelper.getChainIdFromProposal(proposal);
    const ledgerId = CAIPChainIdToLedgerId(chainId);

    this._proposals.set(proposal.id, proposal);
    this.pairingProposalEvent.emit({
      proposalId: proposal.id,
      ledgerId: ledgerId,
      metadata: proposal.params.proposer.metadata,
    });
  }

  private async _createHederaWalletForSessionTopicAccount(
    topic: string,
    accountId: string
  ) {
    if (!this._signClient) {
      throw new Error("No sign client");
    }

    const session = SignClientHelper.getSessionForTopic(
      this._signClient,
      topic
    );
    const chainId = ChainIdHelper.getChainIdFromSession(session);
    const ledgerId = CAIPChainIdToLedgerId(chainId);

    const pk = await this._pkResolver(
      ledgerId,
      AccountId.fromString(accountId)
    );

    const hederaWallet = SignClientHelper.createHederaWallet(
      this._signClient,
      topic,
      accountId,
      pk
    );

    return hederaWallet;
  }

  private async _onReceiveRequest(
    request: SignClientTypes.EventArguments["session_request"]
  ): Promise<void> {
    if (this._debug) {
      console.log("hashconnect - Received request", request);
    }

    if (!this._signClient) {
      throw new Error("No sign client");
    }

    let executionSuccessPromiseResolver = (value: boolean) => {};
    const executionSuccessPromise = new Promise<boolean>((res) => {
      executionSuccessPromiseResolver = res;
    });

    const method = request.params.request.method;
    if (method === "hedera_signAndExecuteTransaction") {
      const params = request.params.request
        .params as HederaSignAndExecuteTransactionParams;

      const shouldSign = await this._signerInterceptor(
        {
          id: `${request.id}`,
          topic: request.topic,
          byteArray: params.transaction.bytes,
          metadata: {
            accountToSign: params.signerAccountId,
            returnTransaction: false,
          },
        },
        executionSuccessPromise
      );

      if (!shouldSign) {
        const wcResponse: EngineTypes.RespondParams = {
          topic: request.topic,
          response: {
            id: request.id,
            jsonrpc: "none",
            result: "rejected by user",
          },
        };
        await this._signClient.respond(wcResponse);
        return;
      }

      const hederaWallet = await this._createHederaWalletForSessionTopicAccount(
        request.topic,
        params.signerAccountId
      );
      const transaction = base64StringToTransaction(params.transaction.bytes);

      let result: HederaSignAndExecuteTransactionResponse | null = null;
      try {
        result = await hederaWallet.signAndExecuteTransaction(transaction);
        executionSuccessPromiseResolver(true);
      } catch (err) {
        console.error(err);
        executionSuccessPromiseResolver(false);
      }

      const wcResponse: EngineTypes.RespondParams = {
        topic: request.topic,
        response: {
          id: request.id,
          jsonrpc: transaction.transactionId?.toString() ?? "none",
          result: result ? result : "failed to sign and execute transaction",
        },
      };
      await this._signClient.respond(wcResponse);
    } else if (method === "hedera_signAndReturnTransaction") {
      const params = request.params.request
        .params as HederaSignAndReturnTransactionParams;

      const shouldSign = await this._signerInterceptor(
        {
          id: `${request.id}`,
          topic: request.topic,
          byteArray: params.transaction.bytes,
          metadata: {
            accountToSign: params.signerAccountId,
            returnTransaction: true,
          },
        },
        executionSuccessPromise
      );

      if (!shouldSign) {
        const wcResponse: EngineTypes.RespondParams = {
          topic: request.topic,
          response: {
            id: request.id,
            jsonrpc: "none",
            result: "rejected by user",
          },
        };
        await this._signClient.respond(wcResponse);
        return;
      }

      const hederaWallet = await this._createHederaWalletForSessionTopicAccount(
        request.topic,
        params.signerAccountId
      );
      const transaction = base64StringToTransaction(params.transaction.bytes);

      let result: HederaSignAndReturnTransactionResponse | null = null;
      try {
        result = await hederaWallet.signAndReturnTransaction(transaction);
        executionSuccessPromiseResolver(true);
      } catch (err) {
        console.error(err);
        executionSuccessPromiseResolver(false);
      }

      const wcResponse: EngineTypes.RespondParams = {
        topic: request.topic,
        response: {
          id: request.id,
          jsonrpc: transaction.transactionId?.toString() ?? "none",
          result: result ? result : "failed to sign and return transaction",
        },
      };
      await this._signClient.respond(wcResponse);
    } else if (method === "hedera_signMessage") {
      const params = request.params.request.params as HederaSignMessageParams;

      const signingRequest: MessageTypes.SigningRequest = {
        id: `${request.id}`,
        topic: request.topic,
        accountToSign: params.signerAccountId,
        payload: params.messages,
      };
      const shouldSign = await this._signerInterceptor(
        signingRequest,
        executionSuccessPromise
      );

      if (!shouldSign) {
        const wcResponse: EngineTypes.RespondParams = {
          topic: request.topic,
          response: {
            id: request.id,
            jsonrpc: "none",
            result: "rejected by user",
          },
        };
        await this._signClient.respond(wcResponse);
        return;
      }

      const hederaWallet = await this._createHederaWalletForSessionTopicAccount(
        request.topic,
        params.signerAccountId
      );

      let result: HederaSignMessageResponse | null = null;
      try {
        result = hederaWallet.signMessages(params.messages);
        executionSuccessPromiseResolver(true);
      } catch (err) {
        console.error(err);
        executionSuccessPromiseResolver(false);
      }

      const wcResponse: EngineTypes.RespondParams = {
        topic: request.topic,
        response: {
          id: request.id,
          jsonrpc: "none",
          result: result ? result : "failed to sign message",
        },
      };
      await this._signClient.respond(wcResponse);
    } else if (method === "hashpack_authenticate") {
      const params = request.params.request.params as {
        serverSigningAccount: string;
        serverSignature: string;
        signerAccountId: string;
        payload: string;
      };

      const signingRequest: MessageTypes.AuthenticationRequest = {
        id: `${request.id}`,
        topic: request.topic,
        accountToSign: params.signerAccountId,
        payload: JSON.parse(
          Buffer.from(params.payload, "base64").toString()
        ) as any,
        serverSignature: params.serverSignature,
        serverSigningAccount: params.serverSigningAccount,
      };
      const shouldSign = await this._signerInterceptor(
        signingRequest,
        executionSuccessPromise
      );

      if (!shouldSign) {
        const wcResponse: EngineTypes.RespondParams = {
          topic: request.topic,
          response: {
            id: request.id,
            jsonrpc: "none",
            result: "rejected by user",
          },
        };
        await this._signClient.respond(wcResponse);
        return;
      }

      const hederaWallet = await this._createHederaWalletForSessionTopicAccount(
        request.topic,
        params.signerAccountId
      );

      const session = SignClientHelper.getSessionForTopic(
        this._signClient,
        request.topic
      );

      const chainId = ChainIdHelper.getChainIdFromSession(session);
      const ledgerId = CAIPChainIdToLedgerId(chainId);
      const serverVerification = await AuthenticationHelper.verifySignature(
        ledgerId,
        params.serverSigningAccount,
        new Uint8Array(Buffer.from(params.serverSignature, "base64")),
        signingRequest.payload
      );
      if (!serverVerification.isValid) {
        executionSuccessPromiseResolver(false);
        const wcResponse: EngineTypes.RespondParams = {
          topic: request.topic,
          response: {
            id: request.id,
            jsonrpc: "none",
            result: "failed to verify server signature",
          },
        };
        await this._signClient.respond(wcResponse);
        return;
      }

      let result: HederaSignMessageResponse | null = null;
      try {
        result = hederaWallet.signMessages([params.payload]);
        executionSuccessPromiseResolver(true);
      } catch (err) {
        console.error(err);
        executionSuccessPromiseResolver(false);
      }

      const wcResponse: EngineTypes.RespondParams = {
        topic: request.topic,
        response: {
          id: request.id,
          jsonrpc: "none",
          result: result
            ? {
                signature: result.signatures[0],
              }
            : "failed to sign authenticate request",
        },
      };
      await this._signClient.respond(wcResponse);
    }
  }

  async init(options?: { pkResolver?: PrivateKeyResolver }): Promise<void> {
    if (this._debug) {
      console.log("hashconnect - Initializing");
    }

    if (!this._signClient) {
      this._signClient = await SignClient.init({
        projectId: this.projectId,
        metadata: this.metadata,
      });
    }

    this._signClient.on("session_proposal", (proposal) => {
      this._onReceiveProposal(proposal);
    });
    this._signClient.on("session_request", (request) => {
      this._onReceiveRequest(request);
    });

    if (options?.pkResolver) {
      this.setPkResolver(options.pkResolver);
    }

    if (this._debug) {
      console.log("hashconnect - Initialized");
    }
  }

  setPkResolver(pkResolver: PrivateKeyResolver) {
    this._pkResolver = pkResolver;
  }

  setSignerInterceptor(signerInterceptor: HashConnectWalletSignerInterceptor) {
    this._signerInterceptor = signerInterceptor;
  }

  async initPairing(uri: string) {
    if (this._debug) {
      console.log("hashconnect - Pairing");
    }

    if (!this._signClient) {
      throw new Error("No sign client");
    }

    const pairing = await this._signClient.pair({ uri });
    if (this._debug) {
      console.log({
        pairing,
      });
    }
  }

  async approvePairing(proposalId: number, accountIds: AccountId[]) {
    if (!this._signClient) {
      throw new Error("No sign client");
    }

    const proposal = this._proposals.get(proposalId);

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    await this._signClient.approve({
      id: proposal.id,
      namespaces: {
        hedera: {
          chains: proposal.params.requiredNamespaces.hedera.chains ?? [],
          events: proposal.params.requiredNamespaces.hedera.events ?? [],
          methods: proposal.params.requiredNamespaces.hedera.methods ?? [],
          accounts: accountIds.map(
            (accId) =>
              `${
                proposal.params.requiredNamespaces.hedera.chains![0]
              }:${accId.toString()}`
          ),
        },
      },
    });
  }

  async rejectPairing(proposalId: number) {
    if (!this._signClient) {
      throw new Error("No sign client");
    }

    const proposal = this._proposals.get(proposalId);

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    await this._signClient.reject({
      id: proposal.id,
      reason: {
        code: 401,
        message: "User rejected session proposal",
      },
    });
  }
}
