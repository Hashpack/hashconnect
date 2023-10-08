import { AccountId, LedgerId, PrivateKey } from "@hashgraph/sdk";
import { HashConnectWallet, MessageTypes } from "hashconnect";
import { createContext, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppStore, actions } from "../store";

const projectId = "20b7ba9c31e88f674fca101479b6c898";
const walletMetadata = {
  name: "Example Wallet",
  description: "An example HashConnect wallet",
  icons: [window.location.origin + "/favicon.ico"],
  url: "https://www.hashpack.app",
};
const hc = new HashConnectWallet(projectId, walletMetadata, true);

const initPairing = async (pairingString: string) => {
  await hc.initPairing(pairingString);
};

const approvePairing = async (pairingId: number, accounts: string[]) => {
  await hc.approvePairing(
    pairingId,
    accounts.map((o) => AccountId.fromString(o))
  );
};

export interface SignerRequest {
  request:
    | MessageTypes.Transaction
    | MessageTypes.SigningRequest
    | MessageTypes.AuthenticationRequest;
  executionSuccessPromise: Promise<boolean>;
  approve: () => void;
  deny: () => void;
}

export const HashConnectWalletContext = createContext({
  hc,
  proposals: [] as MessageTypes.PairingProposal[],
  signerRequests: [] as SignerRequest[],
  helpers: {
    initPairing,
    approvePairing,
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

  const [signerRequests, setSignerRequests] = useState<SignerRequest[]>([]);

  console.log({
    signerRequests,
  });

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
    hc.setSignerInterceptor((request, executionSuccessPromise) => {
      // when execution is successful, remove the request from signerRequests
      executionSuccessPromise.then((success) => {
        if (success) {
          setSignerRequests((prev) =>
            prev.filter(
              (o) =>
                !(
                  o.request.id === request.id &&
                  o.request.topic === request.topic
                )
            )
          );
        }
      });

      return new Promise((resolve) => {
        setSignerRequests((prev) => [
          ...prev,
          {
            request,
            executionSuccessPromise,
            approve: () => {
              resolve(true);
            },
            deny: () => {
              resolve(false);
            },
          },
        ]);
      });
    });

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
        signerRequests,
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
