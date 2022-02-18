import { Button } from "@mantine/core";
import config from "../../utils/config";
import { CreateAuctionButton } from "../CreateAuctionButton";
import { InfoCard } from "../InfoCard";

export const NftCard = ({ nftDetails, currentAccount, currentNetwork }) => {
  return (
    <InfoCard
      currentNetwork={currentNetwork}
      nftImageUri={
        nftDetails.tokenMetadata ? nftDetails.tokenMetadata.image : null
      }
      nftCollectionName={nftDetails.collectionName}
      nftName={
        nftDetails.tokenMetadata
          ? nftDetails.tokenMetadata.name
          : nftDetails.tokenId.toString()
      }
      nftDescription={
        nftDetails.tokenMetadata ? nftDetails.tokenMetadata.description : null
      }
      nftMetadataUri={nftDetails.tokenURI}
      nftContractAddress={config.contracts.nftContract.contractAddress}
      nftId={nftDetails.tokenId.toString()}
    >
      {nftDetails.tokenIsForSale ? (
        <Button disabled={true}>For Sale</Button>
      ) : (
        <CreateAuctionButton
          tokenAddress={config.contracts.nftContract.contractAddress}
          tokenId={nftDetails.tokenId.toString()}
        >
          Sell this NFT
        </CreateAuctionButton>
      )}
    </InfoCard>
  );
};
