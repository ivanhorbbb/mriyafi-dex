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

    try {
    // 1. Шукаємо файл скомпільованого контракту пари
    // УВАГА: Якщо твій контракт називається інакше (наприклад MriyaFiPair), зміни назву тут!
    const pairArtifact = await artifacts.readArtifact("UniswapV2Pair"); 

    // 2. Рахуємо хеш
    const pairHash = ethers.keccak256(pairArtifact.bytecode);

    console.log(`\n⚠️  COPY THIS HASH for your Library:`);
    console.log(pairHash);
    console.log(`====================================\n`);
} catch (e) {
    console.error("Не вдалося порахувати хеш автоматично. Перевір назву контракту пари (UniswapV2Pair).", e);
}

    // --- 3. Deploy Periphery ---
    console.log("\n--- 3. Deploying Periphery (Router) ---")

    const Router = await ethers.getContractFactory("UniswapV2Router02");
    const router = await Router.deploy(factoryAddress, wethAddress);
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log(" Router deployed to:", routerAddress);

    // --- 4. Adding Liquidity
    console.log("\n--- 4. Adding Initial Liquidity ---")

    await mriyaFi.approve(routerAddress, maxApproval);
    await usdc.approve(routerAddress, maxApproval);
    await usdt.approve(routerAddress, maxApproval);
    await wbtc.approve(routerAddress, maxApproval);
    await weth.approve(routerAddress, maxApproval);

    console.log(" Tokens approved");

    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const deadline = (block?.timestamp || 0) + 600;

    console.log(" MY WALLET ADDRESS:", deployer.address);

    console.log("Checking/Creating Pair manually...");
    const pairAddress = await factory.getPair(mriyaFiAddress, usdcAddress);
    if (pairAddress === "0x0000000000000000000000000000000000000000") {
        console.log("Pair doesn't exist. Creating now...");
        const tx = await factory.createPair(mriyaFiAddress, usdcAddress);
        await tx.wait();
        console.log("Pair created!");
    } else {
        console.log("Pair already exists at:", pairAddress);
    }
    
    // 1. MriyaFi / USDC
    console.log("💧 Adding liquidity: MFI <-> USDC...");
    await router.addLiquidity(
        mriyaFiAddress,
        usdcAddress,
        ethers.parseUnits("10000", 18),
        ethers.parseUnits("5000", 6),
        0, 0,
        deployer.address,
        deadline
    );

    // 2. MriyaFi / WETH
    console.log("💧 Adding liquidity: MFI <-> WETH...");
    await router.addLiquidity(
        mriyaFiAddress,
        wethAddress,
        ethers.parseUnits("5000", 18),
        ethers.parseUnits("10", 18),
        0, 0,
        deployer.address,
        deadline
    );

    // 3. ETH / USDT
    console.log("💧 Adding liquidity: ETH <-> USDT...");
    await router.addLiquidity(
        wethAddress,
        usdtAddress,
        ethers.parseUnits("1", 18),
        ethers.parseUnits("2000", 6),
        0, 0,
        deployer.address,
        deadline
    );
    
    console.log("\n Deployment & Initialization Complete!");

    console.table({
        MriyaFi: mriyaFiAddress,
        WETH: wethAddress,
        USDC: usdcAddress,
        USDT: usdtAddress,
        WBTC: wbtcAddress,
        Factory: factoryAddress,
        Router: routerAddress,
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});