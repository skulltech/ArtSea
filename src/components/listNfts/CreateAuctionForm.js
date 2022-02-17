import { Button, Group, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { parseEther } from "ethers/lib/utils";
import { getContract } from "../../utils/utils";
import config from "../../utils/config";

export const CreateAuctionForm = ({
  currentAccount,
  tokenId,
  setTransacting,
}) => {
  const form = useForm({
    initialValues: {
      minBidAmount: null,
      tokenId: null,
    },
  });

  const createAuction = async () => {
    setTransacting(true);

    const marketContract = getContract({
      currentAccount,
      contractInfo: config.contracts.marketContract,
    });
    const txn = await marketContract.createAuction(
      config.contracts.nftContract.contractAddress,
      tokenId,
      parseEther(form.values.minBidAmount.toString())
    );
    console.log("Transaction hash for creating auction:", txn.hash);
    const receipt = await txn.wait();
    console.log("Transaction receipt:", receipt);
    const auctionCreatedEvent = receipt.events.filter((x) => {
      return x.event === "AuctionCreated";
    })[0];
    const auctionId = auctionCreatedEvent.args[0].toString();
    console.log("Transaction done, auction ID:", auctionId);

    setTransacting(false);
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
        <Button type="submit" onClick={createAuction}>
          Create Auction
        </Button>
      </Group>
    </form>
  );
};