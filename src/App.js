import { useState, useEffect, useCallback } from "react";
import { ConnectWallet } from "./components/ConnectWallet";
import {
  AppShell,
  Header,
  Group,
  Text,
  Container,
  Center,
  useMantineTheme,
  Navbar,
  SegmentedControl,
  Space,
  Divider,
  MediaQuery,
  Burger,
  Button,
} from "@mantine/core";
import { GiAtSea } from "react-icons/gi";
import { ListNfts } from "./components/listNfts/ListNfts";
import { ListAuctions } from "./components/listAuctions/ListAuctions";
import config from "./utils/config";
import { ipfsToHttp, getContract } from "./utils/utils";
import { HiOutlineCloudUpload } from "react-icons/hi";
import ERC721MetadataAbi from "@solidstate/abi/ERC721Metadata.json";
import { fetchJson } from "ethers/lib/utils";
import { MintNftButton } from "./components/MintNftButton";
import { CreateAuctionButton } from "./components/CreateAuctionButton";
import { OrderedMap } from "immutable";

const changeNetwork = async () => {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13881" }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x13881",
            rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
            chainName: "Polygon Mumbai",
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18,
            },
            blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
          },
        ],
      });
    }
    console.error(error);
  }
};

export default function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [metamaskInstalled, setMetamaskInstalled] = useState(false);
  const [activeNav, setActiveNav] = useState("marketComponent");
  const [allNfts, setAllNfts] = useState(new OrderedMap());
  const [allAuctions, setAllAuctions] = useState(new OrderedMap());
  const [navbarOpened, setNavbarOpened] = useState(false);

  const theme = useMantineTheme();

  const validNetwork = Object.keys(config.networks).includes(currentNetwork);

  const mainContents = {
    marketComponent: (
      <ListAuctions
        currentAccount={currentAccount}
        currentNetwork={currentNetwork}
        allAuctions={[...allAuctions.values()]}
        setAllAuctions={setAllAuctions}
      />
    ),
    nftsComponent: (
      <ListNfts
        currentAccount={currentAccount}
        currentNetwork={currentNetwork}
        allNfts={[...allNfts.values()]}
        setAllNfts={setAllNfts}
      />
    ),
  };

  // Checks if wallet is connected on first render, and sets relevant states
  useEffect(() => {
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
        return false;
      }
      setCurrentAccount(accounts[0]);
      setCurrentNetwork(ethereum.networkVersion);
      return true;
    };

    checkIfWalletIsConnected();
  }, []);

  // Callback function that updates NFTs to latest information
  const loadNfts = useCallback(
    async (nftIds) => {
      const nftContract = getContract({
        currentAccount,
        contractInfo: config.contracts.nftContract,
      });

      const marketContract = getContract({
        currentAccount,
        contractInfo: config.contracts.marketContract,
      });

      await Promise.all(
        nftIds.map(async (tokenId) => {
          const tokenURI = await nftContract.tokenURI(tokenId);
          const forSale = await marketContract.tokenIsForSale(
            config.contracts.nftContract.contractAddress,
            tokenId
          );
          const additionalDetails = {
            tokenURI,
            tokenIsForSale: forSale,
            loading: false,
          };
          setAllNfts((allNfts) =>
            allNfts.update(tokenId, (value) => {
              return {
                ...value,
                ...additionalDetails,
              };
            })
          );
        })
      );

      await Promise.all(
        nftIds.map(async (tokenId) => {
          const tokenURI = await nftContract.tokenURI(tokenId);
          let tokenMetadata;
          try {
            tokenMetadata = await fetchJson({
              url: ipfsToHttp(tokenURI),
            });
          } catch (error) {
            console.log(error);
          }
          setAllNfts((allNfts) =>
            allNfts.update(tokenId, (value) => {
              return {
                ...value,
                tokenMetadata,
              };
            })
          );
        })
      );
    },
    [currentAccount]
  );

  // Callback function that updates auctions to latest information
  const loadAuctions = useCallback(
    async (auctionIds) => {
      const marketContract = getContract({
        currentAccount,
        contractInfo: config.contracts.marketContract,
      });

      const bidPlacedEvents = await marketContract.queryFilter(
        marketContract.filters.BidPlaced()
      );

      await Promise.all(
        auctionIds.map(async (auctionId) => {
          const auctionInfo = await marketContract.auctions(auctionId);
          const bidders = bidPlacedEvents
            .filter((value) => value.args.auctionId === auctionId)
            .map((event) => event.args.bidder);
          const nftContract = getContract({
            currentAccount,
            contractInfo: {
              contractAbi: ERC721MetadataAbi,
              contractAddress: auctionInfo.tokenAddress,
            },
          });
          const nftMetadataURI = await nftContract.tokenURI(
            auctionInfo.tokenId
          );
          const nftCollectionName = await nftContract.name();
          const auctionDetails = {
            ...auctionInfo,
            auctionId,
            bidders,
            nftMetadataURI,
            nftCollectionName,
            loading: false,
          };
          setAllAuctions((allAuctions) =>
            allAuctions.set(auctionId, auctionDetails)
          );
        })
      );

      await Promise.all(
        auctionIds.map(async (auctionId) => {
          const auctionInfo = await marketContract.auctions(auctionId);
          const nftContract = getContract({
            currentAccount,
            contractInfo: {
              contractAbi: ERC721MetadataAbi,
              contractAddress: auctionInfo.tokenAddress,
            },
          });
          const nftMetadataURI = await nftContract.tokenURI(
            auctionInfo.tokenId
          );
          let nftMetadata;
          try {
            nftMetadata = await fetchJson(ipfsToHttp(nftMetadataURI));
          } catch (error) {
            console.log(error);
          }
          setAllAuctions((allAuctions) =>
            allAuctions.update(auctionId, (value) => {
              return { ...value, nftMetadata };
            })
          );
        })
      );
    },
    [currentAccount]
  );

  // Fetches list of live auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      const marketContract = getContract({
        currentAccount,
        contractInfo: config.contracts.marketContract,
      });
      const auctionIds = (await marketContract.liveAuctionIds()).map((value) =>
        value.toNumber()
      );
      const auctionsMap = auctionIds.reduce(
        (previousValue, currentValue) =>
          previousValue.set(currentValue, {
            auctionId: currentValue,
            loading: true,
          }),
        new OrderedMap()
      );
      setAllAuctions(auctionsMap);
      await loadAuctions(auctionIds);
    };

    if (currentAccount && validNetwork) {
      fetchAuctions();
    }
  }, [currentAccount, setAllAuctions, loadAuctions, validNetwork]);

  // Fetches list of user's NFTs
  useEffect(() => {
    const fetchNfts = async () => {
      const nftContract = getContract({
        currentAccount,
        contractInfo: config.contracts.nftContract,
      });
      const collectionName = await nftContract.name();
      const balance = (await nftContract.balanceOf(currentAccount)).toNumber();
      const nftIds = await Promise.all(
        [...Array(balance).keys()].map(
          async (index) =>
            await (
              await nftContract.tokenOfOwnerByIndex(currentAccount, index)
            ).toBigInt()
        )
      );
      const nftsMap = nftIds.reduce(
        (previousValue, currentValue) =>
          previousValue.set(currentValue, {
            tokenId: currentValue,
            loading: true,
            collectionName,
          }),
        new OrderedMap()
      );
      setAllNfts(nftsMap);
      await loadNfts(nftIds);
    };

    if (currentAccount && validNetwork) {
      fetchNfts();
    }
  }, [currentAccount, setAllNfts, validNetwork, loadNfts]);

  // Event listener that reloads page on Metamask's account and chain change
  useEffect(() => {
    const reloadPage = () => {
      window.location.reload();
    };
    if (window.ethereum) {
      window.ethereum.on("chainChanged", reloadPage);
      window.ethereum.on("accountsChanged", reloadPage);
      return () => {
        window.ethereum.removeListener("chainChanged", reloadPage);
        window.ethereum.removeListener("accountsChanged", reloadPage);
      };
    }
  });

  // Setting up listeners for smart contract events
  useEffect(() => {
    if (currentAccount && validNetwork) {
      const marketContract = getContract({
        currentAccount,
        contractInfo: config.contracts.marketContract,
      });
      const nftContract = getContract({
        currentAccount,
        contractInfo: config.contracts.nftContract,
      });

      marketContract.on("AuctionFinalized", async (auctionId, sold) => {
        console.log("AuctionFinalized event:", { auctionId, sold });
        const auctionIdParsed = await auctionId.toNumber();
        setAllAuctions((allAuctions) => allAuctions.delete(auctionIdParsed));
        if (!sold) {
          const auctionInfo = await marketContract.auctions(auctionIdParsed);
          const tokenIdParsed = await auctionInfo.tokenId.toBigInt();
          setAllNfts((allNfts) =>
            allNfts.update(tokenIdParsed, (value) => {
              return {
                ...value,
                tokenIsForSale: false,
              };
            })
          );
        }
      });

      marketContract.on(
        "AuctionCreated",
        async (auctionId, tokenAddress, tokenId, minBidAmount) => {
          console.log("AuctionCreated event:", {
            auctionId,
            tokenAddress,
            tokenId,
            minBidAmount,
          });
          const auctionIdParsed = await auctionId.toNumber();
          const tokenIdParsed = await tokenId.toBigInt();
          setAllAuctions((allAuctions) =>
            allAuctions.set(auctionIdParsed, {
              auctionId: auctionIdParsed,
              loading: true,
            })
          );
          setAllNfts((allNfts) =>
            allNfts.update(tokenIdParsed, (value) => {
              return {
                ...value,
                tokenIsForSale: true,
              };
            })
          );
          await loadAuctions([auctionIdParsed]);
        }
      );

      marketContract.on("BidPlaced", async (auctionId, bidder, bidAmount) => {
        console.log("BidPlaced event:", { auctionId, bidder, bidAmount });
        const auctionIdParsed = await auctionId.toNumber();
        await loadAuctions([auctionIdParsed]);
      });

      nftContract.on("Transfer", async (from, to, tokenId) => {
        console.log("Transfer event:", { from, to, tokenId });
        const tokenIdParsed = await tokenId.toBigInt();
        if (from === currentAccount) {
          setAllNfts((allNfts) => allNfts.delete(tokenIdParsed));
        }
        if (to === currentAccount) {
          const collectionName = await nftContract.name();
          setAllNfts(async (allNfts) =>
            allNfts.set(tokenIdParsed, {
              tokenId,
              loading: true,
              collectionName,
            })
          );
          await loadNfts([tokenIdParsed]);
        }
      });

      return () => {
        marketContract.removeAllListeners();
        nftContract.removeAllListeners();
      };
    }
  });

  return (
    <AppShell
      header={
        <Header height={60} padding="xs">
          <Group position="apart">
            <Group>
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={navbarOpened}
                  onClick={() => setNavbarOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                />
              </MediaQuery>
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
      navbarOffsetBreakpoint="sm"
      navbar={
        metamaskInstalled &&
        currentNetwork &&
        validNetwork && (
          <Navbar
            width={{ base: 300 }}
            padding="xs"
            hiddenBreakpoint="sm"
            hidden={!navbarOpened}
          >
            <Navbar.Section>
              <SegmentedControl
                fullWidth
                orientation="vertical"
                color="blue"
                styles={{
                  root: { backgroundColor: "inherit", marginRight: 8 },
                }}
                size="md"
                data={[
                  { value: "marketComponent", label: "Market" },
                  { value: "nftsComponent", label: "My Arts" },
                ]}
                value={activeNav}
                onChange={setActiveNav}
              />
            </Navbar.Section>
            <Space h="xl" />
            <Divider />
            <Space h="xl" />

            <Navbar.Section>
              <Group direction="column" grow={true} spacing="xs">
                <MintNftButton
                  currentAccount={currentAccount}
                  buttonProps={{
                    leftIcon: <HiOutlineCloudUpload />,
                    radius: 50,
                    sx: { marginRight: 8 },
                  }}
                >
                  Mint an NFT
                </MintNftButton>
                <CreateAuctionButton
                  buttonProps={{
                    radius: 50,
                    sx: { marginRight: 8 },
                  }}
                >
                  Create Auction
                </CreateAuctionButton>
              </Group>
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
                <Group direction="column" align="center">
                  <Text>
                    Unsupported Network: Please change your network to Mumbai,
                    the Polygon testnet
                  </Text>
                  <Button onClick={changeNetwork}>
                    Change Network to Mumbai
                  </Button>
                </Group>
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
  );
}
