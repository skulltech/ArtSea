import tokenJson from "../data/ArtSeaTokens.json";
import marketJson from "../data/ArtSeaMarket.json";
import configJson from "../data/config.json";

const config = {
  contracts: {
    nftContract: {
      contractAddress: configJson.nftContractAddress,
      contractAbi: tokenJson.abi,
    },
    marketContract: {
      contractAddress: configJson.marketContractAddress,
      contractAbi: marketJson.abi,
    },
  },
  networks: {
    137: {
      openSeaUrl: configJson.polygonOpenSeaUrl,
    },
    80001: {
      openSeaUrl: configJson.mumbaiOpenSeaUrl,
    },
  },
};

export default config;
