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

  return (
    <Card padding="lg">
      <Card.Section>
        <Text>{auctionDetails.tokenAddress}</Text>
        <Text size="sm">{auctionDetails.tokenId.toNumber()}</Text>
        <Text>
          Current highest bid is of {highestBidAmount} $MATIC by{" "}
          {currentAccount === highestBidder && "you"}
          {currentAccount !== highestBidder && highestBidder}
        </Text>
        <Button
          onClick={() => {
            setAuctionToBidOn(auctionDetails.auctionId);
            setPlaceBidModalOpened(true);
          }}
        >
          Place bid
        </Button>
      </Card.Section>
    </Card>
  );
};
