import { Center, Loader, Modal, SimpleGrid } from "@mantine/core";
import { useEffect, useState } from "react";
import { NftCard } from "./NftCard";
import { SellNft } from "./SellNft";
import config from "../../utils/config";
import { fetchJson } from "ethers/lib/utils";
import { ipfsToHttp, getContract } from "../../utils/utils";

export const ListNfts = ({ currentAccount, currentNetwork, nfts, setNfts }) => {
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
      const collectionName = await nftContract.name();
      const balance = (await nftContract.balanceOf(currentAccount)).toNumber();
      const nftsOwned = await Promise.all(
        [...Array(balance).keys()].map(async (index) => {
          const tokenId = await nftContract.tokenOfOwnerByIndex(
            currentAccount,
            index
          );
          const tokenURI = await nftContract.tokenURI(tokenId);
          const tokenMetadata = await fetchJson(ipfsToHttp(tokenURI));
          const forSale = await marketContract.tokenIsForSale(
            config.contracts.nftContract.contractAddress,
            tokenId
          );
          return {
            collectionName,
            tokenId,
            tokenURI,
            tokenMetadata,
            tokenIsForSale: forSale,
          };
        })
      );
      console.log(nftsOwned);
      setNfts(nftsOwned);

      setFetchingNfts(false);
    };

    fetchNfts();
  }, [currentAccount, setNfts]);

  return fetchingNfts ? (
    <Center padding="lg">
      <Loader />
    </Center>
  ) : (
    <>
      <Modal
        opened={sellNftModalOpened}
        onClose={() => setSellNftModalOpened(false)}
        title="Sell NFT"
        overlayOpacity={0.95}
      >
        <SellNft currentAccount={currentAccount} tokenToSell={tokenToSell} />
      </Modal>
      <SimpleGrid
        cols={2}
        breakpoints={[
          { maxWidth: "sm", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        {nfts.map((nft) => (
          <NftCard
            nftDetails={nft}
            key={nft.tokenId}
            setSellNftModalOpened={setSellNftModalOpened}
            setTokenToSell={setTokenToSell}
            currentNetwork={currentNetwork}
          />
        ))}
      </SimpleGrid>
    </>
  );
};
