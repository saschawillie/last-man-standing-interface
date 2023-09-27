/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Typography, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import { boldFont } from "../theme";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useMutation, useQuery } from "@tanstack/react-query";
import useWeb3Store from "../utils/web3store";
import { WRAPPING_TOKEN_CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS, TOKEN_NAME } from "../constants";
import { useEffect, useState, useRef } from "react";
import BigNumber from "bignumber.js";
import Countdown from "react-countdown";

export default function GameInfo() {
  const [debug, setDebug] = useState(false);

  const connectedAccount = useWeb3Store((state) => state.connectedAccount);

  const contract = useWeb3Store((state) => state.contract);
  const tokenContract = useWeb3Store((state) => state.tokenContract);
  const underlyingContract = useWeb3Store((state) => state.underlyingContract);

  const [tokenAmount, setTokenAmount] = useState(0);
  const [underlyingAmount, setUnderlyingAmount] = useState(0);
  const [totalLockValue, setTotalLockValue] = useState(130544);

  const [tokenSymbol, setTokenSymbol] = useState(TOKEN_NAME);
  const [underlyingSymbol, setUnderlyingSymbol] = useState(TOKEN_NAME);

  const [decimals, setDecimals] = useState(18);

  const [contractTokenAmount, setContractTokenAmount] = useState(0);
  const [contractUnderlyingAmount, setContractUnderlyingAmount] = useState(0);

  const query = useQuery(
    ["gameInfo"],
    async () => {
      const decimal = await tokenContract.decimals();
      const leftoverRewards = await contract.leftoverRewards();
      const totalCompound = await contract.totalCompound();

      const _tokenAmount = await tokenContract.balanceOf(connectedAccount);
      const _underlyingAmount = await underlyingContract.balanceOf(connectedAccount);
      const _contractTokenAmount = await tokenContract.balanceOf(STAKING_CONTRACT_ADDRESS);
      const _contractUnderlyingAmount = await underlyingContract.balanceOf(WRAPPING_TOKEN_CONTRACT_ADDRESS);

      const tokenSymbol = await tokenContract.symbol();
      const underlyingSymbol = await underlyingContract.symbol();

      const searchParams = new URLSearchParams(location.search);
      const _debug = searchParams.get("debug");

      return {
        leftoverRewards,
        totalCompound,
        _debug,
        _tokenAmount,
        _underlyingAmount,
        _contractTokenAmount,
        _contractUnderlyingAmount,
        tokenSymbol,
        underlyingSymbol,
        decimal: JSON.parse(decimal) || 18,
      };
    },
    {
      onSuccess(data) {
        setDecimals(data.decimal);
        setDebug(data._debug);

        setTokenAmount(JSON.parse(BigNumber(data._tokenAmount["_hex"]).div(Math.pow(10, data.decimal))));
        setUnderlyingAmount(JSON.parse(BigNumber(data._underlyingAmount["_hex"]).div(Math.pow(10, data.decimal))));
        setContractTokenAmount(
          JSON.parse(BigNumber(data._contractTokenAmount["_hex"]).div(Math.pow(10, data.decimal)))
        );
        setContractUnderlyingAmount(
          JSON.parse(BigNumber(data._contractUnderlyingAmount["_hex"]).div(Math.pow(10, data.decimal)))
        );

        setTokenSymbol(data.tokenSymbol);
        setUnderlyingSymbol(data.underlyingSymbol);

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
          visibility: debug == undefined || !debug ? "hidden" : "visible",
        }}
      >
        <Box sx={{ ml: 2 }}>
          <Typography variant="h1" sx={{ fontWeight: "900", fontFamily: "Helvetica, serif", fontSize: 80 }}>
            <i>Game Info</i>
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: "400", fontSize: 60, fontFamily: "Helvetica", lineHeight: 0.8 }}>
            <span style={{ fontSize: 30, marginRight: 8 }}>TVL:</span>
            {totalLockValue}
            <span style={{ fontSize: 30, marginLeft: 8 }}>{TOKEN_NAME}</span>
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: "400", fontSize: 60, fontFamily: "Helvetica", lineHeight: 0.8 }}>
            <span style={{ fontSize: 30, marginRight: 8 }}>Token:</span>
            {contractTokenAmount}
            <span style={{ fontSize: 30, marginLeft: 8 }}>{tokenSymbol}</span>
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: "400", fontSize: 60, fontFamily: "Helvetica", lineHeight: 0.8 }}>
            <span style={{ fontSize: 30, marginRight: 8 }}>Underlying:</span>
            {contractUnderlyingAmount}
            <span style={{ fontSize: 30, marginLeft: 8 }}>{underlyingSymbol}</span>
          </Typography>
        </Box>
        <Box sx={{ ml: 2 }}>
          <Typography variant="h1" sx={{ fontWeight: "900", fontFamily: "Helvetica, serif", fontSize: 80 }}>
            <i>User Info</i>
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: "400", fontSize: 60, fontFamily: "Helvetica", lineHeight: 0.8 }}>
            <span style={{ fontSize: 30, marginRight: 8 }}>Token Amount:</span>
            {tokenAmount}
            <span style={{ fontSize: 30, marginLeft: 8 }}>{tokenSymbol}</span>
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: "400", fontSize: 60, fontFamily: "Helvetica", lineHeight: 0.8 }}>
            <span style={{ fontSize: 30, marginRight: 8 }}>Underlying Amount:</span>
            {underlyingAmount}
            <span style={{ fontSize: 30, marginLeft: 8 }}>{underlyingSymbol}</span>
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: "400", fontSize: 60, fontFamily: "Helvetica", lineHeight: 0.8 }}>
            &nbsp;
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
