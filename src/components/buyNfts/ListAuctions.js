import { Center, Group, Loader, Modal } from "@mantine/core";
import { useEffect } from "react";
import { useState } from "react/cjs/react.development";
import getContract from "../../utils/blockchain";
import config from "../../utils/config";
import { AuctionCard } from "./AuctionCard";
import { PlaceBid } from "./PlaceBid";

export const ListAuctions = ({ currentAccount }) => {
  const [auctions, setAuctions] = useState([]);
  const [auctionToBidOn, setAuctionToBidOn] = useState(null);
  const [fetchingAuctions, setFetchingAuctions] = useState(false);
  const [placeBidModalOpened, setPlaceBidModalOpened] = useState(false);

  useEffect(() => {
    const fetchAuctions = async () => {
      setFetchingAuctions(true);

      try {
        const marketContract = getContract({
          currentAccount,
          contractInfo: config.contracts.marketContract,
        });
        const auctionsCount = (await marketContract.auctionIds()).toNumber();
        const allAuctions = await Promise.all(
          [...Array(auctionsCount).keys()].map(async (index) => {
            const auctionInfo = await marketContract.auctions(index);
            return { ...auctionInfo, auctionId: index };
          })
        );
        console.log(allAuctions);
        setAuctions(allAuctions);
      } catch (error) {
        console.log(error);
      }

      setFetchingAuctions(false);
    };

    fetchAuctions();
  }, [currentAccount]);

  if (fetchingAuctions) {
    return (
      <Center padding="lg">
        <Loader />
      </Center>
    );
  } else {
    return (
      <>
        <Modal
          opened={placeBidModalOpened}
          onClose={() => setPlaceBidModalOpened(false)}
          title="Place bid"
          overlayOpacity={0.95}
        >
          <PlaceBid
            currentAccount={currentAccount}
            auctionToBidOn={auctionToBidOn}
          />
        </Modal>

        <Group>
          {auctions.map((auction) => (
            <AuctionCard
              auctionDetails={auction}
              key={auction.auctionId}
              currentAccount={currentAccount}
              setAuctionToBidOn={setAuctionToBidOn}
              setPlaceBidModalOpened={setPlaceBidModalOpened}
            />
          ))}
        </Group>
      </>
    );
  }
};
