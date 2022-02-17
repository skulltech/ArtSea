import { Group, Text, Button } from "@mantine/core";
import { useState } from "react";
import { getContract } from "../../utils/utils";
import config from "../../utils/config";
import ERC721Abi from "@solidstate/abi/ERC721.json";

export const FinalizeAuction = ({
  currentAccount,
  selectedAuction,
  ifSell,
}) => {
  const [finalizingAuction, setFinalizingAuction] = useState(false);

  const finalizeAuction = async () => {
    setFinalizingAuction(true);
    let txn, receipt;

    if (ifSell) {
      const nftContract = getContract({
        currentAccount,
        contractInfo: {
          contractAbi: ERC721Abi,
          contractAddress: selectedAuction.tokenAddress,
        },
      });
      txn = await nftContract.approve(
        config.contracts.marketContract.contractAddress,
        selectedAuction.tokenId
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
      selectedAuction.auctionId,
      ifSell
    );
    receipt = await txn.wait();
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
