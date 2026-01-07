import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { TOKENS } from '../constants/tokens';
import contractAbi from '../constants/contract-abi.json';

export const useTokenBalances = (provider, account) => {
    const [balances, setBalances] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!provider || !account) {
            setLoading(false);
            return;
        }

        const fetchBalances = async () => {
            try {
                setLoading(true);
                const newBalances = {};

                const ethBalance = await provider.getBalance(account);
                newBalances['ETH'] = parseFloat(ethers.formatEther(ethBalance)).toFixed(4);

                const tokenPromises = TOKENS
                    .filter(t => t.symbol !== 'ETH')
                    .map(async (token) => {
                        const code = await provider.getCode(token.address);
                        if (code === '0x') {
                            console.error(`🚨 ПОМИЛКА: За адресою ${token.address} (${token.symbol}) немає контракту!`);
                            return { symbol: token.symbol, balance: "ERROR" };
                        }

                        const contract = new ethers.Contract(token.address, contractAbi.ERC20, provider);
                        try {
                            const bal = await contract.balanceOf(account);

                            console.log(`Token: ${token.symbol}, Raw Balance: ${bal.toString()}, Address: ${token.address}`);
                            return { 
                                symbol: token.symbol, 
                                balance: parseFloat(ethers.formatUnits(bal, token.decimals)).toFixed(4) 
                            };
                        } catch (e) {
                            console.warn(`Failed to fetch balance for ${token.symbol}`, e);
                            return { symbol: token.symbol, balance: "0.0" };
                        }
                    });

                const results = await Promise.all(tokenPromises);
                
                results.forEach(res => {
                    newBalances[res.symbol] = res.balance;
                });

                setBalances(newBalances);

            } catch (error) {
                console.error("Error fetching balances:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBalances();

        const interval = setInterval(fetchBalances, 10000);
        return () => clearInterval(interval);

    }, [provider, account]);

    return { balances, loading };
};