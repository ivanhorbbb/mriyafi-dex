const hre = require("hardhat");

async function main() {
    const ROUTER_ADDRESS = "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F";
    const MFI_ADDRESS = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d";
    const USDC_ADDRESS = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";

    const [deployer] = await hre.ethers.getSigners();
    console.log("Adding liquidity with account:", deployer.address);

    const Router = await hre.ethers.getContractAt("UniswapV2Router02", ROUTER_ADDRESS);
    const MFI = await hre.ethers.getContractAt("ERC20", MFI_ADDRESS);
    const USDC = await hre.ethers.getContractAt("ERC20", USDC_ADDRESS);

    const amountMFI = hre.ethers.parseUnits("500000", 18);
    const amountUSDC = hre.ethers.parseUnits("10000", 6);

    console.log("Approving tokens...");
    await (await MFI.approve(ROUTER_ADDRESS, amountMFI)).wait();
    await (await USDC.approve(ROUTER_ADDRESS, amountUSDC)).wait();

    console.log("Adding liquidity...");
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    await Router.addLiquidity(
        MFI_ADDRESS,
        USDC_ADDRESS,
        amountMFI,
        amountUSDC,
        0,
        0,
        deployer.address,
        deadline
    );

    console.log(" Liquidity Added! Pool created. 500k MFI / 10k USDC");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});