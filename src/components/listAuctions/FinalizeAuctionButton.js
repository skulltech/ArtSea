import { getContract } from "../../utils/utils";
import ERC721Abi from "@solidstate/abi/ERC721.json";
import config from "../../utils/config";
import { useNotifications } from "@mantine/notifications";
import { useModals } from "@mantine/modals";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { IoAlertCircleSharp } from "react-icons/io5";
import { Button } from "@mantine/core";

const FinalizeAuctionButton = ({
  currentAccount,
  auctionId,
  tokenAddress,
  tokenId,
  ifSell,
  progressNotificationProps,
  successNotificationProps,
  errorNotificationProps,
  modalProps,
  buttonProps,
  children,
}) => {
  const notifications = useNotifications();
  const modals = useModals();

  const finalizeAuction = async () => {
    const notificationId = notifications.showNotification({
      loading: true,
      autoClose: false,
      disallowClose: true,
      ...progressNotificationProps,
    });

    try {
      let txn, receipt;

      if (ifSell) {
        const nftContract = getContract({
          currentAccount,
          contractInfo: {
            contractAbi: ERC721Abi,
            contractAddress: tokenAddress,
          },
        });
        txn = await nftContract.approve(
          config.contracts.marketContract.contractAddress,
          tokenId
        );
        console.log("Transaction hash for approve:", txn.hash);
        receipt = await txn.wait();
        console.log("Transaction receipt:", receipt);
      }
      const marketContract = getContract({
        currentAccount,
        contractInfo: config.contracts.marketContract,
      });
      txn = await marketContract.finalizeAuction(auctionId, ifSell);
      receipt = await txn.wait();
      console.log("Receipt: ", receipt);

      notifications.updateNotification(notificationId, {
        notificationId,
        color: "teal",
        icon: <BsFillCheckCircleFill />,
        autoClose: false,
        disallowClose: false,
        ...successNotificationProps,
      });
    } catch (error) {
      console.log(error);

      notifications.updateNotification(notificationId, {
        notificationId,
        color: "red",
        icon: <IoAlertCircleSharp />,
        autoClose: false,
        disallowClose: false,
        ...errorNotificationProps,
      });
    }
  };

  const openConfirmModal = () => {
    modals.openConfirmModal({
      onConfirm: finalizeAuction,
      ...modalProps,
    });
  };

  return (
    <Button onClick={openConfirmModal} {...buttonProps}>
      {children}
    </Button>
  );
};

export const SellAuctionButton = ({
  currentAccount,
  children,
  auctionId,
  tokenAddress,
  tokenId,
}) => {
  return (
    <FinalizeAuctionButton
      currentAccount={currentAccount}
      auctionId={auctionId}
      tokenAddress={tokenAddress}
      tokenId={tokenId}
      ifSell={true}
      progressNotificationProps={{
        title: "Selling to current highest bidder",
        message:
          "Selling to current highest bidder, please approve the two Metamask transactions",
      }}
      errorNotificationProps={{
        title: "Selling failed",
        message: "An error occurred while selling your item",
      }}
      successNotificationProps={{
        title: "Sell successful",
        message: "Successfully sold the item to the highest bidder",
      }}
    >
      {children}
    </FinalizeAuctionButton>
  );
};

export const CancelAuctionButton = ({
  currentAccount,
  children,
  auctionId,
  tokenAddress,
  tokenId,
}) => {
  return (
    <FinalizeAuctionButton
      currentAccount={currentAccount}
      auctionId={auctionId}
      tokenAddress={tokenAddress}
      tokenId={tokenId}
      ifSell={true}
      progressNotificationProps={{
        title: "Deleting auction",
        message:
          "Cancelling auction, please approve the two Metamask transactions",
      }}
      errorNotificationProps={{
        title: "Cancelling auction failed",
        message: "An error occurred while cancelling your auction",
      }}
      successNotificationProps={{
        title: "Delete successful",
        message: "Successfully cancelled your auction",
      }}
    >
      {children}
    </FinalizeAuctionButton>
  );
};
