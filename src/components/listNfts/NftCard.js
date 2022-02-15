import {
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Image,
  List,
  Text,
} from "@mantine/core";
import { RiExternalLinkLine } from "react-icons/ri";
import urljoin from "url-join";
import config from "../../utils/config";

export const NftCard = ({
  nftDetails,
  setSellNftModalOpened,
  setTokenToSell,
  currentNetwork,
}) => {
  const openSeaLink = urljoin(
    config.networks[currentNetwork].openSeaUrl,
    config.contracts.nftContract.contractAddress,
    nftDetails.tokenId.toString()
  );

  return (
    <Card shadow="sm">
      <Card.Section>
        <Image src={nftDetails.tokenMetadata.image} height={160}></Image>
      </Card.Section>
      <Group
        direction="column"
        grow={true}
        spacing="sm"
        style={{ marginTop: 5 }}
      >
        <Text weight="bold">{nftDetails.tokenMetadata.name}</Text>
        <Text>{nftDetails.tokenMetadata.description}</Text>
        <Text size="sm">
          {config.contracts.nftContract.contractAddress} ::{" "}
          {nftDetails.tokenId.toNumber()}
        </Text>
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
          <Badge>For Sale</Badge>
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
