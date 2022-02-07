import { Card, Image } from "@mantine/core";

export const NftCard = ({ nftDetails }) => {
  return (
    <Card>
      <Card.Section></Card.Section>
      {nftDetails.tokenURI}
    </Card>
  );
};
