import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";
import { nftAddress, nftMarketAddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

const Dashboard = () => {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);

  const loadItemsCreated = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();

    const marketplaceContract = new ethers.Contract(
      nftMarketAddress,
      NFTMarket.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, signer);
    const data = await marketplaceContract.fetchAllItems();

    const items = await Promise.all(
      data.filter(i => i.seller === signerAddress).map(async (i) => {
        const tokenURI = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenURI);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          imageAlt: meta.data.name,
          tokenURI,
          sold: i.sold
        };
        return item;
      })
    );
    console.log('##items', items);
    const soldItems = items.filter((item) => item.sold === true);
    console.log('##soldItems', soldItems);
    setNfts(items);
    setSold(soldItems);
  };

  useEffect(() => {
    loadItemsCreated();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <Image
                src={nft.image}
                alt={nft.name}
                layout="fixed"
                className="rounded"
                width="350"
                height="350"
              />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} Eth
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4">
        {!!sold.length && (
          <>
            <h2 className="text-2xl py-2">Items Sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {sold.map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  <Image
                    src={nft.image}
                    alt={nft.name}
                    layout="fixed"
                    className="rounded"
                    width="350"
                    height="350"
                  />
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">
                      Price - {nft.price} Eth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
