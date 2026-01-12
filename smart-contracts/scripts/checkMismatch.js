const hre = require("hardhat");
const contractAddresses = require("../../src/constants/contract-address.json");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    
    const ROUTER_ADDRESS = contractAddresses.Router;
    const WETH_ADDRESS = contractAddresses.WETH;

    console.log("🕵️‍♂️ CHECKING ADDRESS BINDINGS...");
    console.log(`--------------------------------------------------`);
    console.log(`1. Your WETH (Liquidity is here):  ${WETH_ADDRESS}`);
    console.log(`2. Your Router (Front-end uses):   ${ROUTER_ADDRESS}`);

    const router = await hre.ethers.getContractAt("UniswapV2Router02", ROUTER_ADDRESS);
    const routerWeth = await router.WETH();

    console.log(`3. Router believes WETH is:        ${routerWeth}`);
    console.log(`--------------------------------------------------`);

    if (routerWeth.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
        console.log("✅ PERFECT MATCH. The problem is NOT addresses.");
        console.log("👉 Check if you approved the CORRECT Router address.");
    } else {
        console.log("❌ CRITICAL MISMATCH DETECTED!");
        console.log("   Router points to WRONG WETH contract.");
        console.log("   Reason: You deployed Router BEFORE getting the new WETH address.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});