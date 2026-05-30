require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const accounts = process.env.ADMIN_KEY && process.env.ADMIN_KEY !== "0x..."
  ? [process.env.ADMIN_KEY]
  : [];

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      viaIR: true,
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    sepolia: {
      url: process.env.RPC_URL || "",
      accounts,
    },
  },
};
