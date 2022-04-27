// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint listingPrice = 0.025 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        uint256 tokenId;
        address nftContract;
        address payable seller;
        address payable owner;
        uint price;
        bool sold;
    }

    mapping(uint => MarketItem) private idToMarketItem;

    event MarketItemCreated (
        uint indexed itemId,
        uint indexed tokenId,
        address indexed nftContract,
        address seller,
        address owner,
        uint price,
        bool sold
    );

    function getListingPrice() external view returns (uint) {
        return listingPrice;
    }

    function createMarketItem(address nftContract, uint tokenId, uint price) external payable nonReentrant {
        require(price > 0, "Price must be atleast 1 wei");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        _itemIds.increment();
        uint itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(itemId, tokenId, nftContract, payable(msg.sender), payable(address(0)), price, false);

        // transfer the ownership to the contract
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(itemId, tokenId, nftContract, msg.sender, address(0), price, false);
    }

    function createMarketSale(address nftContract, uint itemId) external payable nonReentrant {
        uint price = idToMarketItem[itemId].price;
        uint tokenId = idToMarketItem[itemId].tokenId;

        require(msg.value == price, "Please submit the asking price to complete the purchase");

        // transfer the price to seller
        idToMarketItem[itemId].seller.transfer(msg.value);

        // transfer the ownership from the contract to the buyer
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;

        // Increase the total items sold counter
        _itemsSold.increment();

        // pay to the contract owner
        owner.transfer(listingPrice);

    }

    function fetchMarketItems() external view returns (MarketItem[] memory) {
        uint itemsCount = _itemIds.current();
        uint itemsSoldCount = _itemsSold.current();
        uint unsoldItemsCount = itemsCount - itemsSoldCount;
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemsCount);

        for(uint i = 0; i < itemsCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchMyNFTs() external view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for(uint i = 0; i < totalItemCount; i++) {
            if(idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for(uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchItemsCreated() external view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for(uint i = 0; i < totalItemCount; i++) {
            if(idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for(uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchAllItems() external view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](totalItemCount);

        for(uint i = 0; i < totalItemCount; i++) {
            uint currentId = idToMarketItem[i + 1].itemId;
            MarketItem storage currentItem = idToMarketItem[currentId];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }

        return items;
    } 
}