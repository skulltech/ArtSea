import { Button, Group, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { parseEther } from "ethers/lib/utils";
import { getContract } from "../../utils/utils";
import config from "../../utils/config";
import { useEffect, useState } from "react";
import { useNotifications } from "@mantine/notifications";
import { useModals } from "@mantine/modals";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { IoAlertCircleSharp } from "react-icons/io5";

const PlaceBidForm = ({ setFormValues }) => {
  const form = useForm({
    initialValues: {
      bidAmount: 0,
    },
  });

  useEffect(() => {
    setFormValues(form.values);
  }, [form.values, setFormValues]);

  return (
    <form>
      <Group direction="column" grow="true">
        <NumberInput
          placeholder="Bid amount in $MATIC"
          label="Bid amount in $MATIC"
          required
          precision={18}
          {...form.getInputProps("bidAmount")}
        />
      </Group>
    </form>
  );
};

export const PlaceBidButton = ({
  currentAccount,
  auctionId,
  buttonProps,
  children,
}) => {
  const [formValues, setFormValues] = useState(null);
  const notifications = useNotifications();
  const modals = useModals();

  const placeBid = async (formValues) => {
    const notificationId = notifications.showNotification({
      loading: true,
      title: "Placing Bid",
      message:
        "Placing your bid on the auction, please approve the Metamask transaction",
      autoClose: false,
      disallowClose: true,
    });

    try {
      const marketContract = getContract({
        currentAccount,
        contractInfo: config.contracts.marketContract,
      });
      const options = { value: parseEther(formValues.bidAmount.toString()) };
      const txn = await marketContract.placeBid(auctionId, options);
      console.log("Transaction hash for placing bid:", txn.hash);
      const receipt = await txn.wait();
      console.log("Transaction receipt:", receipt);

      notifications.updateNotification(notificationId, {
        notificationId,
        color: "teal",
        title: "Bid placed",
        message: "Bid placed",
        icon: <BsFillCheckCircleFill />,
        autoClose: false,
        disallowClose: false,
      });
    } catch (error) {
      console.log(error);

      notifications.updateNotification(notificationId, {
        notificationId,
        color: "red",
        title: "Bid place failed",
        message: "An error occurred while placing bid",
        icon: <IoAlertCircleSharp />,
        autoClose: false,
        disallowClose: false,
      });
    }
  };

  const openPlaceBidModal = () => {
    modals.openConfirmModal({
      title: "Place Bid",
      children: <PlaceBidForm setFormValues={setFormValues} />,
      onConfirm: () => placeBid(formValues),
    });
  };

  return (
    <Button onClick={openPlaceBidModal} {...buttonProps}>
      {children}
    </Button>
  );
};
