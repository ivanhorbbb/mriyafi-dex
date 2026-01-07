import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractAddresses from '../constants/contract-address.json';
import contractAbi from '../constants/contract-abi.json';

const ROUTER_ADDRESS = contractAddresses.Router;

export const useSwap = (provider, account) => {
    const [router, setRouter] = useState(null);

    useEffect(() => {
        if (provider) {
            const initRouter = async () => {
                try {
                    const signer = await provider.getSigner();
                    const routerContract = new ethers.Contract(
                        ROUTER_ADDRESS,
                        contractAbi.Router,
                        signer
                    );
                    setRouter(routerContract);
                } catch (err) {
                    console.error("Failed to init router:", err);
                }
            };
            initRouter();
        }
    }, [provider]);

    const getAmountsOut = async (amountIn, path) => {

        if (!router || !amountIn || amountIn === '0' || path.length < 2) return '0';
        
        try {
            const amounts = await router.getAmountsOut(amountIn, path);
            return amounts[1]; 
        } catch (error) {
            console.error("Error getting quote:", error);
            return '0';
        }
    };

    const swapTokens = async (amountIn, amountOutMin, path, deadline) => {
        if (!router || !account) return;

        try {
            const signer = await provider.getSigner();
            const tokenAddress = path[0];

            // Approve ERC20, not ETH
            const tokenContract = new ethers.Contract(tokenAddress, contractAbi.ERC20, signer);
            
            console.log(`Checking allowance for ${tokenAddress}...`);
            const allowance = await tokenContract.allowance(account, ROUTER_ADDRESS);
            
            if (allowance < amountIn) {
                console.log("Approving tokens...");
                const txApprove = await tokenContract.approve(ROUTER_ADDRESS, ethers.MaxUint256);
                await txApprove.wait();
                console.log("Approved!");
            }

            // Swap
            console.log("Swapping...");
            const deadlineTimestamp = Math.floor(Date.now() / 1000) + 60 * deadline;

            const txSwap = await router.swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                account,
                deadlineTimestamp
            );

            console.log("Transaction sent:", txSwap.hash);
            const receipt = await txSwap.wait();
            console.log("Swap confirmed!", receipt);
            
            return receipt;

        } catch (error) {
            console.error("Swap failed:", error);
            throw error;
        }
    };

    return { getAmountsOut, swapTokens };
};