import { Button, TextField, Box } from "@mui/material";
import useWeb3Store from "../utils/web3store";
import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TOKEN_NAME, WRAPPING_TOKEN_CONTRACT_ADDRESS } from "../constants";
import BigNumber from "bignumber.js";

export default function UnwrapButton({ setAccount, onConnect, width }) {
  const isConnected = useWeb3Store((state) => state.isConnected);
  const isInstalledWallet = useWeb3Store((state) => state.isInstalledWallet);

  const connectedAccount = useWeb3Store((state) => state.connectedAccount);
  const tokenContract = useWeb3Store((state) => state.tokenContract);

  const [unwrapValue, setUnwrapValue] = useState(0);
  const [amountWrapped, setAmountWrapped] = useState(0);
  const [decimals, setDecimals] = useState(18);

  const query = useQuery(
    ["unwrap"],
    async () => {
      const amount = await tokenContract.balanceOf(connectedAccount);
      const decimal = await tokenContract.decimals();
      return { amount, decimal: JSON.parse(decimal) || 18 };
    },
    {
      onSuccess: ({ amount, decimal }) => {
        setDecimals(decimal);

        setAmountWrapped(BigNumber(amount["_hex"]).dividedBy(Math.pow(10, decimal)).toPrecision(5));
      },
      onError: (error) => {
        console.log(error);
      },
      enabled: !!connectedAccount && !!tokenContract,
    }
  );

  const unwrap = useMutation(
    async () => {
      if (unwrapValue <= 0) return;

      const txn = await tokenContract.unwrap(BigInt(unwrapValue * Math.pow(10, decimals)), {
        gasLimit: BigInt(1000000),
      });
      await txn.wait();
    },
    {
      onSuccess: (data) => {
        query.refetch();
      },
    }
  );

  return (
    <Box sx={{ position: "relative", pt: 5, mt: 2 }}>
      <TextField
        id="filled-basic"
        variant="standard"
        color="secondary"
        focused
        sx={{
          width: "100%",
          fontSize: 70,
        }}
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        value={unwrapValue}
        onChange={(e) => setUnwrapValue(e.target.value)}
      />
      <Button
        variant="contained"
        size="large"
        sx={{
          bgcolor: "white",
          color: "black",
          borderRadius: 5,
          position: "absolute",
          right: 0,
          py: 0.5,
          bottom: 10,
          fontWeight: "900",
        }}
        disabled={!isConnected}
        onClick={() => unwrap.mutate()}
      >
        Unwrap {TOKEN_NAME}
      </Button>
    </Box>
  );
}
