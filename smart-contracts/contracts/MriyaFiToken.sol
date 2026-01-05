// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MriyaFiToken is ERC20, Ownable {
    // Emission 100M Tokens
    uint256 constant INITIAL_SUPPLY = 100_000_000 * 10**18;

    constructor() ERC20("MriyaFi", "MFI") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // func mint
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}