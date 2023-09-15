/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Typography, Button } from "@mui/material";
import { boldFont } from "../theme";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useMutation, useQuery } from "@tanstack/react-query";
import useWeb3Store from "../utils/web3store";
import { WRAPPING_TOKEN_CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS, TOKEN_NAME } from "../constants";
import { useEffect, useState, useRef } from "react";
import BigNumber from "bignumber.js";
import Countdown from "react-countdown";

export default function Jackpot() {
  const contract = useWeb3Store((state) => state.contract);
  const tokenContract = useWeb3Store((state) => state.tokenContract);

  const [jackpotAmount, setJackpotAmount] = useState(1305.44);
  const [lastStaker, setLastStaker] = useState("0x0000000000000000000000000000000000000000");

  const [decimals, setDecimals] = useState(18);

  const query = useQuery(
    ["jackpotAmount"],
    async () => {
      const amount = await contract.jackpotAmount();
      const lastStaker = await contract.lastStaker();
      const decimal = await tokenContract.decimals();

      return { amount, lastStaker, decimal: JSON.parse(decimal) || 18 };
    },
    {
      onSuccess(data) {
        setJackpotAmount(BigNumber(data.amount["_hex"]).dividedBy(Math.pow(10, data.decimal)).toPrecision(7));
        setLastStaker(data.lastStaker);
        setDecimals(data.decimal);
      },
      onError(error) {
        console.log(error);
      },
      enabled: !!contract,
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
          {/* <Typography variant="h1" sx={{ fontWeight: "900", fontFamily: 'Helvetica, serif', fontSize: 250 }}>
                        <i>{TOKEN_NAME}</i>
                    </Typography> */}
        </Box>
        <Box sx={{ ml: 2 }}>
          <Typography variant="h4" sx={{ textTransform: "uppercase", fontFamily: boldFont.style.fontFamily, ml: 3 }}>
            Jackpot Amount
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: "900", fontSize: 180, fontFamily: "Helvetica", lineHeight: 0.8 }}>
            {jackpotAmount}
            <span style={{ fontSize: 102, marginLeft: 8 }}>{TOKEN_NAME}</span>
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: "900", ml: 3, mt: 1 }}>
            in <Clock /> to
            <Box component="span" sx={{ color: "primary.main" }}>
              {" "}
              {lastStaker.slice(0, 10)}...{lastStaker.substring(lastStaker.length - 3)}
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

const Clock = () => {
  const [jackpotTime, setJackpotTime] = useState(0);
  const contract = useWeb3Store((state) => state.contract);
  const blockTimestamp = useWeb3Store((state) => state.blockTimestamp);
  const query = useQuery(
    ["time", "jackpot"],
    async () => {
      console.log("querying jackpot time");
      const amount = await contract.jackpotTime();
      return amount;
    },
    {
      enabled: !!contract,
      onSuccess(data) {
        console.log("jackpot time", BigNumber(data["_hex"]).toNumber(), "block time", blockTimestamp);
        const difference = BigNumber(data["_hex"]).minus(blockTimestamp).toNumber();
        console.log("difference", difference);

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
