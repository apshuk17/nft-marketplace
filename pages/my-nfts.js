import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import axios from "axios";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import { nftAddress, nftMarketAddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

const MyNFTS = () => {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const router = useRouter();

  const loadMyNFTs = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketplaceContract = new ethers.Contract(
      nftMarketAddress,
      NFTMarket.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, signer);
    const data = await marketplaceContract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (i) => {
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
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  };

  useEffect(() => {
    loadMyNFTs();
  }, []);

  const listNFT = nft => {
    console.log('nft:', nft);
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
  }

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>;

  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <Image src={nft.image} alt={nft.name} layout="fixed" className="rounded" width="350" height="350" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} Eth
                </p>
                <button
                  className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                  onClick={() => listNFT(nft)}
                >
                  List
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyNFTS;
