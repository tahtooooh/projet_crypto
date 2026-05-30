const { Router } = require("express");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { adminSigner, provider, getContract } = require("../config");
const {
  addProducteur,
  addTransporteur,
  addClient,
} = require("../services/blockchain");

const router = Router();

router.post("/deploy", async (_req, res) => {
  try {
    const artifactPath = path.join(__dirname, "..", "..", "artifacts", "contract.json");
    const raw = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const factory = new ethers.ContractFactory(raw.abi, raw.bytecode, adminSigner);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    raw.address = address;
    fs.writeFileSync(artifactPath, JSON.stringify(raw, null, 2));

    res.json({ success: true, address, txHash: contract.deploymentTransaction().hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/role", async (req, res) => {
  try {
    const { address, role } = req.body;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Adresse invalide" });
    }

    let txHash;
    switch (role) {
      case "Producteur":
        txHash = await addProducteur(address);
        break;
      case "Transporteur":
        txHash = await addTransporteur(address);
        break;
      case "Client":
        txHash = await addClient(address);
        break;
      default:
        return res.status(400).json({ error: "Rôle invalide. Utilisez: Producteur, Transporteur, Client" });
    }

    res.json({ success: true, address, role, txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
