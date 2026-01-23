import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, PAIR_ABI, ERC20_ABI } from '../constants/contracts';

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

    useEffect(() => {
        const fetchReserves = async () => {
            if (!tokenA || !tokenB) return;

            try {
                const provider = await getProvider();
                
                const factoryAbi = ["function getPair(address, address) view returns (address)"];
                const factoryContract = new ethers.Contract(CONTRACTS.FACTORY_ADDRESS, factoryAbi, provider);
                const pairAddress = await factoryContract.getPair(tokenA.address, tokenB.address);

                if (pairAddress === ethers.ZeroAddress) {
                    setLoading(false);
                    return;
                }

                const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
                const [reserve0, reserve1] = await pairContract.getReserves();
                const token0 = await pairContract.token0();

                let rA, rB;

                if (tokenA.address.toLowerCase() === token0.toLowerCase()) {
                    rA = parseFloat(ethers.formatUnits(reserve0, tokenA.decimals));
                    rB = parseFloat(ethers.formatUnits(reserve1, tokenB.decimals));
                } else {
                    rA = parseFloat(ethers.formatUnits(reserve1, tokenA.decimals));
                    rB = parseFloat(ethers.formatUnits(reserve0, tokenB.decimals));
                }

                const price = rA > 0 ? rB / rA : 0;

                const tvlValue = (rA * (tokenA.price || 0)) + (rB * (tokenB.price || 0));

                const volValue = tvlValue * (0.05 + Math.random() * 0.10);

                let aprValue = 0;
                if (tvlValue > 0) {
                    const dailyFees = volValue * 0.003;
                    aprValue = ((dailyFees * 365) / tvlValue) * 100;
                }

                const isHot = tvlValue > 1000000 || aprValue > 50;

                setStats({
                    tvl: formatCurrency(tvlValue),
                    vol: formatCurrency(volValue),
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
    }, [tokenA, tokenB]);

    return { ...stats, loading };
};