import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import contractAddresses from '../constants/contract-address.json';
import contractAbi from '../constants/contract-abi.json';

const ROUTER_ADDRESS = contractAddresses.Router;
const WETH_ADDRESS = contractAddresses.WETH;

const ROUTER_ABI = [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
    "function getAmountsIn(uint amountOut, address[] memory path) public view returns (uint[] memory amounts)",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
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
                    const routerContract = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
                    setRouter(routerContract);
                } catch (err) {
                    console.error("Failed to init router:", err);
                }
            };
            initRouter();
        }
    }, [provider]);

    const getCleanPath = (path) => {
        return path.map(address => address === 'ETH' ? WETH_ADDRESS : address);
    };

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
    }, [router]);

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
    }, [router]);

    const swapTokens = async (amountIn, amountOutMin, path, deadline) => {
        if (!router || !account) return;

        try {
            const signer = await provider.getSigner();
            
            const isNativeIn = path[0] === 'ETH';
            const isNativeOut = path[1] === 'ETH';

            const cleanPath = getCleanPath(path);

            if (cleanPath[0].toLowerCase() === cleanPath[1].toLowerCase()) {
                console.log("🔄 Wrapping/Unwrapping ETH...");
                const wethContract = new ethers.Contract(WETH_ADDRESS, WETH_ABI, signer);
                
                let tx;
                if (isNativeIn) {
                    // ETH -> WETH (Deposit)
                    tx = await wethContract.deposit({ value: amountIn });
                } else {
                    // WETH -> ETH (Withdraw)
                    tx = await wethContract.withdraw(amountIn);
                }
                
                console.log("Transaction sent:", tx.hash);
                return await tx.wait();
            }

            console.log(`💱 Swap Type: ${isNativeIn ? 'ETH -> Token' : isNativeOut ? 'Token -> ETH' : 'Token -> Token'}`);
            console.log("📍 Path:", cleanPath);

            if (!isNativeIn) {
                const tokenAddress = cleanPath[0];
                const tokenContract = new ethers.Contract(tokenAddress, contractAbi.ERC20, signer);
                
                const allowance = await tokenContract.allowance(account, ROUTER_ADDRESS);
                
                if (allowance < BigInt(amountIn)) {
                    console.log("Approving tokens...");
                    const txApprove = await tokenContract.approve(ROUTER_ADDRESS, ethers.MaxUint256);
                    await txApprove.wait();
                    console.log("Approved!");
                }
            }

            console.log("Swapping...");
            let txSwap;

            if (isNativeIn) {
                // --- ETH -> Token ---
                txSwap = await router.swapExactETHForTokens(
                    amountOutMin,
                    cleanPath,
                    account,
                    deadline,
                    { value: amountIn }
                );

            } else if (isNativeOut) {
                // --- Token -> ETH ---
                txSwap = await router.swapExactTokensForETH(
                    amountIn,
                    amountOutMin,
                    cleanPath,
                    account,
                    deadline
                );

            } else {
                // --- Token -> Token ---
                txSwap = await router.swapExactTokensForTokens(
                    amountIn,
                    amountOutMin,
                    cleanPath,
                    account,
                    deadline
                );
            }

            console.log("Transaction sent:", txSwap.hash);
            const receipt = await txSwap.wait();
            console.log("Swap confirmed!", receipt);
            
            return receipt;

        } catch (error) {
            console.error("Swap failed logic:", error);
            throw error;
        }
    };

    return { getAmountsIn, getAmountsOut, swapTokens };
};