const hre = require("hardhat");
const contractAddresses = require("../../src/constants/contract-address.json");

async function main() {
    const ROUTER_ADDRESS = contractAddresses.Router;
    
    const network = await hre.ethers.provider.getNetwork();
    console.log(`Network: ${network.name} (chainId: ${network.chainId})`);
    
    const TOKENS = [
        { symbol: "MFI",  address: contractAddresses.MriyaFi, decimals: 18, price: 0.02 },
        { symbol: "USDC", address: contractAddresses.USDC, decimals: 6,  price: 1.0 },
        { symbol: "WETH", address: contractAddresses.WETH, decimals: 18, price: 2000.0 },
        { symbol: "WBTC", address: contractAddresses.WBTC, decimals: 8,  price: 30000.0 },
        { symbol: "USDT", address: contractAddresses.USDT, decimals: 6,  price: 1.0 }
    ];

    const LIQUIDITY_SIDE_USD = 100000;

    const [deployer] = await hre.ethers.getSigners();
    console.log("\n===================================================");
    console.log("🌊 STARTING LIQUIDITY INJECTION");
    console.log("   Operator:", deployer.address);
    console.log("===================================================\n");

    const Router = await hre.ethers.getContractAt("UniswapV2Router02", ROUTER_ADDRESS);

    const ensureWETHBalance = async (tokenAddress, amountNeeded) => {
        const wethAbi = ["function deposit() payable", "function balanceOf(address) view returns (uint)"];
        const weth = new hre.ethers.Contract(tokenAddress, wethAbi, deployer);
        
        const balance = await weth.balanceOf(deployer.address);
        
        if (balance < amountNeeded) {
            const needed = amountNeeded - balance;
            console.log(`       🔄 Wrapping ETH to WETH: ${hre.ethers.formatEther(needed)} ETH`);
            const tx = await weth.deposit({ value: needed }); 
            await tx.wait();
        }
    };

    const addPool = async (tokenA, tokenB) => {
        if (tokenA.address === tokenB.address) return;

        console.log(`🔹 Processing Pair: ${tokenA.symbol} / ${tokenB.symbol}`);

        const TokenAContract = await hre.ethers.getContractAt("ERC20", tokenA.address);
        const TokenBContract = await hre.ethers.getContractAt("ERC20", tokenB.address);

        const amountA_Num = LIQUIDITY_SIDE_USD / tokenA.price;
        const amountB_Num = LIQUIDITY_SIDE_USD / tokenB.price;
        
        const amountA = hre.ethers.parseUnits(amountA_Num.toFixed(tokenA.decimals === 18 ? 6 : 2), tokenA.decimals);
        const amountB = hre.ethers.parseUnits(amountB_Num.toFixed(tokenB.decimals === 18 ? 6 : 2), tokenB.decimals);

        if (tokenA.symbol === "WETH") await ensureWETHBalance(tokenA.address, amountA);
        if (tokenB.symbol === "WETH") await ensureWETHBalance(tokenB.address, amountB);

        try {
            console.log(`       ...Approving ${tokenA.symbol}`);
            const tx1 = await TokenAContract.approve(ROUTER_ADDRESS, amountA);
            await tx1.wait();
            
            console.log(`       ...Approving ${tokenB.symbol}`);
            const tx2 = await TokenBContract.approve(ROUTER_ADDRESS, amountB);
            await tx2.wait();

            const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
            
            console.log(`       ...Adding Liquidity`);
            const tx3 = await Router.addLiquidity(
                tokenA.address,
                tokenB.address,
                amountA,
                amountB,
                0, 0,
                deployer.address,
                deadline,
                { gasLimit: 5000000 }
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