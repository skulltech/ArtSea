import { Button } from "@mantine/core";
import config from "../../utils/config";
import { InfoCard } from "../InfoCard";

export const NftCard = ({
  nftDetails,
  setSellNftModalOpened,
  setTokenToSell,
  currentNetwork,
}) => {
  return (
    <InfoCard
      currentNetwork={currentNetwork}
      nftImageUri={nftDetails.tokenMetadata.image}
      nftCollectionName={nftDetails.collectionName}
      nftName={nftDetails.tokenMetadata.name}
      nftDescription={nftDetails.tokenMetadata.description}
      nftMetadataUri={nftDetails.tokenURI}
      nftContractAddress={config.contracts.nftContract.contractAddress}
      nftId={nftDetails.tokenId.toString()}
    >
      {nftDetails.tokenIsForSale ? (
        <Button disabled={true}>For Sale</Button>
      ) : (
        <Button
          onClick={() => {
            setSellNftModalOpened(true);
            setTokenToSell(nftDetails.tokenId.toNumber());
          }}
        >
          Sell this NFT
        </Button>
      )}
    </InfoCard>
  );
};
