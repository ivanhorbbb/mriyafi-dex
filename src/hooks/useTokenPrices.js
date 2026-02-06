import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TOKENS } from '../constants/tokens';

const PAIR_ABI = [
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() external view returns (address)"
];

const MFI_PAIR_ADDRESS = "0x14fb3120592252896b13fe9921a0cb570be133ae"
const MFI_ADDRESS = TOKENS.find(token => token.symbol === 'MFI').address;

export const useTokenPrices = (provider) => {
    const [prices, setPrices] = useState({
        'ETH': 1900,
        'WETH': 1900,
        'USDC': 1,
        'USDT': 1,
        'WBTC': 65000,
        'MFI': 0.05
    });

    useEffect(() => {
    const fetchPrices = async () => {
      let newPrices = { ...prices };
      let ethPriceCurrent = 2500;

      try {
        const [ethRes, btcRes] = await Promise.all([
            fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'),
            fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
        ]);

        const ethData = await ethRes.json();
        const btcData = await btcRes.json();

        if (ethData.price) {
            ethPriceCurrent = parseFloat(ethData.price);
            newPrices['ETH'] = ethPriceCurrent;
            newPrices['WETH'] = ethPriceCurrent;
        }
        
        if (btcData.price) {
            newPrices['WBTC'] = parseFloat(btcData.price);
        }

        newPrices['USDC'] = 1.0;
        newPrices['USDT'] = 1.0;

        console.log("Binance Prices Updated:", { ETH: ethPriceCurrent, BTC: newPrices['WBTC'] });

      } catch (apiError) {
        console.warn("Binance API Error (using fallback):", apiError);
      }

      if (provider) {
        try {
          const pairContract = new ethers.Contract(MFI_PAIR_ADDRESS, PAIR_ABI, provider);
          
          const [reserves, token0] = await Promise.all([
            pairContract.getReserves(),
            pairContract.token0()
          ]);

          let resMFI = BigInt(0);
          let resWETH = BigInt(0);

          if (token0.toLowerCase() === MFI_ADDRESS.toLowerCase()) {
            resMFI = reserves.reserve0;
            resWETH = reserves.reserve1;
          } else {
            resMFI = reserves.reserve1;
            resWETH = reserves.reserve0;
          }

          const formattedMFI = parseFloat(ethers.formatUnits(resMFI, 18));
          const formattedWETH = parseFloat(ethers.formatUnits(resWETH, 18));

          if (formattedMFI > 0) {
            const priceInEth = formattedWETH / formattedMFI;
            newPrices['MFI'] = priceInEth * ethPriceCurrent;
            
            // console.log(`MFI Calc: ${priceInEth.toFixed(6)} ETH * $${ethPriceCurrent}`);
          }

        } catch (onChainError) {
          console.error("MFI on-chain calc error:", onChainError);
        }
      }

      setPrices(prev => ({...prev, ...newPrices}));
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  return prices;
};