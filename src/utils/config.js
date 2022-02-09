import abi from "./ArtSeaTokens.json";

const config = {
  contracts: {
    nftContract: {
      contractAddress: "0xEf814092C1fAb8acCa38f97DBa37FbC1ED490b2F",
      contractAbi: abi.abi,
    },
    marketContract: {
      contractAddress: "",
      contractAbi: null,
    },
  },
};

export default config;
