import { useState, useEffect } from "react";
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
  useMantineTheme,
  Navbar,
  SegmentedControl,
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
import { getContract } from "./utils/utils";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [metamaskInstalled, setMetamaskInstalled] = useState(false);
  const [activeNav, setActiveNav] = useState("market");
  const [allNfts, setAllNfts] = useState([]);
  const [allAuctions, setAllAuctions] = useState([]);

  const theme = useMantineTheme();

  const validNetwork = Object.keys(config.networks).includes(currentNetwork);

  const mainContents = {
    market: (
      <ListAuctions
        currentAccount={currentAccount}
        currentNetwork={currentNetwork}
        allAuctions={allAuctions}
        setAllAuctions={setAllAuctions}
      />
    ),
    myNfts: (
      <ListNfts
        currentAccount={currentAccount}
        currentNetwork={currentNetwork}
        allNfts={allNfts}
        setAllNfts={setAllNfts}
      />
    ),
  };

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

  useEffect(() => {
    const marketContract = getContract({
      currentAccount,
      contractInfo: config.contracts.marketContract,
    });
    marketContract.on("AuctionFinalized", () => {});
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
        <ModalsProvider labels={{ confirm: "Confirm", cancel: "Cancel" }}>
          <AppShell
            padding="md"
            header={
              <Header height={60} padding="xs">
                <Group position="apart">
                  <Group>
                    <GiAtSea />
                    <Text weight="bold">ArtSea</Text>
                    {validNetwork && (
                      <Text
                        color="dimmed"
                        sx={{ fontFamily: theme.fontFamilyMonospace }}
                      >
                        @{config.networks[currentNetwork].name}
                      </Text>
                    )}
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
            navbar={
              metamaskInstalled &&
              currentNetwork &&
              validNetwork && (
                <Navbar width={{ base: 300 }}>
                  <Navbar.Section>
                    <SegmentedControl
                      fullWidth
                      orientation="vertical"
                      styles={{
                        root: { backgroundColor: "inherit" },
                      }}
                      size="md"
                      data={[
                        { value: "market", label: "Market" },
                        { value: "myNfts", label: "My Arts" },
                      ]}
                      value={activeNav}
                      onChange={setActiveNav}
                    />
                  </Navbar.Section>
                </Navbar>
              )
            }
          >
            <Container size="xl">
              {metamaskInstalled ? (
                currentAccount ? (
                  validNetwork ? (
                    mainContents[activeNav]
                  ) : (
                    <Center>
                      <Text>
                        Unsupported Network: Please change your network to
                        Polygon or Mumbai
                      </Text>
                    </Center>
                  )
                ) : (
                  <Center>
                    <Text>Connect your wallet using Metamask</Text>
                  </Center>
                )
              ) : (
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
