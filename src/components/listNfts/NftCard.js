import { Anchor, Button, Card, Group, Image, List, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { RiExternalLinkLine } from "react-icons/ri";
import urljoin from "url-join";
import config from "../../utils/config";
import { minifyAddress } from "../../utils/string";

export const NftCard = ({
  nftDetails,
  setSellNftModalOpened,
  setTokenToSell,
  currentNetwork,
}) => {
  const { ref, width } = useElementSize();

  const openSeaLink = urljoin(
    config.networks[currentNetwork].openSeaUrl,
    config.contracts.nftContract.contractAddress,
    nftDetails.tokenId.toString()
  );

  return (
    <Card shadow="lg">
      <Card.Section>
        <Image
          src={nftDetails.tokenMetadata.image}
          ref={ref}
          height={width}
          fit="contain"
        ></Image>
      </Card.Section>
      <Group
        direction="column"
        grow={true}
        spacing="xs"
        style={{ marginTop: 5 }}
      >
        <Text lineClamp={1} color="dimmed">
          {nftDetails.collectionName}
        </Text>
        <Text size="lg" weight="bold" lineClamp={1}>
          {nftDetails.tokenMetadata.name}
        </Text>
        <Text>{nftDetails.tokenMetadata.description}</Text>
        <List>
          <List.Item>
            <Anchor href={nftDetails.tokenURI} target="_blank">
              Token Metadata <RiExternalLinkLine />
            </Anchor>
          </List.Item>
          <List.Item>
            <Anchor href={openSeaLink} target="_blank">
              View On OpenSea <RiExternalLinkLine />
            </Anchor>
          </List.Item>
        </List>
        {nftDetails.tokenIsForSale ? (
          <Button disabled={true}>For Sale</Button>
        ) : (
          <Button
            onClick={() => {
              setSellNftModalOpened(true);
              setTokenToSell(nftDetails.tokenId.toNumber());
            }}
          >
            Sell this NFT
          </Button>
        )}
      </Group>
    </Card>
  );
};
