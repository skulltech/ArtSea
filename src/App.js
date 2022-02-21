import { useState, useEffect } from "react";
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
  const [activeNav, setActiveNav] = useState("market");
  const [allNfts, setAllNfts] = useState(new OrderedMap());
  const [allAuctions, setAllAuctions] = useState(new OrderedMap());

  const theme = useMantineTheme();

  const validNetwork = Object.keys(config.networks).includes(currentNetwork);

  const mainContents = {
    market: (
      <ListAuctions
        currentAccount={currentAccount}
        currentNetwork={currentNetwork}
        allAuctions={[...allAuctions.values()]}
        setAllAuctions={setAllAuctions}
      />
    ),
    myNfts: (
      <ListNfts
        currentAccount={currentAccount}
        currentNetwork={currentNetwork}
        allNfts={[...allNfts.values()]}
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
    console.log(allNfts);
  }, [allNfts]);

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
    const fetchAuctions = async () => {
      const marketContract = getContract({
        currentAccount,
        contractInfo: config.contracts.marketContract,
      });
      const bidPlacedEvents = await marketContract.queryFilter(
        marketContract.filters.BidPlaced()
      );
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
          let nftMetadata;
          try {
            nftMetadata = await fetchJson(ipfsToHttp(nftMetadataURI));
          } catch (error) {
            console.log(error);
          }
          const nftCollectionName = await nftContract.name();
          const auctionDetails = {
            ...auctionInfo,
            auctionId,
            bidders,
            nftMetadataURI,
            nftMetadata,
            nftCollectionName,
            loading: false,
          };
          setAllAuctions((allAuctions) =>
            allAuctions.set(auctionId, auctionDetails)
          );
        })
      );
    };

    fetchAuctions();
  }, [currentAccount, setAllAuctions]);

  useEffect(() => {
    const fetchNfts = async () => {
      const nftContract = getContract({
        currentAccount,
        contractInfo: config.contracts.nftContract,
      });
      const marketContract = getContract({
        currentAccount,
        contractInfo: config.contracts.marketContract,
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
    };

    fetchNfts();
  }, [currentAccount, setAllNfts]);

  useEffect(() => {
    const marketContract = getContract({
      currentAccount,
      contractInfo: config.contracts.marketContract,
    });
    marketContract.on("AuctionFinalized", (auctionId, sold) => {
      console.log("AuctionFinalized event:", auctionId, sold);
    });
  });

  useEffect(() => {
    const marketContract = getContract({
      currentAccount,
      contractInfo: config.contracts.marketContract,
    });
    marketContract.on(
      "AuctionCreated",
      (auctionId, tokenAddress, tokenId, minBidAmount) => {
        console.log(
          "AuctionCreated event:",
          auctionId,
          tokenAddress,
          tokenId,
          minBidAmount
        );
      }
    );
  });

  useEffect(() => {
    const marketContract = getContract({
      currentAccount,
      contractInfo: config.contracts.marketContract,
    });
    marketContract.on("BidPlaced", (auctionId, bidder, bidAmount) => {
      console.log("BidPlaced event:", auctionId, bidder, bidAmount);
    });
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
                  { value: "market", label: "Market" },
                  { value: "myNfts", label: "My Arts" },
                ]}
                value={activeNav}
                onChange={setActiveNav}
              />
            </Navbar.Section>
            <Navbar.Section>
              <Group direction="column" grow={true}>
                <MintNftButton
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
