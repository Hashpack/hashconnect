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
    messages: string[]
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

    const result = await hc.signMessages(accountIdForSigning, messages);
    return result;
};

export const authenticate = async (accountIdForSigning: AccountId) => {
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

    // random token to be signed by the server
    const token = Math.random().toString(36).substring(2, 15);
    const payload = {
        url: window.location.origin,
        data: {
            token,
        },
    };

    // simulate server signing a message by signing the payload as a string
    //   const serverSignatures = await hc.signMessages(accountIdForSigning, [
    //     JSON.stringify(payload),
    //   ]);
    //   const serverSignature = serverSignatures[0];

    // then actually authenticate
    const result = await hc.authenticate(
        accountIdForSigning
    );
    return result;
};
