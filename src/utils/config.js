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
      name: "Polygon",
    },
    80001: {
      openSeaUrl: configJson.mumbaiOpenSeaUrl,
      name: "Mumbai",
    },
  },
  nftStorage: {
    key: process.env.REACT_APP_NFT_STORAGE_KEY,
  },
  ipfs: {
    gateway: "https://ipfs.io",
  },
};

export default config;
