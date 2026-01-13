import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, PAIR_ABI, ERC20_ABI } from '../constants/contracts';

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

export const usePoolData = (tokenA_Address, tokenB_Address) => {
    const [reserves, setReserves] = useState({ reserveA: 0, reserveB: 0 });
    const [price, setPrice] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReserves = async () => {
            if (!tokenA_Address || !tokenB_Address) return;

            try {
                setLoading(true);

                const factoryAbi = ["function getPair(address, address) view returns (address)"];
                const factoryContract = new ethers.Contract(CONTRACTS.FACTORY_ADDRESS, factoryAbi, provider);

                const pairAddress = await factoryContract.getPair(tokenA_Address, tokenB_Address);

                if (pairAddress === ethers.ZeroAddress) {
                    console.warn("Pair does not exist");
                    setReserves({ reserveA: 0, reserveB: 0 });
                    setPrice(0);
                    setLoading(false);
                    return;
                }

                const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);

                const [reserve0, reserve1] = await pairContract.getReserves();
                const token0_Address = await pairContract.token0();
                const token1_Address = await pairContract.token1();

                const token0Contract = new ethers.Contract(token0_Address, ERC20_ABI, provider);
                const token1Contract = new ethers.Contract(token1_Address, ERC20_ABI, provider);

                const [decimals0, decimals1] = await Promise.all([
                    token0Contract.decimals(),
                    token1Contract.decimals()
                ]);

                let rA, rB, decA, decB;
                
                if (tokenA_Address.toLowerCase() === token0_Address.toLowerCase()) {
                    rA = reserve0; 
                    decA = decimals0;
                    
                    rB = reserve1; 
                    decB = decimals1;
                } else {
                    rA = reserve1; 
                    decA = decimals1;
                    
                    rB = reserve0; 
                    decB = decimals0;
                }

                const formattedA = parseFloat(ethers.formatUnits(rA, decA));
                const formattedB = parseFloat(ethers.formatUnits(rB, decB));

                setReserves({ reserveA: formattedA, reserveB: formattedB });

                if (formattedA > 0) {
                    setPrice(formattedB / formattedA);
                } else {
                    setPrice(0);
                }
            } catch (error) {
                console.error("Error fetching pool data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReserves();

        const interval = setInterval(fetchReserves, 10000);
        return () => clearInterval(interval);
    }, [tokenA_Address, tokenB_Address]);

    return { reserves, price, loading };
}