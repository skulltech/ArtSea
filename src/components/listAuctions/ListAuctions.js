import {
  Divider,
  Group,
  NativeSelect,
  SimpleGrid,
  Skeleton,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { AuctionCard } from "./AuctionCard";

export const ListAuctions = ({
  currentAccount,
  currentNetwork,
  allAuctions,
}) => {
  const [auctionsToShow, setAuctionsToShow] = useState([]);

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

  return (
    <Group direction="column" grow={true}>
      <Group position="apart">
        <Group position="left">
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
      </Group>
      <Divider />
      <SimpleGrid
        cols={4}
        breakpoints={[
          { maxWidth: "lg", cols: 3 },
          { maxWidth: "md", cols: 2 },
          { maxWidth: "sm", cols: 1 },
        ]}
      >
        {auctionsToShow.map((auction) =>
          auction.loading ? (
            <Skeleton key={auction.auctionId} />
          ) : (
            <AuctionCard
              auctionDetails={auction}
              key={auction.auctionId}
              currentAccount={currentAccount}
              currentNetwork={currentNetwork}
            />
          )
        )}
      </SimpleGrid>
    </Group>
  );
};
