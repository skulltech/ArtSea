import { Button, LoadingOverlay } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { useState } from "react";
import config from "../../utils/config";
import { InfoCard } from "../InfoCard";
import { CreateAuctionForm } from "./CreateAuctionForm";

export const NftCard = ({ nftDetails, currentAccount, currentNetwork }) => {
  const [transacting, setTransacting] = useState(false);
  const modals = useModals();

  const openCreateAuctionModal = () => {
    modals.openModal({
      title: "Create Auction",
      children: (
        <CreateAuctionForm
          currentAccount={currentAccount}
          tokenToSell={nftDetails.tokenId.toString()}
          setTransacting={setTransacting}
        />
      ),
    });
  };

  return (
    <>
      <LoadingOverlay visible={transacting} />

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
          <Button onClick={openCreateAuctionModal}>Sell this NFT</Button>
        )}
      </InfoCard>
    </>
  );
};
