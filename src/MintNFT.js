import {
  Button,
  Container,
  Group,
  TextInput,
  Text,
  Image,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useForm } from "@mantine/hooks";
import { ImageIcon } from "@modulz/radix-icons";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { useState } from "react";

import abi from "./utils/NFT.json";

export const MintNFT = ({ currentAccount }) => {
  const [minting, setMinting] = useState(false);
  const nftContractAddress = "0x9aC000EEDD21A8bdB4362f27FC9D6dA33B016B31";
  const nftContractAbi = abi.abi;

  const getNftContract = () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Ethereum object not found");
      return null;
    }
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner(currentAccount);
    const nftContract = new ethers.Contract(
      nftContractAddress,
      nftContractAbi,
      signer
    );
    return nftContract;
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

      const nftContract = getNftContract();
      let txn = await nftContract.createToken(metadataUrl);
      console.log("Transaction hash for minting the NFT:", txn.hash);
      const receipt = await txn.wait();
      const transferEvent = receipt.events?.filter((x) => {
        return x.event === "Transfer";
      })[0];
      const tokenId = transferEvent.args[2].toString();
      console.log("Transaction done, minted token ID:", tokenId);
    } catch (err) {
      console.log(err);
    }

    setMinting(false);
  };

  const handleDropzoneDrop = (files) => {
    form.setValues({ ...form.values, image: files[0] });
  };

  return (
    <Container>
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
                    height="400px"
                    src={URL.createObjectURL(form.values.image)}
                    alt="Image to mint an NFT of"
                    withPlaceholder
                  />
                ) : (
                  <ImageIcon style={{ height: 80, width: 80 }} />
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
    </Container>
  );
};
