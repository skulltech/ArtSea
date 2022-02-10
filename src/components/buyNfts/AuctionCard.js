import { Button, Card, Text } from "@mantine/core";

export const AuctionCard = ({
  auctionDetails,
  currentAccount,
  setPlaceBidModalOpened,
  setAuctionToBidOn,
}) => {
  return (
    <Card padding="lg">
      <Card.Section>
        <Text>{auctionDetails.tokenAddress}</Text>
        <Text size="sm">{auctionDetails.tokenId.toNumber()}</Text>
        <Text>
          Current highest bid is of {auctionDetails.higestBidAmount} $MATIC by{" "}
          {currentAccount === auctionDetails.highestBidder && "you"}
          {currentAccount !== auctionDetails.highestBidder &&
            auctionDetails.highestBidder}
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
