require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    ephemery: {
      url: process.env.VITE_RPC_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    }
  }
};