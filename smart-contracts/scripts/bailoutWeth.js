const hre = require("hardhat");
const contractAddresses = require("../../src/constants/contract-address.json");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const wethAddress = contractAddresses.WETH;

    console.log("🛠️ DIAGNOSING WETH...");

    const weth = await hre.ethers.getContractAt("MockWETH", wethAddress);

    const ethBalance = await hre.ethers.provider.getBalance(wethAddress);
    console.log(`💰 WETH Contract ETH Balance: ${hre.ethers.formatEther(ethBalance)} ETH`);

    if (ethBalance == 0n) {
        console.log("⚠️ ALARM: Contract holds 0 ETH! Users cannot sell WETH.");
        console.log("🚑 Performing Bailout via deposit()...");

        try {
            const tx = await weth.deposit({ value: hre.ethers.parseEther("500.0") });
            await tx.wait();
            console.log("✅ 500 ETH Deposited successfully!");
        } catch (e) {
            console.log("❌ Error calling deposit():", e.message);
            console.log("   (Did you update MockTokens.sol and restart the node?)");
        }
    } else {
        console.log("✅ WETH is solvent (has ETH). Swaps should work.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});