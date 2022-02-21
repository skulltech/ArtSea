import { ethers } from "ethers";
import urljoin from "url-join";
import config from "./config";

export const getContract = ({ currentAccount, contractInfo }) => {
  const { ethereum } = window;
  if (!ethereum) {
    return null;
  }
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner(currentAccount);
  const contract = new ethers.Contract(
    contractInfo.contractAddress,
    contractInfo.contractAbi,
    signer
  );
  return contract;
};

export const minifyAddress = (address) => {
  return address.slice(0, 5) + "..." + address.slice(-4);
};

export const ipfsToHttp = (uri) => {
  if (uri.startsWith("ipfs://")) {
    return urljoin(config.ipfs.gateway, "ipfs", uri.slice(7));
  }
  return uri;
};
