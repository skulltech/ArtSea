import { Center, Group, Loader, NativeSelect, SimpleGrid } from "@mantine/core";
import { useEffect } from "react";
import { useState } from "react/cjs/react.development";
import config from "../../utils/config";
import { AuctionCard } from "./AuctionCard";
import ERC721MetadataAbi from "@solidstate/abi/ERC721Metadata.json";
import { fetchJson } from "ethers/lib/utils";
import { ipfsToHttp, getContract } from "../../utils/utils";

export const ListAuctions = ({
  currentAccount,
  currentNetwork,
  allAuctions,
  setAllAuctions,
}) => {
  const [auctionsToShow, setAuctionsToShow] = useState([]);
  const [fetchingAuctions, setFetchingAuctions] = useState(false);

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
            let nftMetadata;
            try {
              nftMetadata = await fetchJson(ipfsToHttp(nftMetadataURI));
            } catch (error) {
              console.log(error);
            }
            const nftCollectionName = await nftContract.name();
            return {
              ...auctionInfo,
              auctionId,
              bidders,
              nftMetadataURI,
              nftMetadata,
              nftCollectionName,
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
  }, [currentAccount, setAllAuctions]);

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
      .filter(creatorFilterFuncs[creatorFilter])
      .filter(bidderFilterFuncs[bidderFilter]);
    setAuctionsToShow(auctions);
  }, [allAuctions, creatorFilter, bidderFilter, currentAccount]);

  return fetchingAuctions ? (
    <Center padding="lg">
      <Loader />
    </Center>
  ) : (
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
      <SimpleGrid cols={2}>
        {auctionsToShow.map((auction) => (
          <AuctionCard
            auctionDetails={auction}
            key={auction.auctionId}
            currentAccount={currentAccount}
            currentNetwork={currentNetwork}
          />
        ))}
      </SimpleGrid>
    </Group>
  );
};
