import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, PAIR_ABI } from '../constants/contracts';

const getProvider = () => {
    if (window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
    }
    return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
};

const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(2)}K`;
    return `$${val.toFixed(2)}`;
};

export const usePoolData = (tokenA, tokenB) => {
    const [stats, setStats] = useState({
        tvl: '$0',
        vol: '$0',
        apr: '0%',
        price: 0,
        reserves: { reserveA: 0, reserveB: 0 },
        isHot: false
    });
    const [loading, setLoading] = useState(true);

    const providerRef = useRef(null);

    useEffect(() => {
        if (!tokenA?.address || !tokenB?.address || !ethers.isAddress(tokenA.address) || !ethers.isAddress(tokenB.address)) {
            setLoading(false);
            return;
        }

        const fetchReserves = async () => {
            try {
                if (!providerRef.current) {
                    providerRef.current = await getProvider();
                }
                const provider = providerRef.current;
                
                const factoryAbi = ["function getPair(address, address) view returns (address)"];
                const factoryContract = new ethers.Contract(CONTRACTS.FACTORY_ADDRESS, factoryAbi, provider);
                const addrA = tokenA.symbol === 'ETH' ? CONTRACTS.TOKENS['WETH'] : tokenA.address;
                const addrB = tokenB.symbol === 'ETH' ? CONTRACTS.TOKENS['WETH'] : tokenB.address;

                if (!ethers.isAddress(addrA) || !ethers.isAddress(addrB)) {
                    setLoading(false);
                    return;
                }

                const pairAddress = await factoryContract.getPair(addrA, addrB);

                const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
                const [reserve0, reserve1] = await pairContract.getReserves();
                const token0 = await pairContract.token0();

                const decA = tokenA.decimals || 18;
                const decB = tokenB.decimals || 18;
                const priceA = tokenA.price || 0;
                const priceB = tokenB.price || 0;

                let rA, rB;

                if (tokenA.address.toLowerCase() === token0.toLowerCase()) {
                    rA = parseFloat(ethers.formatUnits(reserve0, decA));
                    rB = parseFloat(ethers.formatUnits(reserve1, decB));
                } else {
                    rA = parseFloat(ethers.formatUnits(reserve1, decA));
                    rB = parseFloat(ethers.formatUnits(reserve0, decB));
                }

                const price = rA > 0 ? rB / rA : 0;

                const tvlValue = (rA * priceA) + (rB * priceB);
                
                const currentBlock = await provider.getBlockNumber();
                const blocksAgo = 2000;
                const fromBlock = Math.max(0, currentBlock - blocksAgo);

                const filterSwap = pairContract.filters.Swap();
                const logs = await pairContract.queryFilter(filterSwap, fromBlock, currentBlock);

                let volumeUSD = 0;

                logs.forEach(log => {
                    const amount0In = parseFloat(ethers.formatUnits(log.args[1], tokenA.address.toLowerCase() === token0.toLowerCase() ? decA : decB));
                    const amount1In = parseFloat(ethers.formatUnits(log.args[2], tokenA.address.toLowerCase() === token0.toLowerCase() ? decB : decA));
                    
                    if (tokenA.address.toLowerCase() === token0.toLowerCase()) {
                         volumeUSD += (amount0In * priceA) + (amount1In * priceB);
                    } else {
                         volumeUSD += (amount0In * priceB) + (amount1In * priceA);
                    }
                });

                let aprValue = 0;
                if (tvlValue > 0) {
                    const dailyFees = volumeUSD * 0.003;
                    aprValue = ((dailyFees * 365) / tvlValue) * 100;
                }

                const isHot = tvlValue > 50000 || aprValue > 20;

                setStats({
                    tvl: formatCurrency(tvlValue),
                    vol: formatCurrency(volumeUSD),
                    apr: `${aprValue.toFixed(2)}%`,
                    price,
                    reserves: { reserveA: rA, reserveB: rB },
                    isHot
                });

            } catch (error) {
                console.error("Error fetching pool data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReserves();
        const interval = setInterval(fetchReserves, 15000);
        return () => clearInterval(interval);

        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenA?.address, tokenB?.address, tokenA?.price, tokenB?.price]); 

    return { ...stats, loading };
};