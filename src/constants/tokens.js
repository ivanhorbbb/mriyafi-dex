
import eth from '../assets/img/tokens/eth.png';
import usdc from '../assets/img/tokens/usdc.png';
import usdt from '../assets/img/tokens/usdt.png';
import wbtc from '../assets/img/tokens/wrapped-btc.png';
import weth from '../assets/img/tokens/wrapped-eth.png';
import mfi from '../assets/img/tokens/mfi.png';
import contractAddresses from './contract-address.json';

export const TOKENS = [
    { 
        name: 'MriyaFi',
        symbol: 'MFI',
        address: contractAddresses.MriyaFi,
        decimals: 18,
        img: mfi,
        price: 0.05,
        coingeckoId: null
    },
    { 
        name: 'Ethereum',
        symbol: 'ETH',
        address: "ETH",
        decimals: 18,
        img: eth,
        price: 2500.00,
        coingeckoId: 'ethereum'
    },
    { 
        name: 'USD Coin',
        symbol: 'USDC',
        address: contractAddresses.USDC,
        decimals: 6,
        img: usdc,
        price: 1.0,
        coingeckoId: 'usd-coin'
    },
    { 
        name: 'Tether',
        symbol: 'USDT',
        address: contractAddresses.USDT,
        decimals: 6,
        img: usdt,
        price: 1.0,
        coingeckoId: 'tether'
    },
    { 
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        address: contractAddresses.WBTC,
        decimals: 8,
        img: wbtc,
        price: 60000.00,
        coingeckoId: 'wrapped-bitcoin'
    },
    { 
        name: 'Wrapped Ethereum',
        symbol: 'WETH',
        address: contractAddresses.WETH,
        decimals: 18,
        img: weth,
        price: 2500.00,
        coingeckoId: 'ethereum'
    }
];