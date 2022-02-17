import { Button, Group, TextInput, Text, Image, Anchor } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useForm } from "@mantine/hooks";
import { IoImageOutline } from "react-icons/io5";
import { useState } from "react";
import { getContract } from "../utils/utils";
import { useModals } from "@mantine/modals";
import config from "../utils/config.js";
import { NFTStorage } from "nft.storage";

export const MintNft = ({ currentAccount }) => {
  const [minting, setMinting] = useState(false);
  const modals = useModals();

  const mintingFinishedModal = (tokenUrl) => {
    modals.openModal({
      title: "NFT minted",
      children: (
        <>
          <Text>You can view your NFT at: </Text>
          <Anchor href={tokenUrl} target="_blank">
            {tokenUrl}
          </Anchor>
        </>
      ),
    });
  };

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      image: null,
    },
  });

  const handleFormSubmit = async (values) => {
    setMinting(true);
    let tokenId;

    try {
      const nft = {
        image: values.image,
        name: values.name,
        description: values.description,
      };
      const client = new NFTStorage({ token: config.nftStorage.key });
      const metadata = await client.store(nft);
      console.log("NFT data stored!");
      console.log("Metadata URI: ", metadata.url);
      const nftContract = getContract({
        currentAccount,
        contractInfo: config.contracts.nftContract,
      });
      let txn = await nftContract.safeMint(currentAccount, metadata.url);
      console.log("Transaction hash for minting the NFT:", txn.hash);
      const receipt = await txn.wait();
      console.log("Transaction receipt:", receipt);
      const transferEvent = receipt.events?.filter((x) => {
        return x.event === "Transfer";
      })[0];
      tokenId = transferEvent.args[2].toString();
      console.log("Transaction done, minted token ID:", tokenId);
    } catch (err) {
      console.log(err);
    }

    setMinting(false);
    const tokenUrl = `https://testnets.opensea.io/assets/mumbai/${config.contracts.nftContract.contractAddress}/${tokenId}`;
    mintingFinishedModal(tokenUrl);
  };

  const handleDropzoneDrop = (files) => {
    form.setValues({ ...form.values, image: files[0] });
  };

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Group direction="column" position="center" grow={true}>
        <TextInput required label="Name" {...form.getInputProps("name")} />
        <TextInput
          required
          label="Description"
          {...form.getInputProps("description")}
        />
        <Dropzone onDrop={handleDropzoneDrop} multiple={false}>
          {() => (
            <Group position="center" direction="column">
              {form.values.image ? (
                <Image
                  radius="md"
                  height="300px"
                  src={URL.createObjectURL(form.values.image)}
                  alt="Image to mint an NFT of"
                  withPlaceholder
                />
              ) : (
                <IoImageOutline style={{ height: 80, width: 80 }} />
              )}
              <Text weight="semibold">
                Drag image here or click to select file
              </Text>
            </Group>
          )}
        </Dropzone>
        <Button type="submit" loading={minting}>
          {minting ? "Minting" : "Mint"}
        </Button>
      </Group>
    </form>
  );
};
