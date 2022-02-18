import { Button, Group, NumberInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import { useNotifications } from "@mantine/notifications";
import { parseEther } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { IoAlertCircleSharp } from "react-icons/io5";
import config from "../utils/config";
import { getContract } from "../utils/utils";

const CreateAuctionForm = ({ setFormValues, tokenAddress, tokenId }) => {
  const form = useForm({
    initialValues: {
      minBidAmount: null,
      tokenAddress: tokenAddress,
      tokenId: tokenId,
    },
  });

  useEffect(() => {
    setFormValues(form.values);
  }, [form.values, setFormValues]);

  return (
    <form>
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
  const [formValues, setFormValues] = useState(null);
  const notifications = useNotifications();
  const modals = useModals();

  const createAuction = async (formValues) => {
    const notificationId = notifications.showNotification({
      loading: true,
      title: "Creating Auction",
      message: "Creating auction, please approve the Metamask transaction",
      autoClose: false,
      disallowClose: true,
    });

    try {
      const marketContract = getContract({
        currentAccount,
        contractInfo: config.contracts.marketContract,
      });
      const txn = await marketContract.createAuction(
        formValues.tokenAddress,
        formValues.tokenId,
        parseEther(formValues.minBidAmount.toString())
      );
      console.log("Transaction hash for creating auction:", txn.hash);
      const receipt = await txn.wait();
      console.log("Transaction receipt:", receipt);
      const auctionCreatedEvent = receipt.events.filter((x) => {
        return x.event === "AuctionCreated";
      })[0];
      const auctionId = auctionCreatedEvent.args[0].toString();
      console.log("Transaction done, auction ID:", auctionId);

      notifications.updateNotification(notificationId, {
        notificationId,
        color: "teal",
        title: "Auction created",
        message: "Auction created",
        icon: <BsFillCheckCircleFill />,
        autoClose: false,
        disallowClose: false,
      });
    } catch (error) {
      console.log(error);

      notifications.updateNotification(notificationId, {
        notificationId,
        color: "red",
        title: "Auction creation failed",
        message: "An error occurred while creating auction",
        icon: <IoAlertCircleSharp />,
        autoClose: false,
        disallowClose: false,
      });
    }
  };

  const openCreateAuctionModal = () => {
    modals.openConfirmModal({
      title: "Create Auction",
      children: (
        <CreateAuctionForm
          setFormValues={setFormValues}
          tokenAddress={tokenAddress}
          tokenId={tokenId}
        />
      ),
      onConfirm: () => createAuction(formValues),
    });
  };

  return (
    <Button onClick={openCreateAuctionModal} {...buttonProps}>
      {children}
    </Button>
  );
};
