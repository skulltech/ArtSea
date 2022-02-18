import { Button, LoadingOverlay, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { formatEther } from "ethers/lib/utils";
import { useState } from "react";
import { getContract } from "../../utils/utils";
import { InfoCard } from "../InfoCard";
import ERC721Abi from "@solidstate/abi/ERC721.json";
import config from "../../utils/config";
import { PlaceBidForm } from "./PlaceBidForm";

export const AuctionCard = ({
  auctionDetails,
  currentAccount,
  currentNetwork,
}) => {
  const highestBidder = auctionDetails.highestBidder.toLowerCase();
  const highestBidAmount = formatEther(auctionDetails.highestBidAmount);
  const auctionCreator = auctionDetails.ownerAddress.toLowerCase();
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  const [transacting, setTransacting] = useState(false);
  const modals = useModals();

  const openConfirmDeleteModal = () => {
    modals.openConfirmModal({
      title: "Cancel auction",
      children: (
        <Text>Are you sure you wanna cancel or delete this auction?</Text>
      ),
      onConfirm: () => finalizeAuction(false),
    });
  };

  const openConfirmSellModal = () =>
    modals.openConfirmModal({
      title: "Sell to current bidder",
      children: (
        <Text>Are you sure you wanna sell your art to the current bidder?</Text>
      ),
      onConfirm: () => finalizeAuction(true),
    });

  const openPlaceBidModal = () => {
    modals.openModal({
      title: "Place bid",
      children: (
        <PlaceBidForm
          currentAccount={currentAccount}
          auctionId={auctionDetails.auctionId}
        />
      ),
    });
  };

  const finalizeAuction = async (ifSell) => {
    setTransacting(true);
    let txn, receipt;

    try {
      if (ifSell) {
        const nftContract = getContract({
          currentAccount,
          contractInfo: {
            contractAbi: ERC721Abi,
            contractAddress: auctionDetails.tokenAddress,
          },
        });
        txn = await nftContract.approve(
          config.contracts.marketContract.contractAddress,
          auctionDetails.tokenId
        );
        console.log("Transaction hash for approve:", txn.hash);
        receipt = await txn.wait();
        console.log("Transaction receipt:", receipt);
      }
      const marketContract = getContract({
        currentAccount,
        contractInfo: config.contracts.marketContract,
      });
      txn = await marketContract.finalizeAuction(
        auctionDetails.auctionId,
        ifSell
      );
      receipt = await txn.wait();
      console.log("Receipt: ", receipt);
    } catch (error) {
      console.log(error);
    }

    setTransacting(false);
  };

  return (
    <>
      <LoadingOverlay visible={transacting} />
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
            {currentAccount === highestBidder ? "you" : highestBidder}:
          </Text>
        )}
        {auctionCreator === currentAccount ? (
          <>
            <Button onClick={openConfirmSellModal}>
              Sell to current bidder
            </Button>
            <Button onClick={openConfirmDeleteModal}>Cancel auction</Button>
          </>
        ) : (
          <Button onClick={openPlaceBidModal}>Place bid</Button>
        )}
      </InfoCard>
    </>
  );
};
