const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const TraceChain = await hre.ethers.getContractFactory("TraceChain");
  const contract = await TraceChain.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("TraceChain déployé à:", address);

  const artifact = await hre.artifacts.readArtifact("TraceChain");
  const out = {
    address,
    abi: artifact.abi,
    bytecode: artifact.bytecode,
  };

  const outPath = path.join(__dirname, "..", "backend", "artifacts", "contract.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log("ABI + adresse sauvegardés dans backend/artifacts/contract.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
