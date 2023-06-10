import {
  Box,
  Button,
  Dialog,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useContext, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { HashConnectWalletContext } from "../../context/hashconnect-wallet";
import { AppStore } from "../../store";

export const HashConnectPairingsButton = () => {
  const {
    privateKeys: { testnetPrivateKeys, mainnetPrivateKeys },
  } = useSelector((state: AppStore) => state);
  const { hc, helpers } = useContext(HashConnectWalletContext);

  const [pairingString, setPairingString] = useState("");

  const pairingStringPairingData = useMemo(() => {
    try {
      return hc?.decodePairingString(pairingString) ?? null;
    } catch {
      return null;
    }
  }, [hc, pairingString]);

  const [open, setOpen] = useState(false);

  const pairableAccountIds = useMemo(() => {
    if (!pairingStringPairingData) {
      return [];
    }

    const isTestnet = pairingStringPairingData.network === "testnet";
    if (isTestnet) {
      return testnetPrivateKeys.map((o) => o.accId);
    } else {
      return mainnetPrivateKeys.map((o) => o.accId);
    }
  }, [pairingStringPairingData, testnetPrivateKeys, mainnetPrivateKeys]);

  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const selectedAccountIdsFiltered = selectedAccountIds.filter((id) =>
    pairableAccountIds.includes(id)
  );

  return (
    <Box>
      <Button
        color={"blurple" as any}
        variant="contained"
        onClick={() => {
          setOpen(true);
        }}
      >
        Pair
      </Button>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Stack maxWidth="800px" spacing={2} p={4}>
          <TextField
            variant="standard"
            color={"blurple" as any}
            value={pairingString}
            onChange={(e) => {
              setPairingString(e.target.value);
            }}
            label="Pairing String"
          />

          <Select
            multiple
            color={"blurple" as any}
            value={selectedAccountIdsFiltered}
            onChange={(e) => {
              setSelectedAccountIds(e.target.value as string[]);
            }}
          >
            {pairableAccountIds.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            color={"blurple" as any}
            disabled={pairableAccountIds.length === 0}
            onClick={async () => {
              await helpers.approvePairing(
                pairingString,
                selectedAccountIdsFiltered
              );
              setOpen(false);
            }}
          >
            Pair
          </Button>
        </Stack>
      </Dialog>
    </Box>
  );
};
