import { AccountId, LedgerId, Transaction } from "@hashgraph/sdk";
import { HashConnect } from "hashconnect";

const env = "testnet";
const appMetadata = {
  name: "Example dApp",
  description: "An example HashConnect dApp",
  icons: [window.location.origin + "/favicon.ico"],
  url: window.location.origin,
};
const projectId = "bfa190dbe93fcf30377b932b31129d05";

export const hc = new HashConnect(projectId, appMetadata, true);
export const getConnectedAccountIds = () => {
  return hc.connectedAccountIds;
};
export const hcInitPromise = hc.init(LedgerId.fromString(env));

export const sendTransaction = async (
  accountIdForSigning: AccountId,
  trans: Transaction
) => {
  await hcInitPromise;

  const accountIds = getConnectedAccountIds();
  if (!accountIds) {
    throw new Error("No connected accounts");
  }

  const isAccountIdForSigningPaired = accountIds.some(
    (id) => id.toString() === accountIdForSigning.toString()
  );
  if (!isAccountIdForSigningPaired) {
    throw new Error(`Account ${accountIdForSigning} is not paired`);
  }

  const result = await hc.sendTransaction(accountIdForSigning, trans);
  return result;
};
