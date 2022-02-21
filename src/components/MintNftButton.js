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

const mintNft = async ({ currentAccount, image, name, description }) => {
  const nft = {
    image: image,
    name: name,
    description: description,
  };
  const client = new NFTStorage({ token: config.nftStorage.key });
  const metadata = await client.store(nft);
  console.log("NFT data stored @", metadata.url);
  const nftContract = getContract({
    currentAccount,
    contractInfo: config.contracts.nftContract,
  });
  let txn = await nftContract.safeMint(currentAccount, metadata.url);
  console.log("Transaction hash for minting NFT:", txn.hash);
  const receipt = await txn.wait();
  console.log("Transaction receipt:", receipt);
  const transferEvent = receipt.events?.filter((x) => {
    return x.event === "Transfer";
  })[0];
  const tokenId = transferEvent.args[2].toString();
  console.log("Transaction done, minted token ID:", tokenId);
  return `https://testnets.opensea.io/assets/mumbai/${config.contracts.nftContract.contractAddress}/${tokenId}`;
};

const MintNftForm = ({ currentAccount, closeModal }) => {
  const notifications = useNotifications();

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

  const handleFormSubmit = async (formValues) => {
    const notificationId = notifications.showNotification({
      loading: true,
      title: "Minting your NFT",
      message: "Minting your NFT, please approve the Metamask transaction",
      autoClose: false,
      disallowClose: true,
    });

    try {
      const tokenUrl = await mintNft({
        currentAccount,
        image: formValues.image,
        name: formValues.name,
        description: formValues.description,
      });

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
    } catch (error) {
      console.log(error);
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

  return (
    <form
      onSubmit={form.onSubmit((formValues) => {
        closeModal();
        handleFormSubmit(formValues);
      })}
    >
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
        <Group position="right">
          <Button onClick={closeModal} variant="default">
            Cancel
          </Button>
          <Button type="submit">Confirm</Button>
        </Group>
      </Group>
    </form>
  );
};

export const MintNftButton = ({ currentAccount, buttonProps, children }) => {
  const modals = useModals();

  const openMintNftModal = () => {
    const modalId = modals.openModal({
      title: "Mint an NFT",
      children: (
        <MintNftForm
          currentAccount={currentAccount}
          closeModal={() => modals.closeModal(modalId)}
        />
      ),
    });
  };

  return (
    <Button {...buttonProps} onClick={openMintNftModal}>
      {children}
    </Button>
  );
};
