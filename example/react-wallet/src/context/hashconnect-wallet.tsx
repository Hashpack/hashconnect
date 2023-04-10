import { Transaction, AccountId, LedgerId, PrivateKey } from "@hashgraph/sdk";
import { HashConnectWallet, MessageTypes } from "hashconnect";
import { createContext, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppStore, actions } from "../store";

const env = "testnet";
const walletMetadata = {
  name: "Example Wallet",
  description: "An example HashConnect wallet",
  icons: [window.location.origin + "/favicon.ico"],
  url: "https://www.hashpack.app",
};
const hc = new HashConnectWallet(walletMetadata, true);
// const sendAuthenticationResponse = async (
//   topic: string,
//   response: MessageTypes.AuthenticationResponse
// ) => {
//   const result = await hc.sendAuthenticationResponse(topic, response);
//   return result;
// };

// const sendSigningResponse = async (
//   topic: string,
//   response: MessageTypes.SigningResponse
// ) => {
//   const result = await hc.sendSigningResponse(topic, response);
//   return result;
// };

// const sendTransactionResponse = async (
//   topic: string,
//   response: MessageTypes.TransactionResponse
// ) => {
//   const result = await hc.sendTransactionResponse(topic, response);
//   return result;
// };

// Approve pairing

const initPairing = async (pairingString: string) => {
  await hc.initPairing(pairingString);
};

const approvePairing = async (pairingId: number, accounts: string[]) => {
  await hc.approvePairing(
    pairingId,
    accounts.map((o) => AccountId.fromString(o))
  );
};

export const HashConnectWalletContext = createContext({
  hc,
  proposals: [] as MessageTypes.PairingProposal[],
  // transactionRequests: [] as MessageTypes.Transaction[],
  helpers: {
    // sendAuthenticationResponse,
    // sendSigningResponse,
    initPairing,
    approvePairing,
    // sendTransactionResponse,
  },
});

export const HashConnectWalletProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { privateKeys } = useSelector((state: AppStore) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedPks = localStorage.getItem("privateKeys");
    if (storedPks) {
      dispatch(actions.privateKeys.restorePks(JSON.parse(storedPks)));
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("privateKeys", JSON.stringify(privateKeys));
  }, [privateKeys]);

  const [pairingProposals, setPairingProposals] = useState<
    MessageTypes.PairingProposal[]
  >([]);

  const pkResolver = useCallback(
    async (ledgerId: LedgerId, accountId: AccountId) => {
      const networkString = ledgerId.toString().toLocaleLowerCase();
      if (networkString === "testnet") {
        const pk = privateKeys.testnetPrivateKeys.find(
          (pk) => pk.accId === accountId.toString()
        );
        if (pk) {
          return PrivateKey.fromString(pk.pk);
        }
      } else if (networkString === "mainnet") {
        const pk = privateKeys.mainnetPrivateKeys.find(
          (pk) => pk.accId === accountId.toString()
        );
        if (pk) {
          return PrivateKey.fromString(pk.pk);
        }
      }

      throw new Error("Private key not found");
    },
    [privateKeys]
  );

  useEffect(() => {
    // initialize hashconnect
    hc.init();

    const pairingProposalCallback = (
      proposal: MessageTypes.PairingProposal
    ) => {
      setPairingProposals((prev) => [...prev, proposal]);
    };
    hc.pairingProposalEvent.on(pairingProposalCallback);

    return () => {
      hc.pairingProposalEvent.off(pairingProposalCallback);
    };
  }, []);

  useEffect(() => {
    hc.setPkResolver(pkResolver);
  }, [pkResolver]);

  return (
    <HashConnectWalletContext.Provider
      value={{
        hc,
        proposals: pairingProposals,
        helpers: {
          approvePairing,
          initPairing,
        },
      }}
    >
      {children}
    </HashConnectWalletContext.Provider>
  );
};
