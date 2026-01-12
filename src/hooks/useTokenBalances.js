import { useEffect, useState, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { TOKENS } from '../constants/tokens';
import contractAbi from '../constants/contract-abi.json';

export const useTokenBalances = (provider, account, refreshTrigger = 0) => {
    const [balances, setBalances] = useState({});
    const [loading, setLoading] = useState(true);

    const isFetching = useRef(false);

    const fetchBalances = useCallback(async () => {
        if (!provider || !account || isFetching.current) return;

        isFetching.current = true;

        try {
            const newBalances = {};

            try {
                const ethBalance = await provider.getBalance(account);
                newBalances['ETH'] = parseFloat(ethers.formatEther(ethBalance)).toFixed(4);
            } catch {
                newBalances['ETH'] = "0.0000";
            }

            const tokenPromises = TOKENS
            .filter(t => t.symbol !== 'ETH')
            .map(async (token) => {
                try {
                    const contract = new ethers.Contract(token.address, contractAbi.ERC20, provider);
                    const bal = await contract.balanceOf(account);
                    return {
                        symbol: token.symbol,
                        balance: parseFloat(ethers.formatUnits(bal, token.decimals)).toFixed(4)
                    };
                } catch {
                    return { symbol: token.symbol, balance: "0.0000" };
                }
            });

            const results = await Promise.all(tokenPromises);

            results.forEach(res => {
                newBalances[res.symbol] = res.balance;
            });

            setBalances(prevBalances => {
                if (JSON.stringify(prevBalances) === JSON.stringify(newBalances)) {
                    return prevBalances;
                }

                return newBalances;
            });

        } catch (error) {
            console.error("Error fetching balances:", error);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [provider, account]);

    useEffect(() => {
        if (provider && account) {
            fetchBalances();

            const interval = setInterval(fetchBalances, 1000);
            return () => clearInterval(interval);
        } else {
            setLoading(false);
        }
    }, [provider, account, fetchBalances, refreshTrigger]);

    return { balances, loading };
};