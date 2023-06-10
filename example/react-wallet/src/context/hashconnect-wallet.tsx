import { Transaction } from "@hashgraph/sdk";
import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import { createContext, useCallback, useEffect, useState } from "react";

const env = "testnet";
const walletMetadata: HashConnectTypes.WalletMetadata = {
  name: "Example Wallet",
  description: "An example HashConnect wallet",
  icon: window.location.origin + "/favicon.ico",
};
const hc = new HashConnect(false);
const sendAuthenticationResponse = async (
  topic: string,
  response: MessageTypes.AuthenticationResponse
) => {
  const result = await hc.sendAuthenticationResponse(topic, response);
  return result;
};

const sendSigningResponse = async (
  topic: string,
  response: MessageTypes.SigningResponse
) => {
  const result = await hc.sendSigningResponse(topic, response);
  return result;
};

const sendTransactionResponse = async (
  topic: string,
  response: MessageTypes.TransactionResponse
) => {
  const result = await hc.sendTransactionResponse(topic, response);
  return result;
};

// Approve pairing

const approvePairing = async (pairingString: string, accounts: string[]) => {
  const pairingData: HashConnectTypes.PairingStringData =
    hc.decodePairingString(pairingString);

  return await hc.pair(pairingData, accounts, env);
};

export const HashConnectWalletContext = createContext({
  hc,
  pairingData: [] as HashConnectTypes.SavedPairingData[],
  transactionRequests: [] as MessageTypes.Transaction[],
  helpers: {
    sendAuthenticationResponse,
    sendSigningResponse,
    approvePairing,
    sendTransactionResponse,
  },
});

export const HashConnectWalletProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [pairingData, setPairingData] = useState<
    HashConnectTypes.SavedPairingData[]
  >([]);

  const [transactionRequests, setTransactionRequests] = useState<
    MessageTypes.Transaction[]
  >([]);

  useEffect(() => {
    // handle signing requests
    hc.transactionEvent.on((transactionRequest) => {
      const bytes = new Uint8Array(
        Buffer.from(transactionRequest.byteArray as string, "base64")
      );
      const transaction = Transaction.fromBytes(bytes);
      console.log({ transaction, transactionRequest });
      setTransactionRequests((prev) => [...prev, transactionRequest]);
    });
    hc.signRequestEvent.on((signingRequest) => {
      console.log("sign request");
    });
    hc.authRequestEvent.on((authRequest) => {
      console.log("auth request");
    });

    // set pairing data
    setPairingData(hc.hcData.pairingData);
    hc.pairingEvent.on(() => {
      hc.loadLocalData();
      setPairingData(hc.hcData.pairingData);
    });
    hc.connectionStatusChangeEvent.on(() => {
      hc.loadLocalData();
      setPairingData(hc.hcData.pairingData);
    });
    hc.acknowledgeMessageEvent.on(() => {
      hc.loadLocalData();
      setPairingData(hc.hcData.pairingData);
    });

    // initialize hashconnect
    hc.init(walletMetadata, env).then(() => {
      hc.loadLocalData();
      setPairingData(hc.hcData.pairingData);
    });

    return () => {
      setPairingData(hc.hcData.pairingData);
      hc.transactionEvent.offAll();
      hc.signRequestEvent.offAll();
      hc.authRequestEvent.offAll();
      hc.pairingEvent.offAll();
      hc.connectionStatusChangeEvent.offAll();
      hc.acknowledgeMessageEvent.offAll();
    };
  }, []);

  const sendTransactionResponseWrapped = useCallback(
    async (topic: string, response: MessageTypes.TransactionResponse) => {
      setTransactionRequests((prev) => {
        return prev.filter((prevTransactionRequest) => {
          return prevTransactionRequest.id !== response.id;
        });
      });
      return await sendTransactionResponse(topic, response);
    },
    [setTransactionRequests]
  );

  return (
    <HashConnectWalletContext.Provider
      value={{
        hc,
        pairingData,
        transactionRequests,
        helpers: {
          sendAuthenticationResponse,
          sendSigningResponse,
          approvePairing,
          sendTransactionResponse: sendTransactionResponseWrapped,
        },
      }}
    >
      {children}
    </HashConnectWalletContext.Provider>
  );
};
