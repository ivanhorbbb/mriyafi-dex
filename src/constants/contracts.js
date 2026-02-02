import contractAddresses from './contract-address.json';

export const CONTRACTS = {
    FACTORY_ADDRESS: contractAddresses.Factory,
    ROUTER_ADDRESS: contractAddresses.Router,
    TOKENS: {
        'MFI': contractAddresses.MriyaFi,
        'USDC': contractAddresses.USDC,
        'WETH': contractAddresses.WETH,
        'WBTC': contractAddresses.WBTC,
        'USDT': contractAddresses.USDT,
        'ETH': 'ETH'
    }
};

export const PAIR_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint)",
    "function balanceOf(address owner) view returns (uint)",
    "function allowance(address owner, address spender) view returns (uint)",
    "function approve(address spender, uint value) returns (bool)",
    "function transfer(address to, uint value) returns (bool)",
    "function transferFrom(address from, address to, uint value) returns (bool)",

    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function price0CumulativeLast() view returns (uint)",
    "function price1CumulativeLast() view returns (uint)",

    "event Mint(address indexed sender, uint amount0, uint amount1)",
    "event Burn(address indexed sender, uint amount0, uint amount1, address indexed to)",
    "event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)",
    "event Sync(uint112 reserve0, uint112 reserve1)"
];

export const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint)",
    "function approve(address spender, uint amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

export const ROUTER_ABI = [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
    
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",

    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
    "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
    
    "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)",
    "function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH)"
];