const { ethers } = require("hardhat");
const { copyFile, readFile, writeFile } = require("fs/promises");

const main = async () => {
  const marketContractFactory = await ethers.getContractFactory("ArtSeaMarket");
  const marketContract = await marketContractFactory.deploy();
  await marketContract.deployed();
  console.log("Market contract deployed to:", marketContract.address);
  await copyFile(
    "./artifacts/contracts/ArtSeaMarket.sol/ArtSeaMarket.json",
    "./src/data/ArtSeaMarket.json"
  );
  console.log("Copied ABI file to the data directory.");

  const configFile = await readFile("./src/data/config.json");
  const configContent = JSON.parse(configFile);
  configContent.marketContractAddress = marketContract.address;
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
