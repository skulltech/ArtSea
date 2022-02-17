import { Anchor, Card, Group, Image, List, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { RiExternalLinkLine } from "react-icons/ri";
import urljoin from "url-join";
import config from "../utils/config";

export const InfoCard = ({
  currentNetwork,
  nftImageUrl,
  nftCollectionName,
  nftName,
  nftDescription,
  nftMetadataUri,
  nftContractAddress,
  nftId,
  children,
}) => {
  const { ref, width } = useElementSize();
  const openSeaLink = urljoin(
    config.networks[currentNetwork].openSeaUrl,
    nftContractAddress,
    nftId
  );

  return (
    <Card shadow="lg">
      <Card.Section>
        <Image src={nftImageUrl} ref={ref} height={width} fit="contain"></Image>
      </Card.Section>
      <Group
        direction="column"
        grow={true}
        spacing="xs"
        style={{ marginTop: 5 }}
      >
        <Text lineClamp={1} color="dimmed">
          {nftCollectionName}
        </Text>
        <Text size="lg" weight="bold" lineClamp={1}>
          {nftName}
        </Text>
        <Text>{nftDescription}</Text>
        <List>
          <List.Item>
            <Anchor href={nftMetadataUri} target="_blank">
              Token Metadata <RiExternalLinkLine />
            </Anchor>
          </List.Item>
          <List.Item>
            <Anchor href={openSeaLink} target="_blank">
              View On OpenSea <RiExternalLinkLine />
            </Anchor>
          </List.Item>
        </List>
        {children}
      </Group>
    </Card>
  );
};
