import { Group } from "@mantine/core";
import { useEffect, useState } from "react";
import getNftContract from "../../utils/blockchain";
import { NftCard } from "./NftCard";

export const ListNfts = async ({ currentAccount }) => {
  const [nfts, setNfts] = useState([]);

  const nftContract = await getNftContract();
  const fetchNfts = async () => {};

  useEffect(() => {});

  return (
    <Group>
      {nfts.map((nft) => (
        <NftCard nft={nft} />
      ))}
    </Group>
  );
};
