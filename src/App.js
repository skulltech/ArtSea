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

export default function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [metamaskInstalled, setMetamaskInstalled] = useState(false);
  const [activeNav, setActiveNav] = useState("marketComponent");
  const [allNfts, setAllNfts] = useState(new OrderedMap());
  const [allAuctions, setAllAuctions] = useState(new OrderedMap());

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
            allNfts.set(tokenId, {
              ...allNfts.get(tokenId),
              ...additionalDetails,
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
            allNfts.set(tokenId, {
              ...allNfts.get(tokenId),
              tokenMetadata,
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
            allAuctions.set(auctionId, {
              ...allAuctions.get(auctionId),
              nftMetadata,
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
            await nftContract.tokenOfOwnerByIndex(currentAccount, index)
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

  // Setting up event listeners
  useEffect(() => {
    // Reload page on Metamask's account and chain change
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }

    // Listening to smart contract events
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
          setAllNfts((allNfts) =>
            allNfts.set(auctionInfo.tokenId, {
              ...allNfts.get(auctionInfo.tokenId),
              tokenIsForSale: false,
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
          setAllAuctions((allAuctions) =>
            allAuctions.set(auctionIdParsed, {
              auctionId: auctionIdParsed,
              loading: true,
            })
          );
          setAllNfts((allNfts) =>
            allNfts.set(tokenId, {
              ...allNfts.get(tokenId),
              tokenIsForSale: true,
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
        if (from === currentAccount) {
          setAllNfts((allNfts) => allNfts.delete(tokenId));
        }
        if (to === currentAccount) {
          const collectionName = await nftContract.name();
          setAllNfts(async (allNfts) =>
            allNfts.set(tokenId, {
              tokenId,
              loading: true,
              collectionName,
            })
          );
        }
      });
    }
  });

  return (
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
                  { value: "marketComponent", label: "Market" },
                  { value: "nftsComponent", label: "My Arts" },
                ]}
                value={activeNav}
                onChange={setActiveNav}
              />
            </Navbar.Section>
            <Navbar.Section>
              <Group direction="column" grow={true}>
                <MintNftButton
                  currentAccount={currentAccount}
                  buttonProps={{ leftIcon: <HiOutlineCloudUpload /> }}
                >
                  Mint an NFT
                </MintNftButton>
                <CreateAuctionButton>Create Auction</CreateAuctionButton>
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
                <Text>
                  Unsupported Network: Please change your network to Polygon or
                  Mumbai
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
  );
}
