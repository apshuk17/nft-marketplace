require("@nomiclabs/hardhat-waffle");
const fs = require('fs');

const privateKey = fs.readFileSync('.secret').toString();
// const devNetId = process.env.NEXT_PUBLIC_DEVNET_ID;

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url : `https://polygon-mumbai.infura.io/v3/f145e05c6ca946cd9357b511d4f61647`,
      accounts: [privateKey]
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/f145e05c6ca946cd9357b511d4f61647`,
      accounts: [privateKey]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
