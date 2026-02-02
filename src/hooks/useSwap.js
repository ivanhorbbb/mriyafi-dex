import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import contractAddresses from '../constants/contract-address.json';

const ROUTER_ADDRESS = contractAddresses.Router;
const WETH_ADDRESS = contractAddresses.WETH;

const ROUTER_ABI = [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
    "function getAmountsIn(uint amountOut, address[] memory path) public view returns (uint[] memory amounts)",

    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

const WETH_ABI = [
    "function deposit() payable",
    "function withdraw(uint wad)",
    "function approve(address gui, uint wad) public returns (bool)"
];

export const useSwap = (provider, account) => {
    const [router, setRouter] = useState(null);

    useEffect(() => {
        if (provider) {
            const initRouter = async () => {
                try {
                    const signer = await provider.getSigner();
                    console.log("🔗 Router Address in Hook:", ROUTER_ADDRESS);
                    const routerContract = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
                    setRouter(routerContract);
                } catch (err) {
                    console.error("Failed to init router:", err);
                }
            };
            initRouter();
        }
    }, [provider]);

    const getCleanPath = useCallback((path) => {
        return path.map(item => {
            if (item.address) {
                return item.symbol === 'ETH' ? WETH_ADDRESS : item.address;
            }
            if (item === 'ETH') return WETH_ADDRESS;
            return item;
        });
    }, []);

    const getAmountsIn = useCallback(async (amountOut, path) => {
        if (!router) return '0';
        if (!amountOut || amountOut.toString() === '0') return '0';
        
        try {
            const cleanPath = getCleanPath(path);
            
            if (cleanPath[0].toLowerCase() === cleanPath[1].toLowerCase()) {
                return amountOut;
            }

            const amounts = await router.getAmountsIn(amountOut, cleanPath);
            
            return amounts[0];

        } catch (error) {
            console.error("GetAmountsIn Error (check liquidity or WETH address):", error);
            return '0';
        }
    }, [router, getCleanPath]);

    const getAmountsOut = useCallback(async (amountIn, path) => {
        if (!router) return '0';
        if (!amountIn || amountIn.toString() === '0') return '0';
        
        try {
            const cleanPath = getCleanPath(path);
            if (cleanPath[0].toLowerCase() === cleanPath[1].toLowerCase()) return amountIn;

            const amounts = await router.getAmountsOut(amountIn, cleanPath);
            return amounts[1];
        } catch (error) {
            console.error("GetAmountsOut Error:", error);
            return '0';
        }
    }, [router, getCleanPath]);

    const swapTokens = async (amountIn, amountOutMin, path, deadline) => {
        if (!router || !account) return;

        try {
            const signer = await provider.getSigner();
            const cleanPath = getCleanPath(path);
            
            const isNativeIn = path[0].symbol === 'ETH' || path[0] === 'ETH';
            const isNativeOut = path[path.length - 1].symbol === 'ETH' || path[path.length - 1] === 'ETH';

            console.log("🔄 LOGIC START:");
            console.log(`Type: ${isNativeIn ? 'ETH->Token' : isNativeOut ? 'Token->ETH' : 'Token->Token'}`);
            console.log("Path:", cleanPath);

            if (!isNativeIn) {
                const tokenAddress = cleanPath[0];
                const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
                
                const allowance = await tokenContract.allowance(account, ROUTER_ADDRESS);
                console.log(`💰 Allowance: ${allowance.toString()} | Needed: ${amountIn.toString()}`);
                
                if (allowance < BigInt(amountIn)) {
                    console.log("⚠️ Allowance too low. Sending Approve TX...");
                    const txApprove = await tokenContract.approve(ROUTER_ADDRESS, ethers.MaxUint256);
                    console.log("Wait for Approve...", txApprove.hash);
                    await txApprove.wait();
                    console.log("✅ Approve Confirmed!");
                } else {
                    console.log("✅ Allowance is sufficient.");
                }
            }

            console.log("🚀 Initiating Swap...");

            const feeData = await provider.getFeeData();
            const gasOptions = { 
                gasLimit: 5000000,
                gasPrice: feeData.gasPrice
            };

            console.log("Swapping...");
            let txSwap;

            if (isNativeIn) {
                // ETH -> Token
                txSwap = await router.swapExactETHForTokens(
                    0,
                    cleanPath,
                    account,
                    deadline,
                    { value: amountIn, ...gasOptions }
                );
            } else if (isNativeOut) {
                // Token -> ETH
                txSwap = await router.swapExactTokensForETH(
                    amountIn,
                    amountOutMin,
                    cleanPath,
                    account,
                    deadline,
                    gasOptions
                );

            } else {
                // Token -> Token
                txSwap = await router.swapExactTokensForTokens(
                    amountIn,
                    0,
                    cleanPath,
                    account,
                    deadline,
                    gasOptions
                );
            }

            console.log("Transaction sent:", txSwap.hash);
            const receipt = await txSwap.wait();
            console.log("Swap confirmed!", receipt);
            
            return receipt;

        } catch (error) {
            console.error("Swap failed logic:", error);
            if (error.transaction) console.error("Tx Data:", error.transaction);
            if (error.data) console.error("Revert Data:", error.data);
            throw error;
        }
    };

    return { getAmountsIn, getAmountsOut, swapTokens };
};