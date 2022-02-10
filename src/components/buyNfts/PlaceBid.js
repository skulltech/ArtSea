import { Button, Group, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { parseEther } from "ethers/lib/utils";
import { useState } from "react";
import getContract from "../../utils/blockchain";
import config from "../../utils/config";

export const PlaceBid = ({ currentAccount, auctionToBidOn }) => {
  const form = useForm({
    initialValues: {
      bidAmount: 0,
    },
  });
  const [placingBid, setPlacingBid] = useState(false);

  const placeBid = async () => {
    setPlacingBid(true);

    const marketContract = getContract({
      currentAccount,
      contractInfo: config.contracts.marketContract,
    });
    const options = { value: parseEther(form.values.bidAmount.toString()) };
    const txn = await marketContract.placeBid(auctionToBidOn, options);
    console.log("Transaction hash for placing bid:", txn.hash);
    const receipt = await txn.wait();
    console.log("Transaction receipt:", receipt);

    setPlacingBid(false);
  };

  return (
    <form onSubmit={form.onSubmit(placeBid)}>
      <Group direction="column" grow="true">
        <NumberInput
          placeholder="Bid amount in $MATIC"
          label="Bid amount in $MATIC"
          required
          precision={18}
          {...form.getInputProps("bidAmount")}
        />
        <Button type="submit" loading={placingBid}>
          {!placingBid && "Place your bid"}
          {placingBid && "Placing bid"}
        </Button>
      </Group>
    </form>
  );
};
