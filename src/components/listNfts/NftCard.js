import { Button, Card, Image, Text } from "@mantine/core";

export const NftCard = ({
  nftDetails,
  setSellNftModalOpened,
  setTokenToSell,
}) => {
  return (
    <Card padding="lg">
      {nftDetails.tokenMetadata && (
        <Card.Section>
          <Image src={nftDetails.tokenMetadata.image} height={160}></Image>
          <Text>{nftDetails.tokenMetadata.name}</Text>
          <Text size="sm">{nftDetails.tokenMetadata.description}</Text>
          <Button
            onClick={() => {
              setSellNftModalOpened(true);
              setTokenToSell(nftDetails.tokenId.toNumber());
            }}
          >
            Sell this NFT
          </Button>
        </Card.Section>
      )}
      {!nftDetails.tokenMetadata && "Problemo"}
    </Card>
  );
};
