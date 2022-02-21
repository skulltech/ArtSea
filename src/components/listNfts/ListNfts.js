import {
  Divider,
  Group,
  NativeSelect,
  SimpleGrid,
  Skeleton,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { NftCard } from "./NftCard";

export const ListNfts = ({ currentAccount, currentNetwork, allNfts }) => {
  const [forSaleFilter, setForSaleFilter] = useState("all");
  const [nftsToShow, setNftsToShow] = useState([]);

  const forSaleFilterValues = [
    { value: "forSale", label: "For sale" },
    { value: "notForSale", label: "Not for sale" },
    { value: "all", label: "All" },
  ];

  useEffect(() => {
    const forSaleFilterFuncs = {
      all: (auction) => true,
      forSale: (nft) => nft.tokenIsForSale,
      notForSale: (nft) => !nft.tokenIsForSale,
    };
    const nfts = allNfts.filter(forSaleFilterFuncs[forSaleFilter]);
    setNftsToShow(nfts);
  }, [allNfts, forSaleFilter, currentAccount]);

  return (
    <Group direction="column" grow={true}>
      <Group position="apart">
        <NativeSelect
          value={forSaleFilter}
          onChange={(event) => setForSaleFilter(event.currentTarget.value)}
          data={forSaleFilterValues}
          label="Filter by sale status"
          required
        />
      </Group>
      <Divider label="NFTs" />
      <SimpleGrid
        cols={4}
        breakpoints={[
          { maxWidth: "sm", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        {nftsToShow.map((nft) =>
          nft.loading ? (
            <Skeleton key={nft.tokenId} />
          ) : (
            <NftCard
              nftDetails={nft}
              key={nft.tokenId}
              currentNetwork={currentNetwork}
              currentAccount={currentAccount}
            />
          )
        )}
      </SimpleGrid>
    </Group>
  );
};
