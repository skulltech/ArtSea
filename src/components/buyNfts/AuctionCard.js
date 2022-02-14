import { Button, Card, Text } from "@mantine/core";
import { formatEther } from "ethers/lib/utils";

export const AuctionCard = ({
  auctionDetails,
  currentAccount,
  setPlaceBidModalOpened,
  setAuctionToBidOn,
}) => {
  const highestBidder = auctionDetails.highestBidder.toLowerCase();
  const highestBidAmount = formatEther(auctionDetails.highestBidAmount);
  const auctionCreator = auctionDetails.ownerAddress.toLowerCase();
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  return (
    <Card padding="lg">
      <Card.Section>
        <Text>{auctionDetails.tokenAddress}</Text>
        <Text size="sm">{auctionDetails.tokenId.toNumber()}</Text>
        {highestBidder === zeroAddress && (
          <Text>No one has bid on this auction yet</Text>
        )}
        {highestBidder !== zeroAddress && (
          <Text>
            Current highest bid is of {highestBidAmount} $MATIC by{" "}
            {currentAccount === highestBidder && "you"}
            {currentAccount !== highestBidder && highestBidder}
          </Text>
        )}
        {auctionCreator !== currentAccount && (
          <Button
            onClick={() => {
              setAuctionToBidOn(auctionDetails.auctionId);
              setPlaceBidModalOpened(true);
            }}
          >
            Place bid
          </Button>
        )}
      </Card.Section>
    </Card>
  );
};
