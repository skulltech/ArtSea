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
  Center,
} from "@mantine/core";
import { HiOutlineCloudUpload } from "react-icons/hi";
import { GiAtSea } from "react-icons/gi";
import { BsListUl } from "react-icons/bs";
import { AiOutlineShopping } from "react-icons/ai";
import { NotificationsProvider } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { ListNfts } from "./components/listNfts/ListNfts";
import { ListAuctions } from "./components/buyNfts/ListAuctions";
import config from "./utils/config";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [metamaskInstalled, setMetamaskInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState(1);

  const validNetwork = Object.keys(config.networks).includes(currentNetwork);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (ethereum) {
      setMetamaskInstalled(true);
    } else {
      setMetamaskInstalled(false);
      return false;
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (!accounts.length) {
      console.log("No authorized accounts found");
      return false;
    }
    console.log("Authorized account found:", accounts[0]);
    setCurrentAccount(accounts[0]);
    setCurrentNetwork(ethereum.networkVersion);
    return true;
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }
  });

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
                  {metamaskInstalled && (
                    <ConnectWallet
                      currentAccount={currentAccount}
                      setCurrentAccount={setCurrentAccount}
                      setCurrentNetwork={setCurrentNetwork}
                    />
                  )}
                </Group>
              </Header>
            }
          >
            <Container size="sm">
              {currentAccount && validNetwork && (
                <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
                  <Tabs.Tab label="Mint" icon={<HiOutlineCloudUpload />}>
                    <MintNft currentAccount={currentAccount} />
                  </Tabs.Tab>
                  <Tabs.Tab label="My Arts" icon={<BsListUl />}>
                    <ListNfts
                      currentAccount={currentAccount}
                      currentNetwork={currentNetwork}
                    />
                  </Tabs.Tab>
                  <Tabs.Tab label="Buy" icon={<AiOutlineShopping />}>
                    <ListAuctions
                      currentAccount={currentAccount}
                      currentNetwork={currentNetwork}
                    />
                  </Tabs.Tab>
                </Tabs>
              )}
              {!currentAccount && metamaskInstalled && (
                <Center>
                  <Text>Connect your wallet using Metamask</Text>
                </Center>
              )}
              {currentAccount && !validNetwork && (
                <Center>
                  <Text>
                    Unsupported Network: Please change your network to Polygon
                    or Mumbai
                  </Text>
                </Center>
              )}
              {!metamaskInstalled && (
                <Center>
                  <Text>Install Metamask to use this Web 3.0 app</Text>
                </Center>
              )}
            </Container>
          </AppShell>
        </ModalsProvider>
      </NotificationsProvider>
    </MantineProvider>
  );
}
