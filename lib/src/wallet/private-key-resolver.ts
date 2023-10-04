import { LedgerId, AccountId, PrivateKey } from "@hashgraph/sdk";

export type PrivateKeyResolver = (
  ledgerId: LedgerId,
  accountId: AccountId
) => Promise<PrivateKey>;
