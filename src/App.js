import { useState, useEffect } from "react";
import "./App.css";
import { ConnectWallet } from "./ConnectWallet";
import { MintNFT } from "./MintNFT";
import { AppShell, Header, Group, Text } from "@mantine/core";
import { TargetIcon } from "@modulz/radix-icons";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState(null);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Metamask is not installed");
      return false;
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (!accounts.length) {
      console.log("No authorized accounts found");
      return false;
    }
    console.log("Authorized account found:", accounts[0]);
    setCurrentAccount(accounts[0]);
    return true;
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} padding="xs">
          <Group position="apart">
            <Group>
              <TargetIcon />
              <Text weight="bold">NFT Marketplace</Text>
            </Group>
            <ConnectWallet
              currentAccount={currentAccount}
              setCurrentAccount={setCurrentAccount}
            />
          </Group>
        </Header>
      }
    >
      <MintNFT currentAccount={currentAccount} />
    </AppShell>
  );
}
