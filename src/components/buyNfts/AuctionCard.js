import { Anchor, Button, Card, Group, Image, List, Text } from "@mantine/core";
import { formatEther } from "ethers/lib/utils";
import { RiExternalLinkLine } from "react-icons/ri";
import urljoin from "url-join";
import config from "../../utils/config";
import { minifyAddress } from "../../utils/string";

export const AuctionCard = ({
  auctionDetails,
  currentAccount,
  currentNetwork,
  setPlaceBidModalOpened,
  setSelectedAuction,
  setFinalizeAuctionModalOpened,
  setIfSell,
}) => {
  const highestBidder = auctionDetails.highestBidder.toLowerCase();
  const highestBidAmount = formatEther(auctionDetails.highestBidAmount);
  const auctionCreator = auctionDetails.ownerAddress.toLowerCase();
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const openSeaLink = urljoin(
    config.networks[currentNetwork].openSeaUrl,
    config.contracts.nftContract.contractAddress,
    auctionDetails.tokenId.toString()
  );

  return (
    <Card shadow="sm">
      <Card.Section>
        <Image src={auctionDetails.nftMetadata.image} height={160}></Image>
      </Card.Section>
      <Group
        direction="column"
        grow={true}
        spacing="sm"
        style={{ marginTop: 5 }}
      >
        <Group position="apart">
          <Text size="lg" weight="bold">
            {auctionDetails.nftMetadata.name}
          </Text>
          <Text>{auctionDetails.tokenId.toNumber()}</Text>
        </Group>
        <Text>{auctionDetails.nftMetadata.description}</Text>
        <List>
          <List.Item>
            <Anchor href={auctionDetails.nftMetadataURI} target="_blank">
              Token Metadata <RiExternalLinkLine />
            </Anchor>
          </List.Item>
          <List.Item>
            <Anchor href={openSeaLink} target="_blank">
              View On OpenSea <RiExternalLinkLine />
            </Anchor>
          </List.Item>
        </List>
        {highestBidder === zeroAddress ? (
          <Text>No one has bid on this auction yet</Text>
        ) : (
          <Text>
            Current highest bid is of {highestBidAmount} $MATIC by{" "}
            {currentAccount === highestBidder ? "you" : highestBidder}:
          </Text>
        )}
        {auctionCreator === currentAccount ? (
          <>
            <Button
              onClick={() => {
                setSelectedAuction(auctionDetails);
                setFinalizeAuctionModalOpened(true);
                setIfSell(true);
              }}
            >
              Sell to current bidder
            </Button>
            <Button
              onClick={() => {
                setSelectedAuction(auctionDetails);
                setFinalizeAuctionModalOpened(true);
                setIfSell(false);
              }}
            >
              Cancel auction
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              setSelectedAuction(auctionDetails);
              setPlaceBidModalOpened(true);
            }}
          >
            Place bid
          </Button>
        )}
      </Group>
    </Card>
  );
};
