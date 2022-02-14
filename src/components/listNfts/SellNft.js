import { Button, Group, NativeSelect, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { parseEther } from "ethers/lib/utils";
import { useState } from "react";
import getContract from "../../utils/blockchain";
import config from "../../utils/config";

export const SellNft = ({ currentAccount, tokenToSell }) => {
  const form = useForm({
    initialValues: {
      minBidAmount: null,
      tokenId: null,
      auctionDuration: 1,
    },
  });
  const auctionDurationValues = [
    { value: 1, label: "1 day" },
    { value: 3, label: "3 days" },
    { value: 5, label: "5 days" },
    { value: 7, label: "7 days" },
    { value: 10, label: "10 days" },
  ];
  const [creatingAuction, setCreatingAuction] = useState(false);

  const createAuction = async () => {
    setCreatingAuction(true);

    const marketContract = getContract({
      currentAccount,
      contractInfo: config.contracts.marketContract,
    });
    const txn = await marketContract.createAuction(
      config.contracts.nftContract.contractAddress,
      tokenToSell,
      parseEther(form.values.minBidAmount.toString()),
      form.values.auctionDuration * 86400
    );
    console.log("Transaction hash for creating auction:", txn.hash);
    const receipt = await txn.wait();
    console.log("Transaction receipt:", receipt);
    const auctionCreatedEvent = receipt.events.filter((x) => {
      return x.event === "AuctionCreated";
    })[0];
    const auctionId = auctionCreatedEvent.args[0].toString();
    console.log("Transaction done, auction ID:", auctionId);

    setCreatingAuction(false);
  };

  return (
    <form onSubmit={form.onSubmit(createAuction)}>
      <Group direction="column" grow="true">
        <NumberInput
          placeholder="Minimum bid amount in $MATIC"
          label="Minimum bid amount in $MATIC"
          required
          precision={18}
          {...form.getInputProps("minBidAmount")}
        />
        <NativeSelect
          value={form.values.auctionDuration}
          onChange={(event) =>
            form.setFieldValue("auctionDuration", event.currentTarget.value)
          }
          data={auctionDurationValues}
          label="Duration of the auction"
          required
        />
        <Button type="submit" loading={creatingAuction}>
          {!creatingAuction && "Place your auction"}
          {creatingAuction && "Creating Auction"}
        </Button>
      </Group>
    </form>
  );
};
