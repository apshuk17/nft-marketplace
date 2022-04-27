import "../styles/globals.css";
import Link from "next/link";
import Web3Provider from "../components/providers/web3";
import Header from "../components/Header";

function MyApp({ Component, pageProps }) {
  return (
    <Web3Provider>
      <div>
        <Header />
        <Component {...pageProps} />
      </div>
    </Web3Provider>
  );
}

export default MyApp;
