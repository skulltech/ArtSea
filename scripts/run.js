const { ethers } = require("hardhat");

const main = async () => {
  const [owner, user] = await ethers.getSigners();

  const nftContractFactory = await ethers.getContractFactory("ArtSeaTokens");
  const nftContract = await nftContractFactory.deploy();
  await nftContract.deployed();
  console.log("NFT contract deployed to:", nftContract.address);

  const marketContractFactory = await ethers.getContractFactory("ArtSeaMarket");
  const marketContract = await marketContractFactory.deploy();
  await marketContract.deployed();
  console.log("Market contract deployed to:", marketContract.address);

  let txn = await nftContract
    .connect(user)
    .safeMint(user.address, "https://test-metadata.com");
  console.log("Transaction hash for minting the NFT:", txn.hash);
  let receipt = await txn.wait();
  console.log("Transaction receipt:", receipt);
  const transferEvent = receipt.events.filter((x) => {
    return x.event === "Transfer";
  })[0];
  let tokenId = transferEvent.args[2].toString();

  txn = await marketContract
    .connect(user)
    .submitAuction(nftContract.address, tokenId, 10);
  console.log("Transaction hash for creating auction:", txn.hash);
  receipt = await txn.wait();
  console.log("Transaction receipt:", receipt);
  const auctionCreatedEvent = receipt.events.filter((x) => {
    return x.event === "AuctionCreated";
  })[0];
  const auctionId = auctionCreatedEvent.args[0].toString();
  console.log("Transaction done, auction ID:", auctionId);

  let auctionIds = await marketContract.connect(user).auctionIds();
  console.log(auctionIds);
  let auction = await marketContract.connect(user).auctions(0);
  console.log(auction);
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
