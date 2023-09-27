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

export default function GameInfo() {
  const contract = useWeb3Store((state) => state.contract);
  const tokenContract = useWeb3Store((state) => state.tokenContract);

  const [totalLockValue, setTotalLockValue] = useState(130544);

  const [decimals, setDecimals] = useState(18);

  const query = useQuery(
    ["gameInfo"],
    async () => {
      const decimal = await tokenContract.decimals();
      const leftoverRewards = await contract.leftoverRewards();
      const totalCompound = await contract.totalCompound();

      return { leftoverRewards, totalCompound, decimal: JSON.parse(decimal) || 18 };
    },
    {
      onSuccess(data) {
        setDecimals(data.decimal);

        let tvl = BigNumber(0)
          .plus(data.leftoverRewards["_hex"])
          .plus(data.totalCompound["_hex"])
          .dividedBy(Math.pow(10, data.decimal))
          .toFixed(2);
        setTotalLockValue(tvl);
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
        mt: 9,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ ml: 2 }}>
          {/* <Typography variant="h1" sx={{ fontWeight: "400", fontSize: 80, fontFamily: "Helvetica", lineHeight: 0.8 }}>
            <span style={{ fontSize: 45, marginRight: 8 }}>TVL:</span>
            {totalLockValue}
            <span style={{ fontSize: 45, marginLeft: 8 }}>{TOKEN_NAME}</span>
          </Typography> */}
        </Box>
      </Box>
    </Box>
  );
}
