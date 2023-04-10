import { ContentCopy } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getConnectedAccountIds,
  hc,
  hcInitPromise,
} from "../../services/hashconnect";
import { actions, AppStore } from "../../store";

export const HashConnectClient = () => {
  const dispatch = useDispatch();
  const syncWithHashConnect = useCallback(() => {
    const connectedAccountIds = getConnectedAccountIds();
    console.log(connectedAccountIds);
    if (connectedAccountIds.length > 0) {
      dispatch(
        actions.hashconnect.setAccountIds(
          connectedAccountIds.map((o) => o.toString())
        )
      );
      dispatch(actions.hashconnect.setIsConnected(true));
      dispatch(actions.hashconnect.setPairingString(hc.pairingString ?? ""));
    } else {
      dispatch(actions.hashconnect.setAccountIds([]));
      dispatch(actions.hashconnect.setIsConnected(false));
      dispatch(actions.hashconnect.setPairingString(hc.pairingString ?? ""));
    }
  }, [dispatch]);

  syncWithHashConnect();
  hcInitPromise.then(() => {
    syncWithHashConnect();
  });
  hc.pairingEvent.on(() => {
    syncWithHashConnect();
  });
  hc.connectionStatusChangeEvent.on(() => {
    syncWithHashConnect();
  });
  return null;
};

export const HashConnectConnectButton = () => {
  const {
    isConnected,
    accountIds: connectedAccountIds,
    pairingString,
  } = useSelector((state: AppStore) => state.hashconnect);

  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (isConnected) {
      setOpen(false);
    }
  }, [isConnected]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  return (
    <Box>
      <Button
        color={"blurple" as any}
        variant="contained"
        onClick={async () => {
          if (isConnected) {
            await hcInitPromise;
            if (isConnected) {
              if (getConnectedAccountIds().length > 0) {
                hc.disconnect();
              }
            }
          } else {
            setOpen(true);
          }
        }}
      >
        {isConnected
          ? `Disconnect Account${connectedAccountIds.length > 1 ? "s" : ""}`
          : "Connect"}
      </Button>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => {
            setSnackbarOpen(false);
          }}
        >
          <Box
            sx={{
              bgcolor: "success.main",
              color: "white",
              p: 2,
              borderRadius: 1,
            }}
          >
            Copied to clipboard!
          </Box>
        </Snackbar>
        <Stack maxWidth="800px" spacing={4} p={4}>
          <Button
            color={"blurple" as any}
            variant="contained"
            onClick={async () => {
              await hcInitPromise;
              // hc.connectToLocalWallet();
            }}
          >
            Connect to Local Wallet
          </Button>

          <TextField
            variant="standard"
            color={"blurple" as any}
            value={pairingString}
            contentEditable={false}
            label="Pairing String"
            // add end adornment to copy the pairing string
            InputProps={{
              endAdornment: (
                // replace the below button with a copy to clipboard button icon
                <IconButton
                  color={"blurple" as any}
                  onClick={() => {
                    navigator.clipboard.writeText(pairingString);
                    setSnackbarOpen(true);
                  }}
                >
                  <ContentCopy />
                </IconButton>
              ),
            }}
          />
        </Stack>
      </Dialog>
    </Box>
  );
};