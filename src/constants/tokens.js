
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
        address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        decimals: 18,
        img: mfi,
        price: 0.02
    },
    { 
        name: 'Ethereum',
        symbol: 'ETH',
        address: "ETH",
        decimals: 18,
        img: eth,
        price: 2000.00
    },
    { 
        name: 'USD Coin',
        symbol: 'USDC',
        address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        decimals: 6,
        img: usdc,
        price: 1.0
    },
    { 
        name: 'Tether',
        symbol: 'USDT',
        address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        decimals: 6,
        img: usdt,
        price: 1.0
    },
    { 
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
        decimals: 8,
        img: wbtc,
        price: 30000.00
    },
    { 
        name: 'Wrapped Ethereum',
        symbol: 'WETH',
        address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        decimals: 18,
        img: weth,
        price: 2000.00
    }
];