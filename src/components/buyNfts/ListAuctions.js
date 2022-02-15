import { Center, Group, Loader, Modal, NativeSelect } from "@mantine/core";
import { useEffect } from "react";
import { useState } from "react/cjs/react.development";
import getContract from "../../utils/blockchain";
import config from "../../utils/config";
import { AuctionCard } from "./AuctionCard";
import { FinalizeAuction } from "./FinalizeAuction";
import { PlaceBid } from "./PlaceBid";
import ERC721MetadataAbi from "@solidstate/abi/ERC721Metadata.json";
import { fetchJson } from "ethers/lib/utils";

export const ListAuctions = ({ currentAccount }) => {
  const [allAuctions, setAllAuctions] = useState([]);
  const [auctionsToShow, setAuctionsToShow] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [fetchingAuctions, setFetchingAuctions] = useState(false);
  const [placeBidModalOpened, setPlaceBidModalOpened] = useState(false);
  const [finalizeAuctionModalOpened, setFinalizeAuctionModalOpened] =
    useState(false);
  const [ifSell, setIfSell] = useState(false);

  const [creatorFilter, setCreatorFilter] = useState("all");
  const creatorFilterValues = [
    { value: "me", label: "Created by me" },
    { value: "others", label: "Created by others" },
    { value: "all", label: "All" },
  ];

  const [bidderFilter, setBidderFilter] = useState("all");
  const bidderFilterValues = [
    { value: "me", label: "Bid on by me" },
    { value: "others", label: "Bid on by others" },
    { value: "all", label: "All" },
  ];

  useEffect(() => {
    const fetchAuctions = async () => {
      setFetchingAuctions(true);

      try {
        const marketContract = getContract({
          currentAccount,
          contractInfo: config.contracts.marketContract,
        });
        const bidPlacedEvents = await marketContract.queryFilter(
          marketContract.filters.BidPlaced()
        );
        const auctionIds = await marketContract.liveAuctionIds();
        const auctions = await Promise.all(
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
            const nftMetadata = await fetchJson(nftMetadataURI);
            return {
              ...auctionInfo,
              auctionId,
              bidders,
              nftMetadataURI,
              nftMetadata,
            };
          })
        );
        console.log(auctions);
        setAllAuctions(auctions);
      } catch (error) {
        console.log(error);
      }

      setFetchingAuctions(false);
    };

    fetchAuctions();
  }, [currentAccount]);

  useEffect(() => {
    const creatorFilterFuncs = {
      all: (auction) => true,
      me: (auction) => auction.ownerAddress.toLowerCase() === currentAccount,
      others: (auction) =>
        auction.ownerAddress.toLowerCase() !== currentAccount,
    };
    const bidderFilterFuncs = {
      all: (auction) => true,
      me: (auction) =>
        auction.bidders
          .map((addr) => addr.toLowerCase())
          .includes(currentAccount),
      others: (auction) =>
        !auction.bidders
          .map((addr) => addr.toLowerCase())
          .includes(currentAccount),
    };
    const auctions = allAuctions
      .filter((auction) => !auction.ended)
      .filter(creatorFilterFuncs[creatorFilter])
      .filter(bidderFilterFuncs[bidderFilter]);
    setAuctionsToShow(auctions);
  }, [allAuctions, creatorFilter, bidderFilter, currentAccount]);

  if (fetchingAuctions) {
    return (
      <Center padding="lg">
        <Loader />
      </Center>
    );
  } else {
    return (
      <>
        <Modal
          opened={placeBidModalOpened}
          onClose={() => setPlaceBidModalOpened(false)}
          title="Place bid"
          overlayOpacity={0.95}
        >
          <PlaceBid
            currentAccount={currentAccount}
            selectedAuction={selectedAuction}
          />
        </Modal>

        <Modal
          opened={finalizeAuctionModalOpened}
          onClose={() => setFinalizeAuctionModalOpened(false)}
          title={ifSell ? "Sell to current bidder" : "Cancel auction"}
          overlayOpacity={0.95}
        >
          <FinalizeAuction
            currentAccount={currentAccount}
            selectedAuction={selectedAuction}
            ifSell={ifSell}
          />
        </Modal>
        <Group direction="column" grow={true}>
          <Group position="right">
            <NativeSelect
              value={creatorFilter}
              onChange={(event) => setCreatorFilter(event.currentTarget.value)}
              data={creatorFilterValues}
              label="Filter by creator"
              required
            />
            <NativeSelect
              value={bidderFilter}
              onChange={(event) => setBidderFilter(event.currentTarget.value)}
              data={bidderFilterValues}
              label="Filter by bidder"
              required
            />
          </Group>
          <Group direction="column" grow={true}>
            {auctionsToShow.map((auction) => (
              <AuctionCard
                auctionDetails={auction}
                key={auction.auctionId}
                currentAccount={currentAccount}
                setSelectedAuction={setSelectedAuction}
                setPlaceBidModalOpened={setPlaceBidModalOpened}
                setFinalizeAuctionModalOpened={setFinalizeAuctionModalOpened}
                setIfSell={setIfSell}
              />
            ))}
          </Group>
        </Group>
      </>
    );
  }
};
