const { ethers } = require("hardhat");
const { copyFile, readFile, writeFile } = require("fs/promises");

const main = async () => {
  const nftContractFactory = await ethers.getContractFactory("ArtSeaTokens");
  const nftContract = await nftContractFactory.deploy();
  await nftContract.deployed();
  console.log("NFT contract deployed to:", nftContract.address);
  await copyFile(
    "./artifacts/contracts/ArtSeaTokens.sol/ArtSeaTokens.json",
    "./src/data/ArtSeaTokens.json"
  );
  console.log("Copied ABI file to the data directory.");

  const configFile = await readFile("./src/data/config.json");
  const configContent = JSON.parse(configFile);
  configContent.nftContractAddress = nftContract.address;
  await writeFile("./src/data/config.json", JSON.stringify(configContent));
  console.log("Modified config.json to have the new contract address.");
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

runMain();
