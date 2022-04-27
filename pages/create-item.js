import { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import { nftAddress, nftMarketAddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const CreateItem = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  const onChange = async (event) => {
    const file = event.target.files[0];
    try {
      const added = await client.add(file, {
        progress(prog) {
          console.log(`received: ${prog}`);
        },
      });
      console.log("##added", added);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.error(error);
    }
  };

  const createItem = async (event) => {
    event.preventDefault();
    const { price, name, description } = formInput;
    if (!price || !name || !description || !fileUrl) return;
    const data = JSON.stringify({ name, description, image: fileUrl });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      createSale(url);
    } catch (error) {
      console.error(error);
    }
  };

  const createSale = async (url) => {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal({
        cacheProvider: false,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    console.log('##signer', signer);

    let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();

    let event = tx.events[0];
    let value = event.args.tokenId;
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    contract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftAddress, tokenId, price, {
      value: listingPrice,
    });

    await transaction.wait();
    router.push("/");
  };

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <div className="flex flex-col mt-8">
          <label htmlFor="assetname">Asset Name</label>
          <input
            className="mt-2 border rounded p-4"
            id="assetname"
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col mt-2">
          <label htmlFor="assetdescription">Asset Description</label>
          <textarea
            id="assetdescription"
            className="mt-2 border rounded p-4"
            onChange={(e) =>
              updateFormInput({ ...formInput, description: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col mt-2">
          <label htmlFor="assetprice">Asset Price in Matic</label>
          <input
            id="assetprice"
            className="mt-2 border rounded p-4"
            onChange={(e) =>
              updateFormInput({ ...formInput, price: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col mt-2">
          <label htmlFor="uploadasset">Upload Asset</label>
          <input
            id="uploadasset"
            type="file"
            name="Asset"
            className="my-4"
            onChange={onChange}
          />
        </div>
        {fileUrl && (
          <Image
            className="rounded mt-4"
            layout="responsive"
            width="350"
            height="350"
            alt={fileUrl}
            src={fileUrl}
          />
        )}
        <button
          onClick={createItem}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          Create NFT
        </button>
      </div>
    </div>
  );
};

export default CreateItem;
