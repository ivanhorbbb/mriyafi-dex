const hre = require("hardhat");

async function main() {
    const ROUTER_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
    
    const TOKENS = [
        { symbol: "MFI",  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", decimals: 18, price: 0.02 },
        { symbol: "USDC", address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", decimals: 6,  price: 1.0 },
        { symbol: "WETH", address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", decimals: 18, price: 2000.0 },
        { symbol: "WBTC", address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9", decimals: 8,  price: 30000.0 },
        { symbol: "USDT", address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", decimals: 6,  price: 1.0 }
    ];

    const LIQUIDITY_SIDE_USD = 100000;

    const [deployer] = await hre.ethers.getSigners();
    console.log("\n===================================================");
    console.log("🌊 STARTING LIQUIDITY INJECTION");
    console.log("   Operator:", deployer.address);
    console.log("===================================================\n");

    const Router = await hre.ethers.getContractAt("UniswapV2Router02", ROUTER_ADDRESS);

    const addPool = async (tokenA, tokenB) => {
        if (tokenA.address === tokenB.address) return;

        const TokenAContract = await hre.ethers.getContractAt("ERC20", tokenA.address);
        const TokenBContract = await hre.ethers.getContractAt("ERC20", tokenB.address);

        const amountA_Num = LIQUIDITY_SIDE_USD / tokenA.price;
        const amountB_Num = LIQUIDITY_SIDE_USD / tokenB.price;

        const formatNum = (num) => num.toLocaleString('en-US', { maximumFractionDigits: 2 });

        console.log(`🔹 Processing Pair: ${tokenA.symbol} / ${tokenB.symbol}`);
        console.log(`   📊 Plan: Add $${LIQUIDITY_SIDE_USD} worth of each side`);
        console.log(`      -> ${formatNum(amountA_Num)} ${tokenA.symbol}`);
        console.log(`      -> ${formatNum(amountB_Num)} ${tokenB.symbol}`);

        const amountA = hre.ethers.parseUnits(amountA_Num.toFixed(tokenA.decimals === 18 ? 6 : 2), tokenA.decimals);
        const amountB = hre.ethers.parseUnits(amountB_Num.toFixed(tokenB.decimals === 18 ? 6 : 2), tokenB.decimals);

        try {
            console.log(`      ...Approving ${tokenA.symbol}`);
            const tx1 = await TokenAContract.approve(ROUTER_ADDRESS, amountA);
            await tx1.wait();
            
            console.log(`      ...Approving ${tokenB.symbol}`);
            const tx2 = await TokenBContract.approve(ROUTER_ADDRESS, amountB);
            await tx2.wait();

            const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
            
            const tx3 = await Router.addLiquidity(
                tokenA.address,
                tokenB.address,
                amountA,
                amountB,
                0, 0,
                deployer.address,
                deadline
            );
            await tx3.wait();

            console.log(`   ✅ POOL CREATED SUCCESSFULLY!`);
            console.log("---------------------------------------------------");
        } catch (e) {
            console.log(`   ❌ ERROR: ${e.message}`);
            console.log("---------------------------------------------------");
        }
    };

    let count = 0;
    for (let i = 0; i < TOKENS.length; i++) {
        for (let j = i + 1; j < TOKENS.length; j++) {
            await addPool(TOKENS[i], TOKENS[j]);
            count++;
        }
    }

    console.log(`\n🎉 DONE! Total Pools Processed: ${count}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});