import { Text } from "@mantine/core";
import { formatEther } from "ethers/lib/utils";
import { minifyAddress } from "../../utils/utils";
import { InfoCard } from "../InfoCard";
import {
  CancelAuctionButton,
  SellAuctionButton,
} from "./FinalizeAuctionButton";
import { PlaceBidButton } from "./PlaceBidButton";

export const AuctionCard = ({
  auctionDetails,
  currentAccount,
  currentNetwork,
}) => {
  const highestBidder = auctionDetails.highestBidder.toLowerCase();
  const highestBidAmount = formatEther(auctionDetails.highestBidAmount);
  const auctionCreator = auctionDetails.ownerAddress.toLowerCase();
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  return (
    <>
      <InfoCard
        currentNetwork={currentNetwork}
        nftImageUri={
          auctionDetails.nftMetadata ? auctionDetails.nftMetadata.image : null
        }
        nftCollectionName={auctionDetails.nftCollectionName}
        nftName={
          auctionDetails.nftMetadata
            ? auctionDetails.nftMetadata.name
            : auctionDetails.tokenId.toString()
        }
        nftDescription={
          auctionDetails.nftMetadata
            ? auctionDetails.nftMetadata.description
            : null
        }
        nftMetadataUri={auctionDetails.nftMetadataURI}
        nftContractAddress={auctionDetails.tokenAddress}
        nftId={auctionDetails.tokenId.toString()}
      >
        {highestBidder === zeroAddress ? (
          <Text>No one has bid on this auction yet</Text>
        ) : (
          <Text>
            Current highest bid is of {highestBidAmount} $MATIC by{" "}
            {currentAccount === highestBidder
              ? "you"
              : minifyAddress(highestBidder)}
          </Text>
        )}
        {auctionCreator === currentAccount ? (
          <>
            <SellAuctionButton
              currentAccount={currentAccount}
              auctionId={auctionDetails.auctionId}
              tokenAddress={auctionDetails.tokenAddress}
              tokenId={auctionDetails.tokenId}
            >
              Sell to current bidder
            </SellAuctionButton>
            <CancelAuctionButton
              currentAccount={currentAccount}
              auctionId={auctionDetails.auctionId}
              tokenAddress={auctionDetails.tokenAddress}
              tokenId={auctionDetails.tokenId}
            >
              Cancel auction
            </CancelAuctionButton>
          </>
        ) : (
          <PlaceBidButton
            currentAccount={currentAccount}
            auctionId={auctionDetails.auctionId}
          >
            Place Bid
          </PlaceBidButton>
        )}
      </InfoCard>
    </>
  );
};
