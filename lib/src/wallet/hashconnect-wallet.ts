import { AccountId, LedgerId, Signer, Transaction } from "@hashgraph/sdk";
import { PrivateKeyResolver } from "./private-key-resolver";
import { Event } from "ts-typed-events";
import { HashconnectWalletSignerFactory } from "./hashconnect-wallet-signer-factory";
import { HashConnectWalletSignerInterceptor } from "./hashconnect-wallet-signer-interceptor";
import SignClient from "@walletconnect/sign-client";
import { EngineTypes, SignClientTypes } from "@walletconnect/types";
import { MessageTypes } from "../types";
import { chainIdToLedgerId, getChainIdFromProposal } from "../utils";

global.Buffer = global.Buffer || require("buffer").Buffer;

export class HashConnectWallet {
  private _signClient?: SignClient;
  private _signers: Signer[] = [];
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

    const chainId = getChainIdFromProposal(proposal);
    const ledgerId = chainIdToLedgerId(chainId);

    this._proposals.set(proposal.id, proposal);
    this.pairingProposalEvent.emit({
      proposalId: proposal.id,
      ledgerId: ledgerId,
      metadata: proposal.params.proposer.metadata,
    });
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

    const { method, params } = request.params.request;
    if (method === "hedera_signAndExecuteTransaction") {
      const decoded = Buffer.from(params?.transaction?.bytes, "base64");
      const transaction = Transaction.fromBytes(decoded);

      const signer = this._signers[0];
      const response = await signer.call(transaction);

      const wcResponse: EngineTypes.RespondParams = {
        topic: request.topic,
        response: {
          id: request.id,
          jsonrpc: response.transactionId.toString(),
          result: response.toJSON(),
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

    const chainId = getChainIdFromProposal(proposal);

    const signers = [];
    for (const accountId of accountIds) {
      const ledgerId = chainIdToLedgerId(chainId);
      const signer = await HashconnectWalletSignerFactory.createSigner(
        this.metadata,
        ledgerId,
        accountId,
        this._signerInterceptor,
        this._pkResolver,
        this._debug
      );
      signers.push(signer);
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
    this._signers = signers;
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
