import { useContext } from "react";
import { HashconnectTransactionHandler } from "./components/hashconnect/hashconnect-transaction-handler";
import { Router } from "./components/layout/Router";
import { HashConnectWalletContext } from "./context/hashconnect-wallet";

function App() {
  const { signerRequests } = useContext(HashConnectWalletContext);

  return (
    <>
      <Router />

      {signerRequests.map((signerRequest) => {
        return (
          <HashconnectTransactionHandler
            key={`${signerRequest.request.id}-${signerRequest.request.topic}`}
            signerRequest={signerRequest}
          />
        );
      })}
    </>
  );
}

export default App;
