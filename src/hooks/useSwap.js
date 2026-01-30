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
            
            const isNativeIn = path[0] === 'ETH';
            const isNativeOut = path[1] === 'ETH';


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
                const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
                
                const allowance = await tokenContract.allowance(account, ROUTER_ADDRESS);
                
                if (allowance < BigInt(amountIn)) {
                    console.log("Approving tokens...");
                    const txApprove = await tokenContract.approve(ROUTER_ADDRESS, ethers.MaxUint256);
                    await txApprove.wait();
                    console.log("Approved!");
                }
            }

            const feeData = await provider.getFeeData();
            const gasOptions = { 
                gasLimit: 3000000,
                gasPrice: feeData.gasPrice
            };

            console.log("Swapping...");
            let txSwap;

            if (isNativeIn) {
                // ETH -> Token
                txSwap = await router.swapExactETHForTokens(
                    amountOutMin,
                    cleanPath,
                    account,
                    deadline,
                    { value: amountIn, ...gasOptions }
                );

            } else if (isNativeOut) {
                // Token -> ETH
                console.log("Calling swapExactTokensForETH...");
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
                    amountOutMin,
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
            if (error.reason) console.error("Revert Reason:", error.reason);
            if (error.data) console.error("Revert Data:", error.data);
            throw error;
        }
    };

    return { getAmountsIn, getAmountsOut, swapTokens };
};