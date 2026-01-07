
import eth from '../assets/img/tokens/eth.png';
import usdc from '../assets/img/tokens/usdc.png';
import usdt from '../assets/img/tokens/usdt.png';
import wbtc from '../assets/img/tokens/wrapped-btc.png';
import weth from '../assets/img/tokens/wrapped-eth.png';
import mfi from '../assets/img/tokens/mfi.png';

export const TOKENS = [
    { 
        name: 'MriyaFi',
        symbol: 'MFI',
        address: "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d",
        decimals: 18,
        img: mfi,
        price: 0.02
    },
    { 
        name: 'Ethereum',
        symbol: 'ETH',
        address: "0x59b670e9fA9D0A427751Af201D676719a970857b",
        decimals: 18,
        img: eth
    },
    { 
        name: 'USD Coin',
        symbol: 'USDC',
        address: "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1",
        decimals: 6,
        img: usdc,
        price: 1.0
    },
    { 
        name: 'Tether',
        symbol: 'USDT',
        address: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
        decimals: 6,
        img: usdt
    },
    { 
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        address: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
        decimals: 8,
        img: wbtc
    },
    { 
        name: 'Wrapped Ethereum',
        symbol: 'WETH',
        address: "0x59b670e9fA9D0A427751Af201D676719a970857b",
        decimals: 18,
        img: weth
    }
];