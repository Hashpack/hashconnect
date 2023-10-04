import { LedgerId } from "@hashgraph/sdk";
import { SignClientTypes, SessionTypes } from "@walletconnect/types";

const defaultChainId = 298;
const defaultLedgerId = LedgerId.LOCAL_NODE;
const ledgerIdToChainIdMappings: [LedgerId, number][] = [
  [LedgerId.MAINNET, 295],
  [LedgerId.TESTNET, 296],
  [LedgerId.PREVIEWNET, 297],
  [LedgerId.LOCAL_NODE, 298],
];

export const chainIdToLedgerId = (chainId: number): LedgerId => {
  for (let i = 0; i < ledgerIdToChainIdMappings.length; i++) {
    const [ledgerId, chainId_] = ledgerIdToChainIdMappings[i];
    if (chainId === chainId_) {
      return ledgerId;
    }
  }
  return defaultLedgerId;
};

export const ledgerIdToChainId = (ledgerId: LedgerId): number => {
  for (let i = 0; i < ledgerIdToChainIdMappings.length; i++) {
    const [ledgerId_, chainId] = ledgerIdToChainIdMappings[i];
    if (ledgerId === ledgerId_) {
      return chainId;
    }
  }
  return defaultChainId;
};

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

  const chainIdParts =
    proposal.params.requiredNamespaces.hedera.chains[0].split(":");
  const chainIdStr = chainIdParts[chainIdParts.length - 1];
  const chainId = Number.parseInt(chainIdStr!);

  if (!chainId || isNaN(chainId)) {
    throw new Error("Chain ID not found on proposal");
  }

  return chainId;
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

  const chainIdParts = session.namespaces.hedera.chains[0].split(":");
  const chainIdStr = chainIdParts[chainIdParts.length - 1];
  const chainId = Number.parseInt(chainIdStr!);

  if (!chainId || isNaN(chainId)) {
    throw new Error("Chain ID not found on session");
  }

  return chainId;
};
