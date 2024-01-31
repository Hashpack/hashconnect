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

export const hc = new HashConnect(
    LedgerId.fromString(env),
    projectId,
    appMetadata,
    true
);
export const getConnectedAccountIds = () => {
    return hc.connectedAccountIds;
};
export const hcInitPromise = hc.init();

export const signTransaction = async (
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

    const result = await hc.signTransaction(accountIdForSigning, trans);
    return result;
};

export const executeTransaction = async (
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

export const signMessages = async (
    accountIdForSigning: AccountId,
    message: string
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

    const result = await hc.signMessages(accountIdForSigning, message);
    return result;
};
