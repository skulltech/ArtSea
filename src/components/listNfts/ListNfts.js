import { Group, Modal } from "@mantine/core";
import { useEffect, useState } from "react";
import getContract from "../../utils/blockchain";
import { NftCard } from "./NftCard";
import { fetchWithTimeout } from "../../utils/fetch";
import { SellNft } from "./SellNft";
import config from "../../utils/config";

export const ListNfts = ({ currentAccount }) => {
  const [nfts, setNfts] = useState([]);
  const [sellNftModalOpened, setSellNftModalOpened] = useState(false);

  useEffect(() => {
    const fetchNfts = async () => {
      const nftContract = getContract({
        currentAccount,
        contractInfo: config.contracts.nftContract,
      });
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
    <>
      <Modal
        opened={sellNftModalOpened}
        onClose={() => setSellNftModalOpened(false)}
        title="Sell NFT"
        overlayOpacity={0.95}
      >
        <SellNft currentAccount={currentAccount} />
      </Modal>
      <Group>
        {nfts.map((nft) => (
          <NftCard
            nftDetails={nft}
            key={nft.tokenId}
            setSellNftModalOpened={setSellNftModalOpened}
          />
        ))}
      </Group>
    </>
  );
};
