import Link from "next/link";
import useWeb3Provider from "../hooks/useWeb3Provider";

const Header = () => {
  const { connect, isConnected } = useWeb3Provider();
//   console.log("##data", data);
  return (
    <nav className="border-b p-6">
      <p className="text-4xl font-bold">Metaverse Marketplace</p>
      <div className="flex mt-4">
        <Link href="/">
          <a className="mr-4 text-pink-500">Home</a>
        </Link>
        <Link href="/create-item">
          <a className="mr-6 text-pink-500">Sell NFT</a>
        </Link>
        <Link href="/my-nfts">
          <a className="mr-6 text-pink-500">My NFTs</a>
        </Link>
        <Link href="/dashboard">
          <a className="mr-6 text-pink-500">Dashboard</a>
        </Link>
        {!isConnected ? (
          <button onClick={connect}>Connect to Metamask</button>
        ) : (
          <button disabled>Connected to Metamask</button>
        )}
      </div>
    </nav>
  );
};

export default Header;
