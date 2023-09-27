/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Typography, TextField, Button } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useMutation, useQuery } from "@tanstack/react-query";
import useWeb3Store from "../utils/web3store";
import { WRAPPING_TOKEN_CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS, TOKEN_NAME } from "../constants";
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { useQueryClient } from "@tanstack/react-query";
import Countdown from "react-countdown";

export default function Staker() {
  const contract = useWeb3Store((state) => state.contract);
  const tokenContract = useWeb3Store((state) => state.tokenContract);
  const connectedAccount = useWeb3Store((state) => state.connectedAccount);
  const queryClient = useQueryClient();
  const [values, setValues] = useState({ stake: 0, unstake: 0 });
  const [amountInvested, setamountInvested] = useState(0);
  const [decimals, setDecimals] = useState(18);
  const query = useQuery(
    ["stake"],
    async () => {
      const amount = await contract.balances(connectedAccount);
      const decimal = await tokenContract.decimals();
      return { amount, decimal: JSON.parse(decimal) || 18 };
    },
    {
      onSuccess: ({ amount, decimal }) => {
        setDecimals(decimal);

        setamountInvested(BigNumber(amount["_hex"]).dividedBy(Math.pow(10, decimal)).toPrecision(5));
        // setamountInvested(data);
      },
      onError: (error) => {
        console.log(error);
      },
      enabled: !!connectedAccount && !!contract && !!tokenContract,
    }
  );
  const stake = useMutation(
    async () => {
      if (values.stake == 0) return;
      const approval = await tokenContract.approve(
        STAKING_CONTRACT_ADDRESS,
        BigInt(values.stake * Math.pow(10, decimals)),
        {
          gasLimit: BigInt(1000000),
        }
      );
      approval.wait();
      const txn = await contract.stakeTokens(
        WRAPPING_TOKEN_CONTRACT_ADDRESS,
        BigInt(values.stake * Math.pow(10, decimals)),
        {
          gasLimit: BigInt(1000000),
        }
      );
      await txn.wait();
    },
    {
      onSuccess: (data) => {
        query.refetch();
        queryClient.refetchQueries(["time"], { type: "active" });
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );
  const unstake = useMutation(
    async () => {
      // if (values.unstake == 0) return;
      // const txn = await contract.unstakeTokens(
      //   WRAPPING_TOKEN_CONTRACT_ADDRESS,
      //   BigInt(values.unstake * Math.pow(10, decimals)),
      //   {
      //     gasLimit: BigInt(1000000),
      //   }
      // );
      // await txn.wait();

      const txn = await contract.unstakeAllTokens(WRAPPING_TOKEN_CONTRACT_ADDRESS, {
        gasLimit: BigInt(1000000),
      });
      await txn.wait();
    },
    {
      onSuccess: (data) => {
        query.refetch();
        queryClient.refetchQueries(["time"], { type: "active" });
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
          p: 2,
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "relative",
            p: 2,
          }}
        >
          <Typography variant="h2" sx={{ lineHeight: 0.8 }}>
            {amountInvested}
            <span style={{ fontSize: 24, marginLeft: 4 }}>{TOKEN_NAME}</span>
          </Typography>
          <Typography variant="body1">Amount Invested</Typography>
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
              value={values.stake}
              onChange={(e) => setValues({ ...values, stake: e.target.value })}
            />
            <Button
              variant="contained"
              size="large"
              onClick={() => stake.mutate()}
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
            >
              Stake {TOKEN_NAME}
            </Button>
          </Box>
          <Box sx={{ position: "relative", pt: 5, margin: "auto" }}>
            <TextField
              id="filled-basic"
              variant="standard"
              color="secondary"
              // focused
              // value={values.unstake}
              // inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              // onChange={(e) => setValues({ ...values, unstake: e.target.value })}
              sx={{
                width: "100%",
                fontSize: 70,
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={() => unstake.mutate()}
              sx={{
                bgcolor: "white",
                color: "black",
                borderRadius: 5,
                position: "absolute",
                right: 0,
                py: 0.5,
                width: "100%",
                bottom: 10,
                fontWeight: "900",
              }}
            >
              Unstake & Claim All
            </Button>
          </Box>
        </Box>
        <Timer />
      </Box>
    </Box>
  );
}

function Timer() {
  const connectedAccount = useWeb3Store((state) => state.connectedAccount);

  const contract = useWeb3Store((state) => state.contract);
  const blockTimestamp = useWeb3Store((state) => state.blockTimestamp);

  const [stakingTime, setStakingTime] = useState(0);
  const query = useQuery(
    ["time", "staking"],
    async () => {
      const tm = await contract.minimumStakingTime(connectedAccount);
      return { tm };
    },
    {
      enabled: !!contract,
      onSuccess(data) {
        const difference = BigNumber(data.tm["_hex"]).minus(blockTimestamp).toNumber();
        if (difference < 0 || blockTimestamp <= 0) {
          console.log("staking time is less than 0");
          setStakingTime(0);
          return;
        }
        setStakingTime(difference);
      },
    }
  );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      <AccessTimeIcon />
      {stakingTime ? <Countdown date={Date.now() + stakingTime * 1000} /> : <>00:00:00:00</>}
    </div>
  );
}
