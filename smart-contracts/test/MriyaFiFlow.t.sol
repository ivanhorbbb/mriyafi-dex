// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/UniswapV2Factory.sol";
import "../contracts/UniswapV2Router02.sol";
import "../contracts/MriyaFiToken.sol"; 

contract LocalWETH {
    string public name     = "Wrapped Ether";
    string public symbol   = "WETH";
    uint8  public decimals = 18;
    mapping (address => uint) public  balanceOf;
    mapping (address => mapping (address => uint))  public  allowance;

    event  Deposit(address indexed dst, uint wad);
    event  Withdrawal(address indexed src, uint wad);
    event  Approval(address indexed src, address indexed guy, uint wad);
    event  Transfer(address indexed src, address indexed dst, uint wad);

    receive() external payable { deposit(); }
    
    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint wad) public {
        require(balanceOf[msg.sender] >= wad);
        balanceOf[msg.sender] -= wad;
        
        (bool success, ) = msg.sender.call{value: wad}("");
        require(success, "ETH transfer failed");
        
        emit Withdrawal(msg.sender, wad);
    }

    function approve(address guy, uint wad) public returns (bool) {
        allowance[msg.sender][guy] = wad;
        emit Approval(msg.sender, guy, wad);
        return true;
    }

    function transfer(address dst, uint wad) public returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(address src, address dst, uint wad) public returns (bool) {
        require(balanceOf[src] >= wad);
        if (src != msg.sender && allowance[src][msg.sender] != type(uint).max) {
            require(allowance[src][msg.sender] >= wad);
            allowance[src][msg.sender] -= wad;
        }
        balanceOf[src] -= wad;
        balanceOf[dst] += wad;
        emit Transfer(src, dst, wad);
        return true;
    }
}

contract MriyaFiFlowTest is Test {
    UniswapV2Factory factory;
    UniswapV2Router02 router;
    LocalWETH weth; 
    MriyaFiToken mfi;

    address owner = address(0xA11CE);
    address liquidityProvider = address(0xB0B);
    address trader = address(0xCAFE);

    function setUp() public {
        vm.startPrank(owner);
        factory = new UniswapV2Factory(owner);
        
        weth = new LocalWETH();
        
        router = new UniswapV2Router02(address(factory), address(weth));
        mfi = new MriyaFiToken(); 
        vm.stopPrank();

        vm.deal(liquidityProvider, 1000 ether);
        vm.prank(owner);
        mfi.transfer(liquidityProvider, 100000 * 10**18);

        vm.deal(trader, 100 ether);
    }

    function testFullUserScenario() public {
        // --- 1. Add Liquidity ---
        vm.startPrank(liquidityProvider);
        uint mfiLiq = 5000 * 10**18;
        uint ethLiq = 10 ether;
        mfi.approve(address(router), mfiLiq);

        router.addLiquidityETH{value: ethLiq}(
            address(mfi), mfiLiq, 0, 0, liquidityProvider, block.timestamp + 1200
        );
        vm.stopPrank();

        address pairAddr = factory.getPair(address(mfi), address(weth));
        assertTrue(pairAddr != address(0), "Pair not created");

        // --- 2. Swap ETH -> MFI ---
        vm.startPrank(trader);
        uint ethSwapAmount = 1 ether;
        address[] memory path = new address[](2);
        path[0] = address(weth); 
        path[1] = address(mfi);  

        uint balanceBefore = mfi.balanceOf(trader);
        router.swapExactETHForTokens{value: ethSwapAmount}(
            0, path, trader, block.timestamp + 1200
        );
        assertTrue(mfi.balanceOf(trader) > balanceBefore, "Swap failed");
        vm.stopPrank();

        // --- 3. Remove Liquidity ---
        vm.startPrank(liquidityProvider);
        console.log("\n--- Step 3: Remove Liquidity (DEBUG MODE) ---");

        ITestPair pair = ITestPair(pairAddr);
        uint lpBalance = pair.balanceOf(liquidityProvider);
        console.log("LP Balance:", lpBalance);

        pair.approve(address(router), lpBalance);

        router.removeLiquidity(
            address(mfi),
            address(weth),
            lpBalance,
            0,
            0,
            liquidityProvider,
            block.timestamp + 1200
        );

        console.log("Liquidity Removed (WETH + MFI received)");
        console.log("WETH Balance:", weth.balanceOf(liquidityProvider));
        
        vm.stopPrank();
    }
}

interface ITestPair {
    function balanceOf(address owner) external view returns (uint);
    function approve(address spender, uint value) external returns (bool);
}