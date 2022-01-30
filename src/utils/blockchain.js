import { ethers } from "ethers";
import config from "../config";

const getNftContract = ({ currentAccount }) => {
  const { ethereum } = window;
  if (!ethereum) {
    console.log("Ethereum object not found");
    return null;
  }
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner(currentAccount);
  const nftContract = new ethers.Contract(
    config.nftContractAddress,
    config.nftContractAbi,
    signer
  );
  return nftContract;
};

export default getNftContract;
