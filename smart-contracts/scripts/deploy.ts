import { ethers, artifacts } from "hardhat";
import path from "path";
import fs from "fs";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("==========================================");
    console.log("🚀 Deploying contracts with account:", deployer.address);
    console.log("==========================================\n");

   // --- 1. Deploy Tokens ---
    console.log("--- 1. Deploying Tokens ---");

    const deployToken = async (name: string, symbol: string) => {
        const TokenFactory = await ethers.getContractFactory(name);
        const token = await TokenFactory.deploy();
        await token.waitForDeployment();
        const address = await token.getAddress();
        console.log(` ✅ ${symbol} deployed to: ${address}`);
        return { contract: token, address };
    };

    const mriyaFi = await deployToken("MriyaFiToken", "MFI");

    console.log("--- Deploying Canonical WETH9 ---");
    const WETHFactory = await ethers.getContractFactory("WETH9");
    const wethContract = await WETHFactory.deploy();
    await wethContract.waitForDeployment();
    const wethAddress = await wethContract.getAddress();
    const weth = { contract: wethContract, address: wethAddress };
    console.log(` ✅ WETH (Canonical) deployed to: ${weth.address}`);
    
    const usdc = await deployToken("MockUSDC", "USDC");
    const usdt = await deployToken("MockUSDT", "USDT");
    const wbtc = await deployToken("MockWBTC", "WBTC");

    // --- 1.1 Mint Initial Supply to Deployer ---
    console.log("\n--- 1.1 Minting Initial Supply to Deployer ---");
    const mintAmount = ethers.parseUnits("1000000", 18);
    const mintAmount6 = ethers.parseUnits("1000000", 6);

    try {
        await mriyaFi.contract.mint(deployer.address, mintAmount);
        console.log(" 💰 Minted 1,000,000 MFI to deployer");
        
        await usdc.contract.mint(deployer.address, mintAmount6);
        console.log(" 💰 Minted 1,000,000 USDC to deployer");

        await usdt.contract.mint(deployer.address, mintAmount6);
        console.log(" 💰 Minted 1,000,000 USDT to deployer");

        await wbtc.contract.mint(deployer.address, ethers.parseUnits("100", 8));
        console.log(" 💰 Minted 100 WBTC to deployer");
        
    } catch (e) {
        console.log(" ⚠️ Minting skipped (functions might not exist on Mock contracts)");
    }

    // --- 2. Deploy Core ---
    console.log("\n--- 2. Deploying Core (Factory) ---");

    const Factory = await ethers.getContractFactory("UniswapV2Factory");
    const factory = await Factory.deploy(deployer.address);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log(" 🏭 Factory deployed to:", factoryAddress);

    // --- 3. Deploy Periphery ---
    console.log("\n--- 3. Deploying Periphery (Router) ---");

    const Router = await ethers.getContractFactory("UniswapV2Router02");
    const router = await Router.deploy(factoryAddress, weth.address);
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log(" 🔀 Router deployed to:", routerAddress);
    
    console.log("\n Deployment & Initialization Complete!");

    console.log("\n--- 4. Deploying Multicall ---");
    const Multicall = await ethers.getContractFactory("Multicall");
    const multicall = await Multicall.deploy();
    await multicall.waitForDeployment();
    const multicallAddress = await multicall.getAddress();
    console.log(" 📞 Multicall deployed to:", multicallAddress);

    console.log("Saving files to frontend...");

    await saveFrontendFiles({
        Factory: factoryAddress,
        Router: routerAddress,
        Multicall: multicallAddress,
        MriyaFi: mriyaFi.address,
        WETH: weth.address,
        USDC: usdc.address,
        USDT: usdt.address,
        WBTC: wbtc.address
    });

    console.log("\n✨ Deployment Complete! You are ready to run addLiquidity.js ✨");
}

async function saveFrontendFiles(addresses: any) {
    const contractsDir = path.join(__dirname, "..", "..", "src", "constants");

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(contractsDir, "contract-address.json"),
        JSON.stringify(addresses, undefined, 2)
    );

    let pairAbi;
    try {
        pairAbi = (await artifacts.readArtifact("UniswapV2Pair")).abi;
    } catch (e) {
        console.warn("⚠️ Warning: UniswapV2Pair artifact not found directly. Checking alternate...");
    }

    const contractsInfo = {
        Factory: (await artifacts.readArtifact("UniswapV2Factory")).abi,
        Router: (await artifacts.readArtifact("UniswapV2Router02")).abi,
        Multicall: (await artifacts.readArtifact("Multicall")).abi,
        ERC20: (await artifacts.readArtifact("MriyaFiToken")).abi,
        Pair: pairAbi || [] 
    };

    fs.writeFileSync(
        path.join(contractsDir, "contract-abi.json"),
        JSON.stringify(contractsInfo, undefined, 2)
    );

    console.log(` 💾 Config files saved to: ${contractsDir}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });