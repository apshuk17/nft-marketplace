import { useState, createContext, useMemo, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

export const Web3Context = createContext(null);

const Web3Provider = ({ children }) => {
  const [web3Provider, setWeb3Provider] = useState(null);
  const [jsonRPCProvider, setJSONRPCProvider] = useState(null);
  const [web3Connected, setWeb3Connected] = useState(false);
  const [signer, setSigner] = useState(null);

  const connect = async () => {
    const web3Modal = new Web3Modal();
    try {
      const connection = await web3Modal.connect();
      setWeb3Connected(true);
      const provider = new ethers.providers.Web3Provider(connection);
      setWeb3Provider(provider);
      const signer = provider.getSigner();
      setSigner(signer);
    } catch (error) {
      console.log("##error", error);
    }
  };

  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider()
    setJSONRPCProvider(provider);
    const signer = provider.getSigner();
    console.log('##signer', signer);
  }, []);

  const response = useMemo(
    () => ({
      web3Provider,
      jsonRPCProvider,
      isConnected: web3Connected,
      signer,
      connect,
    }),
    [web3Provider, web3Connected, signer, jsonRPCProvider]
  );

  return (
    <Web3Context.Provider value={response}>{children}</Web3Context.Provider>
  );
};

export default Web3Provider;
