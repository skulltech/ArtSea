// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "hardhat/console.sol";

contract ArtSeaMarket {
    using Counters for Counters.Counter;
    struct Auction {
        address payable ownerAddress;
        address tokenAddress;
        uint tokenId;
        uint minBidAmount;
        uint highestBidAmount;
        address payable highestBidder;
        bool sold;
    }

    // auctionsIds: Total number of auctions created, also the auctionId of the next auction to be created.
    Counters.Counter public auctionIds;
    Auction[] public auctions;
    mapping(uint => bool) public auctionIsLive;

    event AuctionCreated(
        uint auctionId,
        address tokenAddress,
        uint tokenId,
        uint minBidAmount
    );

    event BidPlaced(uint auctionId, address payable bidder, uint bidAmount);

    function liveAuctionIds() public view returns (uint[] memory) {
        uint liveIdsCount = 0;
        uint[] memory liveIdsTemp = new uint[](auctionIds.current());
        for (uint i = 0; i < auctionIds.current(); i++) {
            if (auctionIsLive[i]) {
                liveIdsTemp[liveIdsCount] = i;
                liveIdsCount++;
            }
        }

        uint[] memory liveIds = new uint[](liveIdsCount);
        for (uint i = 0; i < liveIdsCount; i++) {
            if (auctionIsLive[i]) {
                liveIds[i] = liveIdsTemp[i];
            }
        }

        return liveIds;
    }

    function createAuction(
        address tokenAddress,
        uint tokenId,
        uint minBidAmount
    ) public {
        IERC721 token = IERC721(tokenAddress);
        address tokenOwner = token.ownerOf(tokenId);

        require(tokenOwner == msg.sender, "You do not own the NFT");

        Auction memory newAuction = Auction({
            ownerAddress: payable(msg.sender),
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            minBidAmount: minBidAmount,
            highestBidAmount: 0,
            highestBidder: payable(0),
            sold: false
        });
        uint newAuctionId = auctionIds.current();
        auctionIsLive[newAuctionId] = true;
        auctions.push(newAuction);
        auctionIds.increment();

        emit AuctionCreated(newAuctionId, tokenAddress, tokenId, minBidAmount);
    }

    function placeBid(uint auctionId) public payable {
        Auction memory auction = auctions[auctionId];

        require(msg.value > auction.highestBidAmount, "Your bid is too low");

        auction.highestBidder.transfer(auction.highestBidAmount);
        auctions[auctionId].highestBidAmount = msg.value;
        auctions[auctionId].highestBidder = payable(msg.sender);

        emit BidPlaced(auctionId, payable(msg.sender), msg.value);
    }

    function finalizeAuction(uint auctionId, bool accept) public {
        Auction memory auction = auctions[auctionId];

        require(auction.ownerAddress == msg.sender, "You are not the seller");

        if (accept) {
            IERC721 token = IERC721(auction.tokenAddress);
            token.safeTransferFrom(
                auction.ownerAddress,
                auction.highestBidder,
                auction.tokenId
            );
            auction.ownerAddress.transfer(auction.highestBidAmount);
            auctions[auctionId].sold = true;
        } else {
            auction.highestBidder.transfer(auction.highestBidAmount);
            auctions[auctionId].sold = false;
        }
        auctionIsLive[auctionId] = false;
    }
}
