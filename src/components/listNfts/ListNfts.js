import { Group } from "@mantine/core";
import { useEffect, useState } from "react";
import getNftContract from "../../utils/blockchain";
import { NftCard } from "./NftCard";
import { fetchWithTimeout } from "../../utils/fetch";

export const ListNfts = ({ currentAccount }) => {
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    const fetchNfts = async () => {
      const nftContract = getNftContract({ currentAccount });
      const balance = (await nftContract.balanceOf(currentAccount)).toNumber();
      const nftsOwned = await Promise.all(
        [...Array(balance).keys()].map(async (index) => {
          const tokenId = await nftContract.tokenOfOwnerByIndex(
            currentAccount,
            index
          );
          const tokenURI = await nftContract.tokenURI(tokenId);
          let tokenMetadata;
          try {
            tokenMetadata = await (await fetchWithTimeout(tokenURI)).json();
          } catch (err) {
            console.log(err);
          }
          return { tokenId, tokenURI, tokenMetadata };
        })
      );
      console.log(nftsOwned);
      setNfts(nftsOwned);
    };

    fetchNfts();
  }, [currentAccount]);

  return (
    <Group>
      {nfts.map((nft) => (
        <NftCard nftDetails={nft} key={nft.tokenId} />
      ))}
    </Group>
  );
};
