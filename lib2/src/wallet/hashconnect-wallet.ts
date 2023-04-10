import {
  DAppMetadata,
  WalletConnector,
  getLedgerIdByChainId,
} from "@hashgraph/hedera-wallet-connect";
import { AccountId, LedgerId } from "@hashgraph/sdk";
import { SignClientTypes } from "@walletconnect/types";
import { PrivateKeyResolver } from "./private-key-resolver";
import { MessageTypes } from "../types";
import { Event } from "ts-typed-events";
import { HashconnectWalletSignerFactory } from "./hashconnect-wallet-signer-factory";

global.Buffer = global.Buffer || require("buffer").Buffer;

export class HashConnectWallet {
  private readonly _walletConnector: WalletConnector;
  private _pkResolver: PrivateKeyResolver = async (
    _: LedgerId,
    __: AccountId
  ) => {
    throw new Error("No private key resolver defined");
  };

  private readonly _proposals = new Map<
    number,
    SignClientTypes.EventArguments["session_proposal"]
  >();
  readonly pairingProposalEvent = new Event<MessageTypes.PairingProposal>();

  constructor(
    readonly metadata: DAppMetadata,
    private readonly _debug: boolean = false
  ) {
    this._walletConnector = new WalletConnector(metadata);
  }

  private async _onProposalReceive(
    proposal: SignClientTypes.EventArguments["session_proposal"]
  ): Promise<void> {
    if (this._debug) {
      console.log("hashconnect - Received proposal", proposal);
    }

    const chainId =
      proposal.params.requiredNamespaces.hedera.chains?.[0]?.split(":")[1];
    if (!chainId) {
      throw new Error("Chain ID not found on proposal");
    }
    const ledgerId = getLedgerIdByChainId(chainId);

    this._proposals.set(proposal.id, proposal);
    this.pairingProposalEvent.emit({
      proposalId: proposal.id,
      ledgerId: LedgerId.fromString(ledgerId),
      metadata: proposal.params.proposer.metadata,
    });
  }

  async init(options?: { pkResolver?: PrivateKeyResolver }): Promise<void> {
    if (this._debug) {
      console.log("hashconnect - Initializing");
    }

    if (options?.pkResolver) {
      this.setPkResolver(options.pkResolver);
    }

    await this._walletConnector.init((proposal: any) =>
      this._onProposalReceive(proposal)
    );
  }

  setPkResolver(pkResolver: PrivateKeyResolver) {
    this._pkResolver = pkResolver;
  }

  async initPairing(uri: string) {
    if (this._debug) {
      console.log("hashconnect - Pairing");
    }

    const pairing = await this._walletConnector.pair(uri);
    if (this._debug) {
      console.log({
        pairing,
      });
    }
  }

  async approvePairing(proposalId: number, accountIds: AccountId[]) {
    const proposal = this._proposals.get(proposalId);

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    const signers = [];
    const chainId =
      proposal.params.requiredNamespaces.hedera.chains?.[0]?.split(":")[1];
    if (!chainId) {
      throw new Error("Chain ID not found on proposal");
    }
    for (const accountId of accountIds) {
      const ledgerId = getLedgerIdByChainId(chainId);
      const signer = await HashconnectWalletSignerFactory.createSigner(
        LedgerId.fromString(ledgerId),
        accountId,
        this._pkResolver,
        this._debug
      );
      signers.push(signer);
    }

    await this._walletConnector.approveSessionProposal(
      {
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
      },
      signers
    );
  }

  async rejectPairing(proposalId: number) {
    const proposal = this._proposals.get(proposalId);

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    await this._walletConnector.rejectSessionProposal({
      id: proposal.id,
      reason: {
        code: 401,
        message: "User rejected session proposal",
      },
    });
  }
}
