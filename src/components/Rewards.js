import { Box, Typography, TextField, Button } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useMutation, useQuery } from "@tanstack/react-query";
import useWeb3Store from "../utils/web3store";
import { WRAPPING_TOKEN_CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS, TOKEN_NAME } from "../constants";
import { useEffect, useState } from "react";
import { textFieldClasses } from "@mui/material";

function Timer() {
  return (
    <Box
      sx={{
        position: "absolute",
        right: 10,
        top: 10,
      }}
    >
      <AccessTimeIcon sx={{ fontSize: 50 }} />
    </Box>
  );
}
export default function Rewards() {
  const contract = useWeb3Store((state) => state.contract);
  const tokenContract = useWeb3Store((state) => state.tokenContract);
  const connectedAccount = useWeb3Store((state) => state.connectedAccount);
  const [apr, setApr] = useState(0);
  const [totalRewards, setTotalRewards] = useState(1024);

  const [isMeJackpotWinner, setIsMeJackpotWinner] = useState(false);
  const [decimals, setDecimals] = useState(18);
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
        console.log("===", data.isWinner);

        setDecimals(data.decimal);
        setIsMeJackpotWinner(data.isWinner);
        setApr(parseInt(JSON.parse(data.amount)) / 100);
        setTotalRewards(JSON.parse(data.totalRewards / Math.pow(10, data.decimal)).toPrecision(7));
      },
      onError(error) {
        console.log(error);
      },
      enabled: !!contract,
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
          width: 350,
          borderRadius: 5,
          p: 4,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box component="span" sx={{ display: "flex", alignItems: "flex-end", mb: 1, marginBottom: 5 }}>
          <Typography variant="h2" sx={{ lineHeight: 0.7, fontSize: 50 }}>
            {apr}%
          </Typography>
          <Typography variant="h6" sx={{ ml: 2 }}>
            APY
          </Typography>
        </Box>
        <Box component="span" sx={{ display: "flex", alignItems: "flex-end", mt: 2 }}>
          <Typography variant="h2" sx={{ lineHeight: 0.7, fontSize: 50 }}>
            {totalRewards}
          </Typography>
          <Typography variant="h4" sx={{ ml: 2 }}>
            {TOKEN_NAME}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-end", mt: 2, marginTop: 8 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => compound.mutate()}
            sx={{
              bgcolor: "white",
              color: "black",
              borderRadius: 5,
              py: 0.5,
              fontWeight: "900",
            }}
          >
            Compound
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => claim.mutate()}
            sx={{
              bgcolor: "white",
              color: "black",
              borderRadius: 5,
              ml: 2,
              py: 0.5,
              fontWeight: "900",
            }}
          >
            Claim&nbsp;Jackpot
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
