const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const main = async () => {
  const [owner, user1, user2, user3] = await ethers.getSigners();

  // Deploying the contracts
  const nftContractFactory = await ethers.getContractFactory("ArtSeaTokens");
  const nftContract = await nftContractFactory.deploy();
  await nftContract.deployed();
  console.log("NFT contract deployed to:", nftContract.address);
  const marketContractFactory = await ethers.getContractFactory("ArtSeaMarket");
  const marketContract = await marketContractFactory.deploy();
  await marketContract.deployed();
  console.log("Market contract deployed to:", marketContract.address);

  // User 1 mints an NFT
  let txn = await nftContract
    .connect(user1)
    .safeMint(user1.address, "https://test-metadata.com");
  console.log("Transaction hash for minting the NFT:", txn.hash);
  let receipt = await txn.wait();
  // console.log("Transaction receipt:", receipt);
  let transferEvent = receipt.events.filter((x) => {
    return x.event === "Transfer";
  })[0];
  let tokenId = transferEvent.args[2].toString();

  // User 1 puts the NFT up for auction
  txn = await marketContract
    .connect(user1)
    .createAuction(nftContract.address, tokenId, 10);
  console.log("Transaction hash for creating auction:", txn.hash);
  receipt = await txn.wait();
  // console.log("Transaction receipt:", receipt);
  let auctionCreatedEvent = receipt.events.filter((x) => {
    return x.event === "AuctionCreated";
  })[0];
  let auctionId = auctionCreatedEvent.args[0].toString();
  console.log("Transaction done, auction ID:", auctionId);

  // User 1 mints another NFT
  txn = await nftContract
    .connect(user1)
    .safeMint(user1.address, "https://test-metadata.com");
  console.log("Transaction hash for minting the NFT:", txn.hash);
  receipt = await txn.wait();
  // console.log("Transaction receipt:", receipt);
  transferEvent = receipt.events.filter((x) => {
    return x.event === "Transfer";
  })[0];
  tokenId = transferEvent.args[2].toString();

  // User 1 puts the second NFT up for auction
  txn = await marketContract
    .connect(user1)
    .createAuction(nftContract.address, tokenId, 10);
  console.log("Transaction hash for creating auction:", txn.hash);
  receipt = await txn.wait();
  // console.log("Transaction receipt:", receipt);
  auctionCreatedEvent = receipt.events.filter((x) => {
    return x.event === "AuctionCreated";
  })[0];
  auctionId = auctionCreatedEvent.args[0].toString();
  console.log("Transaction done, auction ID:", auctionId);

  // Check the auctions
  let auctionIds = await marketContract.connect(user3).auctionIds();
  console.log("Total auctions created:", auctionIds);
  let auctions = await Promise.all(
    [...Array(auctionIds.toNumber()).keys()].map(
      async (index) => await marketContract.connect(user3).auctions(index)
    )
  );
  console.log(auctions);

  // User 2 places a bid on that auction
  txn = await marketContract
    .connect(user2)
    .placeBid(0, { value: parseEther("21") });
  await txn;

  // Check the auctions
  auctionIds = await marketContract.connect(user3).auctionIds();
  auctions = await Promise.all(
    [...Array(auctionIds.toNumber()).keys()].map(
      async (index) => await marketContract.connect(user3).auctions(index)
    )
  );
  console.log(auctions);

  let bidPlacedEvents = await marketContract.queryFilter(
    marketContract.filters.BidPlaced()
  );
  console.log("BidPlaced events:", bidPlacedEvents);
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
