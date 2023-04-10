import { useContext } from "react";
import { HashconnectTransactionHandler } from "./components/hashconnect/hashconnect-transaction-handler";
import { Router } from "./components/layout/Router";
import { HashConnectWalletContext } from "./context/hashconnect-wallet";

function App() {
  // const { transactionRequests } = useContext(HashConnectWalletContext);

  return (
    <>
      <Router />

      {/* {transactionRequests.map((transactionRequest) => {
        return (
          <HashconnectTransactionHandler
            key={transactionRequest.id}
            transactionRequest={transactionRequest}
          />
        );
      })} */}
    </>
  );
}

export default App;
