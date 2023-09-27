/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Typography, Button } from "@mui/material";
import { boldFont } from "../theme";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useMutation, useQuery } from "@tanstack/react-query";
import useWeb3Store from "../utils/web3store";
import { WRAPPING_TOKEN_CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS, STAKING_TOKEN_NAME } from "../constants";
import { useEffect, useState, useRef } from "react";
import BigNumber from "bignumber.js";
import Countdown from "react-countdown";

export default function Jackpot() {
  const contract = useWeb3Store((state) => state.contract);
  const tokenContract = useWeb3Store((state) => state.tokenContract);

  const [jackpotAmount, setJackpotAmount] = useState(1305.44);
  const [totalLockValue, setTotalLockValue] = useState(130544);
  const [lastStaker, setLastStaker] = useState("0x0000000000000000000000000000000000000000");

  const [decimals, setDecimals] = useState(18);

  const query = useQuery(
    ["jackpotAmount"],
    async () => {
      const amount = await contract.jackpotAmount();
      const lastStaker = await contract.lastStaker();
      const decimal = await tokenContract.decimals();

      const leftoverRewards = await contract.leftoverRewards();
      const totalCompound = await contract.totalCompound();

      return { amount, leftoverRewards, totalCompound, lastStaker, decimal: JSON.parse(decimal) || 18 };
    },
    {
      onSuccess(data) {
        let amount = BigNumber(data.amount["_hex"]).dividedBy(Math.pow(10, data.decimal));

        if (amount.isGreaterThan(100)) {
          amount = amount.toFixed(2);
        } else if (amount.isGreaterThan(1)) {
          amount = amount.toFixed(4);
        } else if (amount.isLessThan(1)) {
          amount = amount.toPrecision(6);
        }
        setJackpotAmount(amount);

        let tvl = BigNumber(0)
          .plus(data.leftoverRewards["_hex"])
          .plus(data.totalCompound["_hex"])
          .dividedBy(Math.pow(10, data.decimal))
          .toFixed(2);
        setTotalLockValue(tvl);

        setLastStaker(data.lastStaker);
        setDecimals(data.decimal);
      },
      onError(error) {
        console.log(error);
      },
      enabled: !!contract && !!tokenContract,
    }
  );
  return (
    <Box
      sx={{
        width: "100%",
        // textAlign: "center",
        p: 5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ mt: -3 }}>
          {/* <Typography variant="h1" sx={{ fontWeight: "900", fontFamily: "Helvetica, serif", fontSize: 250 }}>
            <i>{STAKING_TOKEN_NAME}</i>
          </Typography> */}
        </Box>
        <Box sx={{ ml: 2 }}>
          <Typography variant="h4" sx={{ textTransform: "uppercase", fontFamily: boldFont.style.fontFamily, ml: 3 }}>
            Jackpot Amount
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: "900", fontSize: 180, fontFamily: "Helvetica", lineHeight: 0.8 }}>
            {jackpotAmount}
            <span style={{ fontSize: 102, marginLeft: 8 }}>{STAKING_TOKEN_NAME}</span>
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: "900", ml: 3, mt: 1 }}>
            in <Clock /> to
            <Box component="span" sx={{ color: "primary.main" }}>
              {lastStaker.slice(0, 10)}...{lastStaker.substring(lastStaker.length - 3)}
            </Box>
          </Typography>
        </Box>
        <Box
          sx={{
            ml: 2,
            height: "100%",
            width: 300,
            borderRadius: 5,
            p: 4,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginLeft: 5,
          }}
        >
          {/* <Typography variant="h4" sx={{ textTransform: "uppercase", fontFamily: boldFont.style.fontFamily, ml: 3 }}>
            TVL
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: "900", fontSize: 180, fontFamily: "Helvetica", lineHeight: 0.8 }}>
            {totalLockValue}
            <span style={{ fontSize: 102, marginLeft: 8 }}>{STAKING_TOKEN_NAME}</span>
          </Typography> */}

          {/* <Typography variant="h2" sx={{ lineHeight: 0.8 }}>
            <span style={{ fontSize: 45, marginRight: 8 }}>TVL:</span>
            {totalLockValue}
            <span style={{ fontSize: 45, marginLeft: 8 }}>{STAKING_TOKEN_NAME}</span>
          </Typography> */}
        </Box>
        {/* <Box
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
            marginLeft: 5,
          }}
        >
          <Typography variant="h2" sx={{ lineHeight: 0.8 }}>
            <span style={{ fontSize: 45, marginRight: 8 }}>TVL:</span>
            {totalLockValue}
            <span style={{ fontSize: 45, marginLeft: 8 }}>{STAKING_TOKEN_NAME}</span>
          </Typography>
        </Box> */}
      </Box>
    </Box>
  );
}

const Clock = () => {
  const contract = useWeb3Store((state) => state.contract);

  const [jackpotTime, setJackpotTime] = useState(0);
  const blockTimestamp = useWeb3Store((state) => state.blockTimestamp);

  const query = useQuery(
    ["time", "jackpot"],
    async () => {
      const tm = await contract.jackpotTime();
      return { tm };
    },
    {
      enabled: !!contract,
      onSuccess(data) {
        const difference = BigNumber(data.tm["_hex"]).minus(blockTimestamp).toNumber();

        if (difference < 0) {
          console.log("jackpot time is less than 0");
          setJackpotTime(0);
          return;
        }
        setJackpotTime(difference);
      },
    }
  );
  if (!!jackpotTime) return <Countdown date={Date.now() + jackpotTime * 1000} />;
  return <>00:00:00:00</>;
  return null;
};
