import { Button, Group, TextInput, Text, Image, Anchor } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useForm } from "@mantine/hooks";
import { IoImageOutline } from "react-icons/io5";
import { getContract } from "../utils/utils";
import config from "../utils/config.js";
import { NFTStorage } from "nft.storage";
import { useNotifications } from "@mantine/notifications";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { IoAlertCircleSharp } from "react-icons/io5";
import { useModals } from "@mantine/modals";
import { useEffect, useState } from "react";

const MintNftForm = ({ setFormValues }) => {
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      image: null,
    },
  });

  const handleDropzoneDrop = (files) => {
    form.setValues({ ...form.values, image: files[0] });
  };

  useEffect(() => {
    setFormValues(form.values);
  }, [form.values, setFormValues]);

  return (
    <form>
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
      </Group>
    </form>
  );
};

export const MintNftButton = ({ currentAccount, buttonProps, children }) => {
  const [formValues, setFormValues] = useState(null);
  const notifications = useNotifications();
  const modals = useModals();

  const mintNft = async (formValues) => {
    const notificationId = notifications.showNotification({
      loading: true,
      title: "Minting your NFT",
      message: "Minting your NFT, please approve the Metamask transaction",
      autoClose: false,
      disallowClose: true,
    });

    try {
      const nft = {
        image: formValues.image,
        name: formValues.name,
        description: formValues.description,
      };
      const client = new NFTStorage({ token: config.nftStorage.key });
      const metadata = await client.store(nft);
      console.log("NFT data stored @", metadata.url);
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
      const tokenId = transferEvent.args[2].toString();
      console.log("Transaction done, minted token ID:", tokenId);
      const tokenUrl = `https://testnets.opensea.io/assets/mumbai/${config.contracts.nftContract.contractAddress}/${tokenId}`;

      notifications.updateNotification(notificationId, {
        notificationId,
        color: "teal",
        title: "NFT is minted",
        message: (
          <>
            <Text>You can view your NFT at: </Text>
            <Anchor href={tokenUrl} target="_blank">
              {tokenUrl}
            </Anchor>
          </>
        ),
        icon: <BsFillCheckCircleFill />,
        autoClose: false,
        disallowClose: false,
      });
    } catch (err) {
      console.log(err);
      notifications.updateNotification(notificationId, {
        notificationId,
        color: "red",
        title: "NFT minting failed",
        message: "An error occurred while minting your NFT",
        icon: <IoAlertCircleSharp />,
        autoClose: false,
        disallowClose: false,
      });
    }
  };

  const openMintNftModal = () => {
    modals.openConfirmModal({
      title: "Mint an NFT",
      children: <MintNftForm setFormValues={setFormValues} />,
      onConfirm: () => mintNft(formValues),
    });
  };

  return (
    <Button {...buttonProps} onClick={openMintNftModal}>
      {children}
    </Button>
  );
};
