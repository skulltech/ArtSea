import { Badge, Button } from "@mantine/core";
import { useState } from "react";
import { minifyAddress } from "../utils/utils";

export const ConnectWallet = ({
  currentAccount,
  setCurrentAccount,
  setCurrentNetwork,
}) => {
  const [connecting, setConnecting] = useState(false);

  const connectAccount = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      return null;
    }
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    return { account: accounts[0], network: parseInt(ethereum.networkVersion) };
  };

  const handleButtonClick = async () => {
    setConnecting(true);
    const { account, network } = await connectAccount();
    setCurrentAccount(account);
    setCurrentNetwork(network);
    setConnecting(false);
  };

  if (currentAccount) {
    return (
      <Badge
        variant="gradient"
        gradient={{ from: "grape", to: "pink" }}
        sx={{ textTransform: "none" }}
        size="lg"
      >
        {"Connected to " + minifyAddress(currentAccount)}
      </Badge>
    );
  } else {
    return (
      <Button onClick={handleButtonClick} loading={connecting}>
        Connect Wallet
      </Button>
    );
  }
};
