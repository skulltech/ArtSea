import { Group, NativeSelect, SimpleGrid, Skeleton } from "@mantine/core";
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
      <Group position="right">
        <NativeSelect
          value={forSaleFilter}
          onChange={(event) => setForSaleFilter(event.currentTarget.value)}
          data={forSaleFilterValues}
          label="Filter by sale status"
          required
        />
      </Group>
      <SimpleGrid
        cols={4}
        breakpoints={[
          { maxWidth: "lg", cols: 3 },
          { maxWidth: "md", cols: 2 },
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
            />
          )
        )}
      </SimpleGrid>
    </Group>
  );
};
