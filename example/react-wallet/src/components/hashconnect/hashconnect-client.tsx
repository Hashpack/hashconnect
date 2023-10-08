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
  const { helpers, proposals } = useContext(HashConnectWalletContext);

  const [pairingString, setPairingString] = useState("");

  const [open, setOpen] = useState(false);

  const currentProposal = proposals[proposals.length - 1];
  const pairableAccountIds = useMemo(() => {
    return currentProposal
      ? currentProposal.ledgerId.toString().toLowerCase() === "testnet"
        ? testnetPrivateKeys.map((o) => o.accId)
        : mainnetPrivateKeys.map((o) => o.accId)
      : [];
  }, [currentProposal, testnetPrivateKeys, mainnetPrivateKeys]);

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
              helpers.initPairing(e.target.value);
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
                currentProposal.proposalId,
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
