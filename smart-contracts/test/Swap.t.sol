// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import "../contracts/MockTokens.sol";
import "../contracts/UniswapV2Factory.sol";
import "../contracts/UniswapV2Router02.sol";
import "../contracts/UniswapV2Pair.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GenericMockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**18);
    }
}

contract SwapTest is Test {
    UniswapV2Factory factory;
    UniswapV2Router02 router;

    GenericMockERC20 tokenA;
    GenericMockERC20 tokenB;
    MockWETH weth;

    address owner = address(this);
    address user = address(0xBEEF);

    function setUp() public {
        tokenA = new GenericMockERC20("Token A", "TKNA");
        tokenB = new GenericMockERC20("Token B", "TKNB");
        weth = new MockWETH();

        factory = new UniswapV2Factory(owner);

        router = new UniswapV2Router02(address(factory), address(weth));

        factory.createPair(address(tokenA), address(tokenB));

        tokenA.approve(address(router), 10000* 10**18);
        tokenB.approve(address(router), 10000 * 10**18);

        router.addLiquidity(
            address(tokenA),
            address(tokenB),
            1000 * 10**18,
            1000 * 10**18,
            0,
            0,
            owner,
            block.timestamp + 1000
        );

        tokenA.transfer(user, 100 * 10**18);
    }

    // ==========================================
    // Test #1: Token -> Token
    // ==========================================
    function testSwapExactTokensForTokens() public {
        vm.startPrank(user);
        tokenA.approve(address(router), 10 * 10**18);

        address[] memory path = new address[](2);
        path[0] = address(tokenA);
        path[1] = address(tokenB);

        uint256 balanceB_Before = tokenB.balanceOf(user);

        router.swapExactTokensForTokens(
            10 * 10**18,
            0,
            path,
            user,
            block.timestamp + 1000
        );

        vm.stopPrank();

        uint256 balanceB_After = tokenB.balanceOf(user);

        console.log("Token -> Token Swap Result:", balanceB_After - balanceB_Before);
        assertGt(balanceB_After, balanceB_Before, "Swap failed: No tokens received");
    }

    // ==========================================
    // Test #2: Remove Liquidity
    // ==========================================
    function testRemoveLiquidity() public {
        address pairAddress = factory.getPair(address(tokenA), address(tokenB));
        UniswapV2Pair pair = UniswapV2Pair(pairAddress);
        
        uint256 lpBalance = pair.balanceOf(owner);
        console.log("LP Tokens Balance:", lpBalance);

        pair.approve(address(router), lpBalance);

        router.removeLiquidity(
            address(tokenA),
            address(tokenB),
            lpBalance,
            0,
            0,
            owner,
            block.timestamp + 1000
        );

        assertLe(pair.balanceOf(owner), 1000, "LP tokens not burned");
        assertGt(tokenA.balanceOf(owner), 0, "Token A not returned");
    }

    // ==========================================
    // Test #3: ETH -> Token (Buy)
    // ==========================================
    function testSwapExactETHForTokens() public {
        vm.startPrank(owner);
        factory.createPair(address(weth), address(tokenB));

        weth.deposit{value: 20 ether}();

        weth.approve(address(router), 20 ether);
        tokenB.approve(address(router), 2000 * 10**18);

        router.addLiquidity(
            address(weth),
            address(tokenB),
            10 ether,
            1000 * 10**18,
            0,
            0,
            owner,
            block.timestamp
        );
        vm.stopPrank();

        vm.deal(user, 5 ether);
        vm.startPrank(user);

        address[] memory path = new address[](2);
        path[0] = address(weth);
        path[1] = address(tokenB);

        uint256 balanceBefore = tokenB.balanceOf(user);

        router.swapExactETHForTokens{value: 1 ether}(
            0, path, user, block.timestamp + 100
        );
        vm.stopPrank();

        assertGt(tokenB.balanceOf(user), balanceBefore, "ETH -> Token failed");
    }

    // ==========================================
    // Test #4: Token -> ETH (Sell)
    // ==========================================
    function testSwapExactTokensForETH() public {
        vm.startPrank(owner);
        if (factory.getPair(address(weth), address(tokenB)) == address(0)) {
            factory.createPair(address(weth), address(tokenB));
            weth.deposit{value: 20 ether}();
            weth.approve(address(router), 20 ether);
            tokenB.approve(address(router), 2000 * 10**18);
            router.addLiquidity(
                address(weth),
                address(tokenB),
                10 ether, 1000 * 10**18,
                0,
                0,
                owner,
                block.timestamp
            );
            vm.stopPrank();

            tokenB.transfer(user, 100 * 10**18);

            vm.startPrank(user);
            tokenB.approve(address(router), 100 * 10**18);

            address[] memory path = new address[](2);
            path[0] = address(tokenB);
            path[1] = address(weth);

            uint256 ethBefore = address(user).balance;

            router.swapExactTokensForETH(
                50 * 10**18,
                0,
                path,
                user,
                block.timestamp + 100
            );
            vm.stopPrank();

            assertGt(address(user).balance, ethBefore, "Token -> ETH failed");
        }
    }
}