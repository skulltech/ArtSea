import { useState, useEffect } from "react";
import "./App.css";
import { ConnectWallet } from "./components/ConnectWallet";
import { MintNft } from "./components/MintNft";
import {
  AppShell,
  Header,
  Group,
  Text,
  MantineProvider,
  Tabs,
  Container,
} from "@mantine/core";
import { HiOutlineCloudUpload } from "react-icons/hi";
import { GiAtSea } from "react-icons/gi";
import { BsListUl } from "react-icons/bs";
import { AiOutlineShopping } from "react-icons/ai";
import { NotificationsProvider } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [activeTab, setActiveTab] = useState(1);

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
    <MantineProvider
      theme={{
        textSizes: {
          md: "14px",
        },
      }}
    >
      <NotificationsProvider>
        <ModalsProvider>
          <AppShell
            padding="md"
            header={
              <Header height={60} padding="xs">
                <Group position="apart">
                  <Group>
                    <GiAtSea />
                    <Text weight="bold">ArtSea</Text>
                  </Group>
                  <ConnectWallet
                    currentAccount={currentAccount}
                    setCurrentAccount={setCurrentAccount}
                  />
                </Group>
              </Header>
            }
          >
            <Container size="sm">
              <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
                <Tabs.Tab label="Mint" icon={<HiOutlineCloudUpload />}>
                  <MintNft currentAccount={currentAccount} />
                </Tabs.Tab>
                <Tabs.Tab label="My Arts" icon={<BsListUl />}></Tabs.Tab>
                <Tabs.Tab label="Buy" icon={<AiOutlineShopping />}></Tabs.Tab>
              </Tabs>
            </Container>
          </AppShell>
        </ModalsProvider>
      </NotificationsProvider>
    </MantineProvider>
  );
}
