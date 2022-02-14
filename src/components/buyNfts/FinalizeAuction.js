import { Group, Text, Button } from "@mantine/core";
import { useState } from "react";
import getContract from "../../utils/blockchain";
import config from "../../utils/config";

export const FinalizeAuction = ({
  currentAccount,
  selectedAuction,
  ifSell,
}) => {
  const [finalizingAuction, setFinalizingAuction] = useState(false);

  const finalizeAuction = async () => {
    setFinalizingAuction(true);
    console.log(selectedAuction, ifSell);

    const marketContract = getContract({
      currentAccount,
      contractInfo: config.contracts.marketContract,
    });
    const txn = await marketContract.finalizeAuction(selectedAuction, ifSell);
    const receipt = await txn.wait();
    console.log("Receipt: ", receipt);

    setFinalizingAuction(false);
  };

  return (
    <Group>
      <Text>
        Are you sure you wanna{" "}
        {ifSell
          ? "sell your art to the current bidder?"
          : "cancel or delete this auction?"}
      </Text>
      <Button loading={finalizingAuction} onClick={finalizeAuction}>
        {ifSell
          ? finalizingAuction
            ? "Selling"
            : "Confirm sell"
          : finalizingAuction
          ? "Deleting"
          : "Confirm delete"}
      </Button>
    </Group>
  );
};
