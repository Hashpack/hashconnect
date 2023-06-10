import { PrivateKey } from "@hashgraph/sdk";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { Fragment, useContext, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HashConnectWalletContext } from "../context/hashconnect-wallet";
import { actions, AppStore } from "../store";

const pkToAccountId = async (pkString: string, network: string) => {
  const pk = PrivateKey.fromString(pkString);
  const baseUrl =
    network === "mainnet"
      ? "https://mainnet-public.mirrornode.hedera.com/"
      : "https://testnet.mirrornode.hedera.com/";
  const url =
    baseUrl + "api/v1/accounts?account.publickey=" + pk.publicKey.toStringRaw();

  const response = await fetch(url);
  const data = await response.json();
  return data?.accounts?.[0]?.account as string | undefined;
};

export const Home = () => {
  const {
    privateKeys: { testnetPrivateKeys, mainnetPrivateKeys },
  } = useSelector((state: AppStore) => state);

  const { pairingData } = useContext(HashConnectWalletContext);

  const dispatch = useDispatch();
  const [pk, setPk] = useState("");

  const isPkValid = useMemo(() => {
    try {
      PrivateKey.fromString(pk).toAccountId(0, 0);
      return true;
    } catch {
      return false;
    }
  }, [pk]);

  return (
    <Stack spacing={8}>
      <Stack spacing={1}>
        <Typography variant="h2">Pairings</Typography>
        {pairingData.map((pd) => (
          <Fragment key={pd.topic}>
            <Typography variant="h4">{pd.metadata.name}</Typography>
            {pd.accountIds.map((accountId) => (
              <Typography
                key={accountId}
                sx={{
                  wordBreak: "break-all",
                }}
              >
                Account ID: {accountId}
              </Typography>
            ))}
          </Fragment>
        ))}
        {pairingData.length === 0 && <Typography>NONE</Typography>}
      </Stack>

      <Stack spacing={1} maxWidth="1000px">
        <Typography variant="h2">Imported Wallets</Typography>
        <Typography variant="h4">Mainnet</Typography>
        {mainnetPrivateKeys.map((o) => (
          <Typography key={o.accId}>Account ID: {o.accId}</Typography>
        ))}
        {mainnetPrivateKeys.length === 0 && <Typography>NONE</Typography>}
        <Typography variant="h4">Testnet</Typography>
        {testnetPrivateKeys.map((o) => (
          <Typography key={o.accId}>Account ID: {o.accId}</Typography>
        ))}
        {testnetPrivateKeys.length === 0 && <Typography>NONE</Typography>}

        <Stack spacing={1}>
          <TextField
            color={"blurple" as any}
            label="Private Key"
            type="password"
            value={pk}
            onChange={(e) => {
              setPk(e.target.value);
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color={"blurple" as any}
              disabled={!isPkValid}
              onClick={async () => {
                const accId = await pkToAccountId(pk, "mainnet");
                if (accId) {
                  dispatch(
                    actions.privateKeys.addMainnetKey({
                      pk,
                      accId,
                    })
                  );
                  setPk("");
                }
              }}
            >
              Add Mainnet Account
            </Button>
            <Button
              variant="contained"
              color={"blurple" as any}
              disabled={!isPkValid}
              onClick={async () => {
                const accId = await pkToAccountId(pk, "testnet");
                if (accId) {
                  dispatch(
                    actions.privateKeys.addTestnetKey({
                      pk,
                      accId,
                    })
                  );
                  setPk("");
                }
              }}
            >
              Add Testnet Account
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
