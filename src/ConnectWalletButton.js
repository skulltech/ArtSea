import { Button } from "@mantine/core";
import { useState } from "react";

export const ConnectWalletButton = ({ currentAccount, setCurrentAccount }) => {
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
    return accounts[0];
  };

  const buttonOnClick = async () => {
    setConnecting(true);
    const account = await connectAccount();
    setCurrentAccount(account);
    setConnecting(false);
  };

  return (
    <Button
      onClick={buttonOnClick}
      loading={connecting}
      color={currentAccount && "green"}
    >
      {currentAccount && "Connected to " + currentAccount}
      {!currentAccount && "Connect Wallet"}
    </Button>
  );
};
