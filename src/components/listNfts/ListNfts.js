import {
  Button,
  Center,
  Divider,
  Group,
  Loader,
  NativeSelect,
  SimpleGrid,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { NftCard } from "./NftCard";
import config from "../../utils/config";
import { fetchJson } from "ethers/lib/utils";
import { ipfsToHttp, getContract } from "../../utils/utils";
import { HiOutlineCloudUpload } from "react-icons/hi";

export const ListNfts = ({
  currentAccount,
  currentNetwork,
  allNfts,
  setAllNfts,
}) => {
  const [fetchingNfts, setFetchingNfts] = useState(false);

  const [forSaleFilter, setForSaleFilter] = useState("all");
  const [nftsToShow, setNftsToShow] = useState([]);

  const forSaleFilterValues = [
    { value: "forSale", label: "For sale" },
    { value: "notForSale", label: "Not for sale" },
    { value: "all", label: "All" },
  ];

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
          let tokenMetadata;
          try {
            tokenMetadata = await fetchJson({
              url: ipfsToHttp(tokenURI),
              timeout: 3 * 1000,
            });
          } catch (error) {
            console.log(error);
          }
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
      setAllNfts(nftsOwned);

      setFetchingNfts(false);
    };

    fetchNfts();
  }, [currentAccount, setAllNfts]);

  useEffect(() => {
    const forSaleFilterFuncs = {
      all: (auction) => true,
      forSale: (nft) => nft.tokenIsForSale,
      notForSale: (nft) => !nft.tokenIsForSale,
    };
    const nfts = allNfts.filter(forSaleFilterFuncs[forSaleFilter]);
    setNftsToShow(nfts);
  }, [allNfts, forSaleFilter, currentAccount]);

  return fetchingNfts ? (
    <Center padding="lg">
      <Loader />
    </Center>
  ) : (
    <Group direction="column" grow={true}>
      <Group position="apart">
        <NativeSelect
          value={forSaleFilter}
          onChange={(event) => setForSaleFilter(event.currentTarget.value)}
          data={forSaleFilterValues}
          label="Filter by sale status"
          required
        />
        <Button leftIcon={<HiOutlineCloudUpload />}>Mint an NFT</Button>
      </Group>
      <Divider label="NFTs" />
      <SimpleGrid
        cols={4}
        breakpoints={[
          { maxWidth: "sm", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        {nftsToShow.map((nft) => (
          <NftCard
            nftDetails={nft}
            key={nft.tokenId}
            currentNetwork={currentNetwork}
            currentAccount={currentAccount}
          />
        ))}
      </SimpleGrid>
    </Group>
  );
};
