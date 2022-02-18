import { Button, Group, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { parseEther } from "ethers/lib/utils";
import { getContract } from "../../utils/utils";
import config from "../../utils/config";

export const PlaceBidForm = ({ currentAccount, auctionId, setTransacting }) => {
  const form = useForm({
    initialValues: {
      bidAmount: 0,
    },
  });

  const placeBid = async () => {
    setTransacting(true);

    try {
      const marketContract = getContract({
        currentAccount,
        contractInfo: config.contracts.marketContract,
      });
      const options = { value: parseEther(form.values.bidAmount.toString()) };
      const txn = await marketContract.placeBid(auctionId, options);
      console.log("Transaction hash for placing bid:", txn.hash);
      const receipt = await txn.wait();
      console.log("Transaction receipt:", receipt);
    } catch (error) {
      console.log(error);
    }

    setTransacting(false);
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
        <Button type="submit">"Place your bid"</Button>
      </Group>
    </form>
  );
};
