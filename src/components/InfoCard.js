import { Anchor, Card, Group, Image, List, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { RiExternalLinkLine } from "react-icons/ri";
import urljoin from "url-join";
import config from "../utils/config";
import { ipfsToHttp } from "../utils/utils";

export const InfoCard = ({
  currentNetwork,
  nftImageUri,
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
        <Image
          src={nftImageUri ? ipfsToHttp(nftImageUri) : null}
          ref={ref}
          height={width}
          fit="contain"
          withPlaceholder={true}
        ></Image>
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
        {nftDescription ? (
          <Text lineClamp={1}>{nftDescription}</Text>
        ) : (
          <Text lineClamp={1} color="dimmed">
            No description available
          </Text>
        )}
        <List>
          <List.Item>
            <Anchor href={ipfsToHttp(nftMetadataUri)} target="_blank">
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
