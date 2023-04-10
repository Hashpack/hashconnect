import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";

const env = "testnet";
const appMetadata: HashConnectTypes.AppMetadata = {
  name: "Example dApp",
  description: "An example HashConnect dApp",
  icon: window.location.origin + "/favicon.ico",
  url: window.location.origin,
};

export const hc = new HashConnect();
export const getPairingData = () => {
  if (hc.hcData.pairingData.length > 0) {
    return hc.hcData.pairingData[hc.hcData.pairingData.length - 1];
  }
};
export const hcInitPromise = hc.init(appMetadata, env, false);

export const getProvider = async (accId: string) => {
  await hcInitPromise;
  const pairingData = getPairingData();
  if (!pairingData) {
    throw new Error("Pairing data is not set");
  }

  if (!pairingData.accountIds.includes(accId)) {
    throw new Error(`Account ${accId} is not paired`);
  }

  const provider = hc.getProvider(env, pairingData.topic, accId);
  return provider;
};

export const getSigner = async (accId: string) => {
  const provider = await getProvider(accId);
  const signer = hc.getSigner(provider);
  return signer;
};

export const sendTransaction = async (
  accountIdForSigning: string,
  trans: Uint8Array,
  return_trans: boolean = false,
  hideNfts: boolean = false
) => {
  await hcInitPromise;

  const pairingData = getPairingData();
  if (!pairingData) {
    throw new Error("Pairing data is not set");
  }
  if (pairingData.accountIds.indexOf(accountIdForSigning) === -1) {
    throw new Error(`Account ${accountIdForSigning} is not paired`);
  }

  const transaction: MessageTypes.Transaction = {
    topic: pairingData.topic,
    byteArray: trans,

    metadata: {
      accountToSign: accountIdForSigning,
      returnTransaction: return_trans,
      hideNft: hideNfts,
    },
  };

  const result = await hc.sendTransaction(pairingData.topic, transaction);
  return result;
};
