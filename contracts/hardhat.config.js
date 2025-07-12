require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
console.log(process.env.PRIVATE_KEY)
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true,
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    opbnb: {
      // url: "https://opbnb-testnet-rpc.bnbchain.org", //RPC URL of the opBNB testnet
      url: "https://opbnb-testnet.infura.io/v3/62d3bcd36c544b23ba15ae903c21a318",
      accounts: [process.env.PRIVATE_KEY], //Your account private key, which is used to deploy the contract
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "opbnb",
        chainId: 5611,
        urls: {
          apiURL: "https://api-opbnb-testnet.bscscan.com/api",
          browserURL: "https://opbnb-testnet.bscscan.com", // opBNB Testnet Explorer URL
        },
      },
    ],
  },
};