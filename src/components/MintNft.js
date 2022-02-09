import { Button, Group, TextInput, Text, Image } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useForm } from "@mantine/hooks";
import { IoImageOutline } from "react-icons/io5";
import { create } from "ipfs-http-client";
import { useState } from "react";
import getContract from "../utils/blockchain";
import { useModals } from "@mantine/modals";
import config from "../utils/config.js";

export const MintNft = ({ currentAccount }) => {
  const [minting, setMinting] = useState(false);
  const modals = useModals();

  const mintingFinishedModal = (tokenUrl) => {
    modals.openModal({
      title: "NFT minted",
      children: (
        <>
          <Text> The url is: {tokenUrl} </Text>
        </>
      ),
    });
  };

  const uploadToIpfs = async (file) => {
    const ipfsClient = create({
      host: process.env.IPFS_HOST,
      port: 5001,
      apiPath: process.env.IPFS_PATH,
    });
    const { cid } = await ipfsClient.add({ content: file });
    return "https://ipfs.io/ipfs/" + cid;
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
      const imageUrl = await uploadToIpfs(values.image);
      console.log("Image uploaded to IPFS at:", imageUrl);
      const metadata = {
        name: values.name,
        description: values.description,
        image: imageUrl,
      };
      const metadataUrl = await uploadToIpfs(JSON.stringify(metadata));
      console.log("Metadata uploaded to IPFS at:", metadataUrl);
      const nftContract = getContract({
        currentAccount,
        contractInfo: config.contracts.nftContract,
      });
      let txn = await nftContract.safeMint(currentAccount, metadataUrl);
      console.log("Transaction hash for minting the NFT:", txn.hash);
      const receipt = await txn.wait();
      console.log("Transaction receipt:", receipt);
      const transferEvent = receipt.events?.filter((x) => {
        return x.event === "Transfer";
      })[0];
      tokenId = transferEvent.args[2].toNumber();
      console.log("Transaction done, minted token ID:", tokenId);
    } catch (err) {
      console.log(err);
    }

    setMinting(false);
    const tokenUrl = `https://testnets.opensea.io/assets/mumbai/${config.nftContractAddress}/${tokenId}`;
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
          {!minting && "Mint"}
          {minting && "Minting"}
        </Button>
      </Group>
    </form>
  );
};
