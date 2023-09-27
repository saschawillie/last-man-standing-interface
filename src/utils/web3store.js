import { ethers } from "ethers";
import create from "zustand";
import { devtools } from "zustand/middleware";

// interface Web3State {
//   isInstalledWallet: boolean;
//   isConnected: boolean;
//   connectedAccount: string | null;
//   setIsConnected: (pay: boolean) => void;
//   setIsInstalledWallet: (pay: boolean) => void;
//   setConnectedAccount: (pay: string | null) => void;
//   //////////////////////////////////////////////////
//   contract: ethers.Contract | null;
//   balance: string | number;
//   setContract: (pay: ethers.Contract) => void;
//   setBalance: (pay: number | string) => void;
// }

const useWeb3Store = create(
  devtools((set) => ({
    isInstalledWallet: false,
    isConnected: false,
    connectedAccount: null,
    setIsConnected: (pay) => set((state) => ({ isConnected: pay })),
    setIsInstalledWallet: (pay) => set((state) => ({ isInstalledWallet: pay })),
    setConnectedAccount: (pay) => set((state) => ({ connectedAccount: pay })),
    //////////////////////
    contract: null,
    setContract: (pay) => set((state) => ({ contract: pay })),
    tokenContract: null,
    setTokenContract: (pay) => set((state) => ({ tokenContract: pay })),
    underlyingContract: null,
    setUnderlyingContract: (pay) => set((state) => ({ underlyingContract: pay })),
    balance: 0,
    setBalance: (pay) => set((state) => ({ balance: pay })),
    blockTimestamp: 0,
    setBlockTimestamp: (pay) => set((state) => ({ blockTimestamp: pay })),
    blockNumber: 0,
    setBlockNumber: (pay) => set((state) => ({ blockNumber: pay })),
  }))
);

export default useWeb3Store;
