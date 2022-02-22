import { Button, Group, NumberInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import { useNotifications } from "@mantine/notifications";
import { parseEther } from "ethers/lib/utils";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { IoAlertCircleSharp } from "react-icons/io5";
import config from "../utils/config";
import { getContract } from "../utils/utils";

const createAuction = async ({
  currentAccount,
  tokenAddress,
  tokenId,
  minBidAmount,
}) => {
  const marketContract = getContract({
    currentAccount,
    contractInfo: config.contracts.marketContract,
  });
  const txn = await marketContract.createAuction(
    tokenAddress,
    tokenId,
    parseEther(minBidAmount.toString())
  );
  console.log("Transaction hash for creating auction:", txn.hash);
  const receipt = await txn.wait();
  console.log("Transaction receipt:", receipt);
  const auctionCreatedEvent = receipt.events.filter((x) => {
    return x.event === "AuctionCreated";
  })[0];
  const auctionId = auctionCreatedEvent.args[0].toString();
  console.log("Transaction done, auction ID:", auctionId);
};

const CreateAuctionForm = ({
  currentAccount,
  tokenAddress,
  tokenId,
  closeModal,
}) => {
  const notifications = useNotifications();

  const form = useForm({
    initialValues: {
      minBidAmount: null,
      tokenAddress: tokenAddress,
      tokenId: tokenId,
    },
  });

  const handleFormSubmit = async (formValues) => {
    const notificationId = notifications.showNotification({
      loading: true,
      title: "Creating Auction",
      message: "Creating auction, please approve the Metamask transaction",
      autoClose: false,
      disallowClose: true,
    });

    try {
      await createAuction({
        currentAccount,
        tokenAddress,
        tokenId,
        minBidAmount: formValues.minBidAmount,
      });

      notifications.updateNotification(notificationId, {
        notificationId,
        color: "teal",
        title: "Auction created",
        message: "Your item was put on auction",
        icon: <BsFillCheckCircleFill />,
        autoClose: false,
        disallowClose: false,
      });
    } catch (error) {
      notifications.updateNotification(notificationId, {
        notificationId,
        color: "red",
        title: "Auction creation failed",
        message: "An error occurred while creating the auction",
        icon: <IoAlertCircleSharp />,
        autoClose: false,
        disallowClose: false,
      });
    }
  };

  return (
    <form
      onSubmit={form.onSubmit((formValues) => {
        closeModal();
        handleFormSubmit(formValues);
      })}
    >
      <Group direction="column" grow="true">
        <TextInput
          placeholder="NFT contract address"
          label="NFT contract address"
          required
          {...form.getInputProps("tokenAddress")}
          disabled={tokenAddress}
        />
        <TextInput
          placeholder="NFT token ID"
          label="NFT token ID"
          required
          {...form.getInputProps("tokenId")}
          disabled={tokenId}
        />
        <NumberInput
          placeholder="Minimum bid amount in $MATIC"
          label="Minimum bid amount in $MATIC"
          required
          precision={18}
          {...form.getInputProps("minBidAmount")}
        />
        <Group position="right">
          <Button onClick={closeModal} variant="default">
            Cancel
          </Button>
          <Button type="submit">Confirm</Button>
        </Group>
      </Group>
    </form>
  );
};

export const CreateAuctionButton = ({
  currentAccount,
  tokenAddress,
  tokenId,
  buttonProps,
  children,
}) => {
  const modals = useModals();

  const openCreateAuctionModal = () => {
    const modalId = modals.openModal({
      title: "Create Auction",
      children: (
        <CreateAuctionForm
          currentAccount={currentAccount}
          tokenAddress={tokenAddress}
          tokenId={tokenId}
          closeModal={() => modals.closeModal(modalId)}
        />
      ),
    });
  };

  return (
    <Button onClick={openCreateAuctionModal} {...buttonProps}>
      {children}
    </Button>
  );
};
