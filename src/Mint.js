import { Button, TextInput } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useForm } from "@mantine/hooks";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { useState } from "react";

import abi from "./utils/NFT.json";

export const MintNFTForm = ({ currentAccount }) => {
  const [minting, setMinting] = useState(false);
  const nftContractAddress = "0x4C7915eE75fe27C802363e79179708a19C7E779A";
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
      host: "ipfs.infura.io",
      port: "5001",
      apiPath: "/api/v0",
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
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <TextInput required label="Name" {...form.getInputProps("name")} />
      <TextInput
        required
        label="Description"
        {...form.getInputProps("description")}
      />
      <Dropzone onDrop={handleDropzoneDrop} multiple={false}>
        {() => null}
      </Dropzone>
      <Button type="submit" loading={minting}>
        Submit
      </Button>
    </form>
  );
};
