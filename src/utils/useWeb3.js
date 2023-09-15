/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { STAKING_CONTRACT_ADDRESS, WRAPPING_TOKEN_CONTRACT_ADDRESS } from "../constants";
import StakingABI from "../staking-abi.json";
import TokenABI from "../token-abi.json";
import useWeb3Store from "./web3store";
import shallow from "zustand/shallow";

const useWeb3 = () => {
  const connectedAccount = useWeb3Store((state) => state.connectedAccount);
  const [setBalance] = useWeb3Store((state) => [state.setBalance], shallow);
  const [provider, setProvider] = useState(null);
  const [setContract, setTokenContract, isInstalledWallet, setBlockTimestamp] = useWeb3Store(
    (state) => [state.setContract, state.setTokenContract, state.isInstalledWallet, state.setBlockTimestamp],
    shallow
  );

  const BalanceContract = useCallback(async () => {
    const balance = await provider.getBalance(connectedAccount);
    setBalance(ethers.utils.formatEther(balance));
    const Contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, provider.getSigner());
    const TokenContract = new ethers.Contract(WRAPPING_TOKEN_CONTRACT_ADDRESS, TokenABI, provider.getSigner());
    setContract(Contract);
    setTokenContract(TokenContract);
  }, [connectedAccount, provider]);

  useEffect(() => {
    if (!isInstalledWallet) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    provider.on("block", async (blockNumber) => {
      const block = await provider.getBlock(blockNumber);
      setBlockTimestamp(block.timestamp);
    });
  }, [isInstalledWallet]);

  useEffect(() => {
    if (connectedAccount && provider) BalanceContract();
  }, [connectedAccount, provider, BalanceContract]);
};

export default useWeb3;
