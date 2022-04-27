const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('NFT Market', () => {
    let Market, market, NFT, nft, marketAddress, nftContractAddress;

    beforeEach(async () => {
        Market = await ethers.getContractFactory('NFTMarket');
        market = await Market.deploy();
        await market.deployed();

        marketAddress = market.address;

        NFT = await ethers.getContractFactory('NFT');
        nft = await NFT.deploy(marketAddress);
        await nft.deployed();

        nftContractAddress = nft.address;

    });

    it('Should create and execute market sales', async () => {
        let listingPrice = await market.getListingPrice();
        listingPrice = listingPrice.toString();

        const auctionPrice = await ethers.utils.parseUnits('100', 'ether');

        await nft.createToken('https://www.mytokenlocation.com');
        await nft.createToken('https://www.mytokenlocation2.com');

        await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice });
        await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice });

        const [_, buyerAddress] = await ethers.getSigners();

        await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice });

        let marketItems = await market.fetchMarketItems();

        marketItems = await Promise.all(marketItems.map(async item => {
            const tokenURL = await nft.tokenURI(item.tokenId)
            return {
                price: item.price.toString(),
                tokenId: item.tokenId.toString(),
                seller: item.seller,
                owner: item.owner,
                tokenURI: tokenURL
            }
        }))

        console.log('##marketItems', marketItems);
    });
});