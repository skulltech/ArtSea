import { Button, Text } from "@mantine/core";
import { formatEther } from "ethers/lib/utils";
import { InfoCard } from "../InfoCard";

export const AuctionCard = ({
  auctionDetails,
  currentAccount,
  currentNetwork,
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
    <InfoCard
      currentNetwork={currentNetwork}
      nftImageUri={auctionDetails.nftMetadata.image}
      nftCollectionName={auctionDetails.nftCollectionName}
      nftName={auctionDetails.nftMetadata.name}
      nftDescription={auctionDetails.nftMetadata.description}
      nftMetadataUri={auctionDetails.nftMetadataURI}
      nftContractAddress={auctionDetails.tokenAddress}
      nftId={auctionDetails.tokenId.toString()}
    >
      {highestBidder === zeroAddress ? (
        <Text>No one has bid on this auction yet</Text>
      ) : (
        <Text>
          Current highest bid is of {highestBidAmount} $MATIC by{" "}
          {currentAccount === highestBidder ? "you" : highestBidder}:
        </Text>
      )}
      {auctionCreator === currentAccount ? (
        <>
          <Button
            onClick={() => {
              setSelectedAuction(auctionDetails);
              setFinalizeAuctionModalOpened(true);
              setIfSell(true);
            }}
          >
            Sell to current bidder
          </Button>
          <Button
            onClick={() => {
              setSelectedAuction(auctionDetails);
              setFinalizeAuctionModalOpened(true);
              setIfSell(false);
            }}
          >
            Cancel auction
          </Button>
        </>
      ) : (
        <Button
          onClick={() => {
            setSelectedAuction(auctionDetails);
            setPlaceBidModalOpened(true);
          }}
        >
          Place bid
        </Button>
      )}
    </InfoCard>
  );
};
