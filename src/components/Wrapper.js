import { Box, Typography, TextField, Button } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useMutation, useQuery } from "@tanstack/react-query";
import useWeb3Store from "../utils/web3store";
import { WRAPPING_TOKEN_CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS, TOKEN_NAME } from "../constants";
import { useEffect, useState } from "react";
import { textFieldClasses } from "@mui/material";
import { ConnectWalletButton, AddWatchTokenButton, WrapButton, UnwrapButton } from "./";

export default function Wrapper() {
  const contract = useWeb3Store((state) => state.contract);
  const tokenContract = useWeb3Store((state) => state.tokenContract);
  const underlyingContract = useWeb3Store((state) => state.underlyingContract);
  const connectedAccount = useWeb3Store((state) => state.connectedAccount);

  const blockNumber = useWeb3Store((state) => state.blockNumber);

  const [apr, setApr] = useState(0);
  const [totalRewards, setTotalRewards] = useState(1024);

  const [isMeJackpotWinner, setIsMeJackpotWinner] = useState(false);
  const [decimals, setDecimals] = useState(18);

  const q1 = useQuery(
    ["isMeJackpotWinner"],
    async () => {
      const isWinner = await contract.isMeJackpotWinner();
      return { isWinner };
    },
    {
      onSuccess(data) {
        setIsMeJackpotWinner(data.isWinner);
      },
      onError(error) {
        console.log(error);
      },
      enabled: !!contract,
    }
  );

  const query = useQuery(
    ["apr"],
    async () => {
      const amount = await contract.getAPR();
      const isWinner = await contract.isMeJackpotWinner();
      const totalRewards = await contract.getReward(connectedAccount);
      const decimal = await tokenContract.decimals();
      return { amount, isWinner, totalRewards, decimal: JSON.parse(decimal) || 18 };
    },
    {
      onSuccess(data) {
        setDecimals(data.decimal);
        setIsMeJackpotWinner(data.isWinner);
        setApr(parseInt(JSON.parse(data.amount)) / 100);
        setTotalRewards(JSON.parse(data.totalRewards / Math.pow(10, data.decimal)).toPrecision(7));
      },
      onError(error) {
        console.log(error);
      },
      enabled: !!contract && !!tokenContract,
    }
  );

  const claim = useMutation(async () => {
    if (isMeJackpotWinner) {
      const txn = await contract.jackpotWinner(WRAPPING_TOKEN_CONTRACT_ADDRESS);
      await txn.wait();
      return txn.hash;
    }

    alert("You are not the winner!!");
  });

  const compound = useMutation(
    async () => {
      const txn = await contract.updateRewards();
      console.log("compounding rewards");

      await txn.wait();
      return txn.hash;
    },
    {
      onSuccess: (data) => {
        console.log(data);
        query.refetch();
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  return (
    <Box sx={{ p: 5, ml: 3, flexGrow: 1, height: "100%" }}>
      <Box
        sx={{
          border: "1px solid white",
          height: "100%",
          width: 300,
          borderRadius: 5,
          p: 4,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography variant="h2" sx={{ lineHeight: 0.8 }}>
          <span style={{ fontSize: 24, marginLeft: 4 }}>{TOKEN_NAME} Token Wrapper</span>
        </Typography>

        <WrapButton width={"100%"} />
        <UnwrapButton width={"100%"} />
      </Box>
    </Box>
  );
}
