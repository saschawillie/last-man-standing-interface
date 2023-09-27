import Button from "@mui/material/Button";
import useWeb3Store from "../utils/web3store";
import { STAKING_TOKEN_NAME, UNDERLYING_TOKEN_CONTRACT_ADDRESS, WRAPPING_TOKEN_CONTRACT_ADDRESS } from "../constants";

export default function AddWatchTokenButton({ setAccount, onConnect, width }) {
  const isConnected = useWeb3Store((state) => state.isConnected);
  const isInstalledWallet = useWeb3Store((state) => state.isInstalledWallet);

  const tokenContract = useWeb3Store((state) => state.tokenContract);
  const underlyingContract = useWeb3Store((state) => state.underlyingContract);

  const addToken = async () => {
    try {
      if (!isInstalledWallet) {
        return false;
      }

      const decimals = await tokenContract.decimals();

      const tokenSymbol = await tokenContract.symbol();
      const underlyingSymbol = await underlyingContract.symbol();

      window.ethereum
        .request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: WRAPPING_TOKEN_CONTRACT_ADDRESS,
              symbol: tokenSymbol,
              decimals: decimals,
              image: "https://foo.io/token-image.svg",
            },
          },
        })
        .then((success) => {
          if (success) {
            console.log("%s successfully added to wallet!", tokenSymbol);
          } else {
            throw new Error("Something went wrong.");
          }
        })
        .catch(console.error);

      window.ethereum
        .request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: UNDERLYING_TOKEN_CONTRACT_ADDRESS,
              symbol: underlyingSymbol,
              decimals: decimals,
              image: "https://foo.io/token-image.svg",
            },
          },
        })
        .then((success) => {
          if (success) {
            console.log("%s successfully added to wallet!", underlyingSymbol);
          } else {
            throw new Error("Something went wrong.");
          }
        })
        .catch(console.error);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object.");
    }
  };
  return (
    <Button
      variant="contained"
      size="large"
      sx={{
        background: "linear-gradient(to right, #30A9CF 2.13%, rgba(186, 38, 238, 0.95) 100%)",
        color: "black",
        borderRadius: 5,
        fontWeight: "900",
        width: width || "100%",
        mt: 2,
      }}
      disabled={!isConnected}
      onClick={addToken}
    >
      Enable Game Token
    </Button>
  );
}
