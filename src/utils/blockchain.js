import { ethers } from "ethers";

const getContract = ({ currentAccount, contractInfo }) => {
  const { ethereum } = window;
  if (!ethereum) {
    console.log("Ethereum object not found");
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
export default getContract;
