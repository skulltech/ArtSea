import { Button, Card, Group, Image, Text } from "@mantine/core";
import { formatEther } from "ethers/lib/utils";

export const AuctionCard = ({
  auctionDetails,
  currentAccount,
  setPlaceBidModalOpened,
  setSelectedAuction,
  setFinalizeAuctionModalOpened,
  setIfSell,
}) => {
  const highestBidder = auctionDetails.highestBidder.toLowerCase();
  const highestBidAmount = formatEther(auctionDetails.highestBidAmount);
  const auctionCreator = auctionDetails.ownerAddress.toLowerCase();
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  return (
    <Card shadow="sm">
      <Card.Section>
        {/* <Image src={nftDetails.tokenMetadata.image} height={160}></Image> */}

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
        {auctionCreator === currentAccount && (
          <Group grow={true}>
            <Button
              onClick={() => {
                setSelectedAuction(auctionDetails.auctionId);
                setFinalizeAuctionModalOpened(true);
                setIfSell(true);
              }}
            >
              Sell to current bidder
            </Button>
            <Button
              onClick={() => {
                setSelectedAuction(auctionDetails.auctionId);
                setFinalizeAuctionModalOpened(true);
                setIfSell(false);
              }}
            >
              Cancel auction
            </Button>
          </Group>
        )}
        {auctionCreator !== currentAccount && (
          <Button
            onClick={() => {
              setSelectedAuction(auctionDetails.auctionId);
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
