import hre, { artifacts } from "hardhat";

async function main() {
    const ethers = (hre as any).ethers;
    const [deployer] = await ethers.getSigners();
    console.log(" Deploying contracts with the account:", deployer.address);

    const maxApproval = ethers.MaxUint256;

    // --- 1. Deploy tokens ---
    console.log("\n--- 1. Deploying Tokens ---");

    // MriyaFi
    const MriyaFiToken = await ethers.getContractFactory("MriyaFiToken");
    const mriyaFi = await MriyaFiToken.deploy();
    await mriyaFi.waitForDeployment();
    const mriyaFiAddress = await mriyaFi.getAddress();
    console.log(" MriyaFi Token deployed to:", mriyaFiAddress);

    // Mock WETH
    const MockWETH = await ethers.getContractFactory("MockWETH");
    const weth = await MockWETH.deploy();
    await weth.waitForDeployment();
    const wethAddress = await weth.getAddress();
    console.log(" WETH Token deployed to:", wethAddress);

    // Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log(" USDC Token deployed to:", usdcAddress);

    // Mock USDT
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();
    const usdtAddress = await usdt.getAddress();
    console.log(" USDT Token deployed to:", usdtAddress);

    // Mock WBTC
    const MockWBTC = await ethers.getContractFactory("MockWBTC");
    const wbtc = await MockWBTC.deploy();
    await wbtc.waitForDeployment();
    const wbtcAddress = await wbtc.getAddress();
    console.log(" WBTC Token deployed to:", wbtcAddress);

    // --- 2. Deploy Core ---
    console.log("\n--- 2. Deploying Core (Factory) ---")

    const Factory = await ethers.getContractFactory("UniswapV2Factory");
    const factory = await Factory.deploy(deployer.address);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log(" Factory deployed to:", factoryAddress);

    // --- 3. Deploy Periphery ---
    console.log("\n--- 3. Deploying Periphery (Router) ---")

    const Router = await ethers.getContractFactory("UniswapV2Router02");
    const router = await Router.deploy(factoryAddress, wethAddress);
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log(" Router deployed to:", routerAddress);
    
    console.log("\n Deployment & Initialization Complete!");

    console.log("Deploying Multicall...");
    const Multicall = await ethers.getContractFactory("Multicall");
    const multicall = await Multicall.deploy();
    await multicall.waitForDeployment();
    const multicallAddress = await multicall.getAddress();
    console.log("Multicall deployed to:", multicallAddress);

    console.log("Saving files to frontend...");

    await saveFrontendFiles({
        Factory: factoryAddress,
        Router: routerAddress,
        Multicall: multicallAddress,
        MriyaFi: mriyaFiAddress,
        WETH: wethAddress,
        USDC: usdcAddress,
        USDT: usdtAddress,
        WBTC: wbtcAddress
    });
}

async function saveFrontendFiles(addresses: any) {
    const fs = require("fs");
    const path = require("path");

    const contractsDir = path.join(__dirname, "..", "..", "src", "constants");

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(contractsDir, "contract-address.json"),
        JSON.stringify(addresses, undefined, 2)
    );

    const contractsInfo = {
        Factory: (await artifacts.readArtifactSync("UniswapV2Factory")).abi,
        Router: (await artifacts.readArtifactSync("UniswapV2Router02")).abi,
        Multicall: (await artifacts.readArtifactSync("Multicall")).abi,
        ERC20: (await artifacts.readArtifactSync("MriyaFiToken")).abi,
        Pair: (await artifacts.readArtifactSync("UniswapV2Pair")).abi
    };

    fs.writeFileSync(
        path.join(contractsDir, "contract-abi.json"),
        JSON.stringify(contractsInfo, undefined, 2)
    );

    console.log(`Config files saved to: ${contractsDir}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });