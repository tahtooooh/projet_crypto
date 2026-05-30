require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC_URL = process.env.RPC_URL;
if (!RPC_URL) throw new Error("RPC_URL manquant dans .env");

const provider = new ethers.JsonRpcProvider(RPC_URL);

const adminSigner = new ethers.Wallet(process.env.ADMIN_KEY, provider);
const producteurSigner = new ethers.Wallet(process.env.PRODUCEUR_KEY, provider);
const transporteurSigner = new ethers.Wallet(process.env.TRANSPORTEUR_KEY, provider);
const clientSigner = new ethers.Wallet(process.env.CLIENT_KEY, provider);

function getContract(signer) {
  const artifactPath = path.join(__dirname, "..", "artifacts", "contract.json");
  const { address, abi } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  return new ethers.Contract(address, abi, signer);
}

module.exports = {
  provider,
  adminSigner,
  producteurSigner,
  transporteurSigner,
  clientSigner,
  getContract,
};
