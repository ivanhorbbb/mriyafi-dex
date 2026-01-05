// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UniswapV2Pair.sol";

contract UniswapV2Factory {
    address public feeTo;
    address public feeToSetter;

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint256);

    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, 'MriyaFi: IDENTICAL_ADDRESSES');
        // sort Tokens
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'MriyaFi: ZERO_ADDRESSES');
        require(getPair[token0][token1] == address(0), 'MriyaFi: PAIR_EXISTS');

        // creating new pair
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        UniswapV2Pair newPair = new UniswapV2Pair{salt: salt}();

        // init pair
        newPair.initialize(token0, token1);

        pair = address(newPair);

        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function seeFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, 'MriyaFi: FORBIDDEN');
        feeTo = _feeTo;
    }
    
    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, 'MriyaFi: FORBIDDEN');
        feeToSetter = _feeToSetter;
    }
}