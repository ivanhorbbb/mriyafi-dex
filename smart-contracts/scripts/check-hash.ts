import { artifacts, ethers } from "hardhat";

async function main() {
  const pairArtifact = await artifacts.readArtifact("UniswapV2Pair");
  
  const computedHash = ethers.keccak256(pairArtifact.bytecode);
  
  console.log("===================================================");
  console.log("🔥 NEW INIT CODE HASH FOR HARDHAT 🔥");
  console.log(computedHash);
  console.log("===================================================");
  console.log("Go to contracts/libraries/UniswapV2Library.sol and paste this hash!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});