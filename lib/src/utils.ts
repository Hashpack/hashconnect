import { SignClientTypes, SessionTypes } from "@walletconnect/types";

export const getChainIdFromProposal = (
  proposal: SignClientTypes.EventArguments["session_proposal"]
) => {
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
};

export const getChainIdFromSession = (session: SessionTypes.Struct) => {
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
};
