import { Badge, Button } from "@mantine/core";
import { useState } from "react";

export const ConnectWallet = ({
  currentAccount,
  setCurrentAccount,
  setCurrentNetwork,
}) => {
  const [connecting, setConnecting] = useState(false);

  const connectAccount = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Metamask is not installed");
      return null;
    }
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log("Authorized account:", accounts[0]);
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
        {"Connected to " + currentAccount}
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
