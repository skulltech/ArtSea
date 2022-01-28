const { ethers } = require("hardhat");

const main = async () => {
  const [martket, owner, bidder1, bidder2, bidder3] = await ethers.getSigners();
  const marketContractFactory = ethers.getContractFactory("NFTMarket");
  const marketContract = await marketContractFactory.deploy();
  await marketContract.deployed();
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
