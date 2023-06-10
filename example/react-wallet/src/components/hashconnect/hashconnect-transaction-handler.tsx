import { Client, PrivateKey, Transaction } from "@hashgraph/sdk";
import { Button, Dialog, Stack, Typography } from "@mui/material";
import { MessageTypes } from "hashconnect";
import { useCallback, useContext, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { HashConnectWalletContext } from "../../context/hashconnect-wallet";
import { AppStore } from "../../store";

// create a component that takes a hashgraph sdk transaction, signs it, and sends it to the hashconnect server using sendTransactionResponse from the helpers object
export const HashconnectTransactionHandler = (props: {
  transactionRequest: MessageTypes.Transaction;
}) => {
  const {
    privateKeys: { testnetPrivateKeys, mainnetPrivateKeys },
  } = useSelector((state: AppStore) => state);

  const { pairingData, helpers } = useContext(HashConnectWalletContext);
  const { transactionRequest } = props;
  const { byteArray, topic } = transactionRequest;
  const accountToSign = transactionRequest.metadata.accountToSign;

  const transaction = useMemo(() => {
    const bytes = new Uint8Array(Buffer.from(byteArray as string, "base64"));
    return Transaction.fromBytes(bytes);
  }, [byteArray]);

  const signAndExecute = useCallback(async () => {
    const pairingData_ = pairingData.find(
      (o) => o.topic === topic && o.accountIds.includes(accountToSign)
    );
    if (!pairingData_) {
      throw new Error("No pairing data found for topic and account id");
    }

    const privateKey =
      pairingData_.network === "testnet"
        ? testnetPrivateKeys.find((o) => o.accId === accountToSign)?.pk
        : mainnetPrivateKeys.find((o) => o.accId === accountToSign)?.pk;

    if (!privateKey) {
      throw new Error("No private key found for account id");
    }

    const signedTransaction = await transaction.sign(
      PrivateKey.fromString(privateKey)
    );
    const client = Client.forName(pairingData_.network, {
      scheduleNetworkUpdate: false,
    }).setOperator(accountToSign, privateKey);

    try {
      const txResult = await signedTransaction.execute(client);

      try {
        const txReceipt = await txResult.getReceipt(client);
        // const txRecord = await txResult.getRecord(client); // record will cost the user more HBAR to query

        const response: MessageTypes.TransactionResponse = {
          success: true,
          receipt: txReceipt.toBytes(),
          // record: txRecord.toBytes(),
          topic,
          signedTransaction: signedTransaction.toBytes(),
        };
        await helpers.sendTransactionResponse(topic, response);
      } catch (e) {
        console.warn(e);

        const response: MessageTypes.TransactionResponse = {
          success: true,
          topic,
          signedTransaction: signedTransaction.toBytes(),
          error: "Transaction succeeded, but failed to get receipt or record",
        };
        await helpers.sendTransactionResponse(topic, response);
      }
    } catch (e) {
      console.error(e);
      const response: MessageTypes.TransactionResponse = {
        success: false,
        topic,
      };
      await helpers.sendTransactionResponse(topic, response);
    }
  }, [
    pairingData,
    topic,
    accountToSign,
    transaction,
    helpers,
    testnetPrivateKeys,
    mainnetPrivateKeys,
  ]);

  const [open, setOpen] = useState(true);
  const [executing, setExecuting] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <Stack p={4} spacing={2}>
        <Typography variant="h5">
          Approve transaction for {accountToSign}
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          maxHeight="200px"
          border="1px solid #ccc"
          borderRadius="4px"
          p={2}
          sx={{
            whiteSpace: "pre-wrap",
            overflow: "auto",
          }}
        >
          {JSON.stringify(transaction, null, 2)}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            color={"blurple" as any}
            variant="contained"
            disabled={executing}
            onClick={async () => {
              if (executing) {
                return;
              }

              setExecuting(true);
              try {
                await signAndExecute();
                setOpen(false);
              } catch (e) {
                console.error(e);
              } finally {
                setExecuting(false);
              }
            }}
          >
            {executing ? "Executing..." : "Approve"}
          </Button>
          <Button
            color={"blurple" as any}
            variant="contained"
            onClick={() => {
              setOpen(false);
              const response: MessageTypes.TransactionResponse = {
                success: false,
                topic,
                error: "User denied transaction",
              };
              helpers.sendTransactionResponse(topic, response);
            }}
          >
            Deny
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};
