import eth from '../assets/img/tokens/eth.png';
import usdc from '../assets/img/tokens/usdc.png';
import usdt from '../assets/img/tokens/usdt.png';
import wbtc from '../assets/img/tokens/wrapped-btc.png';
import weth from '../assets/img/tokens/wrapped-eth.png';
import mfi from '../assets/img/tokens/mfi.png';

export const TOKENS = [
    { symbol: 'ETH', name: 'Ethereum', img: eth, balance: '2.5', price: 2450.50 },
    { symbol: 'USDC', name: 'USD Coin', img: usdc, balance: '4,500', price: 1.00 },
    { symbol: 'USDT', name: 'Tether', img: usdt, balance: '3,500.25', price: 1.00 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', img: wbtc, balance: '0.05', price: 98500.00 },
    { symbol: 'WETH', name: 'Wrapped Ethereum', img: weth, balance: '2.1', price: 2450.50 },
    { symbol: 'MFI', name: 'Mriya Finance', img: mfi, balance: '200,000', price: 0.05 }
];