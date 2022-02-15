import { Center, Group, Loader, Modal } from "@mantine/core";
import { useEffect, useState } from "react";
import getContract from "../../utils/blockchain";
import { NftCard } from "./NftCard";
import { fetchWithTimeout } from "../../utils/fetch";
import { SellNft } from "./SellNft";
import config from "../../utils/config";
import { fetchJson } from "ethers/lib/utils";

export const ListNfts = ({ currentAccount, currentNetwork }) => {
  const [nfts, setNfts] = useState([]);
  const [sellNftModalOpened, setSellNftModalOpened] = useState(false);
  const [tokenToSell, setTokenToSell] = useState(null);
  const [fetchingNfts, setFetchingNfts] = useState(false);

  useEffect(() => {
    const fetchNfts = async () => {
      setFetchingNfts(true);

      const nftContract = getContract({
        currentAccount,
        contractInfo: config.contracts.nftContract,
      });
      const marketContract = getContract({
        currentAccount,
        contractInfo: config.contracts.marketContract,
      });
      const balance = (await nftContract.balanceOf(currentAccount)).toNumber();
      const nftsOwned = await Promise.all(
        [...Array(balance).keys()].map(async (index) => {
          const tokenId = await nftContract.tokenOfOwnerByIndex(
            currentAccount,
            index
          );
          const tokenURI = await nftContract.tokenURI(tokenId);
          const tokenMetadata = await fetchJson(tokenURI);
          const forSale = await marketContract.tokenIsForSale(
            config.contracts.nftContract.contractAddress,
            tokenId
          );
          return { tokenId, tokenURI, tokenMetadata, tokenIsForSale: forSale };
        })
      );
      console.log(nftsOwned);
      setNfts(nftsOwned);

      setFetchingNfts(false);
    };

    fetchNfts();
  }, [currentAccount]);

  if (fetchingNfts) {
    return (
      <Center padding="lg">
        <Loader />
      </Center>
    );
  } else {
    return (
      <>
        <Modal
          opened={sellNftModalOpened}
          onClose={() => setSellNftModalOpened(false)}
          title="Sell NFT"
          overlayOpacity={0.95}
        >
          <SellNft currentAccount={currentAccount} tokenToSell={tokenToSell} />
        </Modal>
        <Group>
          {nfts.map((nft) => (
            <NftCard
              nftDetails={nft}
              key={nft.tokenId}
              setSellNftModalOpened={setSellNftModalOpened}
              setTokenToSell={setTokenToSell}
              currentNetwork={currentNetwork}
            />
          ))}
        </Group>
      </>
    );
  }
};
