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
        bool ended;
        bool sold;
    }

    Counters.Counter public auctionIds;
    Auction[] public auctions;

    event AuctionCreated(
        uint auctionId,
        address tokenAddress,
        uint tokenId,
        uint minBidAmount
    );

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
            ended: false,
            sold: false
        });
        uint newAuctionId = auctionIds.current();
        auctions.push(newAuction);

        emit AuctionCreated(newAuctionId, tokenAddress, tokenId, minBidAmount);
    }

    function placeBid(uint auctionId) public payable {
        Auction memory auction = auctions[auctionId];
        if (msg.value > auction.highestBidAmount) {
            auction.highestBidder.transfer(auction.highestBidAmount);
            auction.highestBidAmount = msg.value;
            auction.highestBidder = payable(msg.sender);
        }
    }

    function finalizeAuction(uint auctionId, bool accept) public {
        Auction memory auction = auctions[auctionId];

        if (accept) {
            IERC721 token = IERC721(auction.tokenAddress);
            token.safeTransferFrom(
                auction.ownerAddress,
                auction.highestBidder,
                auction.tokenId
            );
            auction.ownerAddress.transfer(auction.highestBidAmount);
            auction.sold = true;
        } else {
            auction.highestBidder.transfer(auction.highestBidAmount);
            auction.sold = false;
        }
        auction.ended = true;
    }
}
