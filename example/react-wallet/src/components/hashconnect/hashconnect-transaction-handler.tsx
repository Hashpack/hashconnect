import { Button, Dialog, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { SignerRequest } from "../../context/hashconnect-wallet";
import { MessageTypes } from "hashconnect";

// create a component that takes a hashgraph sdk transaction, signs it, and sends it to the hashconnect server using sendTransactionResponse from the helpers object
export const HashconnectTransactionHandler = (props: {
  signerRequest: SignerRequest;
}) => {
  const { signerRequest } = props;

  const [open, setOpen] = useState(true);
  const [executing, setExecuting] = useState(false);

  const accountToSign = Object.hasOwn(signerRequest.request, "accountToSign")
    ? (signerRequest.request as MessageTypes.SigningRequest).accountToSign
    : (signerRequest.request as MessageTypes.Transaction).metadata
        .accountToSign;

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <Stack p={4} spacing={2}>
        <Typography variant="h5">
          Approve request for {accountToSign}
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
          {JSON.stringify(signerRequest, null, 2)}
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
                signerRequest.approve();
                const executionResult =
                  await signerRequest.executionSuccessPromise;
                if (!executionResult) {
                  throw new Error("Execution failed");
                }
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
              signerRequest.deny();
            }}
          >
            Deny
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};
