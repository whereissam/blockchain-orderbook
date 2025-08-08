//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../contracts/core/Token.sol";
import "../../contracts/core/Exchange.sol";
import "../../contracts/mocks/MockToken.sol";

contract CoreTest is Test {
    Token token1;
    Token token2;
    Exchange exchange;
    MockToken mockToken;
    
    address user1 = address(0x1);
    address user2 = address(0x2);
    address feeAccount = address(0x3);
    uint256 feePercent = 100; // 1%
    
    function setUp() public {
        // Deploy test tokens
        token1 = new Token("Test Token 1", "TT1", 1000000);
        token2 = new Token("Test Token 2", "TT2", 1000000);
        mockToken = new MockToken("Mock Token", "MOCK", 1000000);
        
        // Deploy exchange
        exchange = new Exchange(feeAccount, feePercent);
        
        // Setup initial balances
        vm.startPrank(address(this));
        token1.transfer(user1, 10000 ether);
        token2.transfer(user2, 10000 ether);
        vm.stopPrank();
    }
    
    function testTokenDeployment() public {
        assertEq(token1.name(), "Test Token 1");
        assertEq(token1.symbol(), "TT1");
        assertEq(token1.decimals(), 18);
    }
    
    function testExchangeDeployment() public {
        assertEq(exchange.feeAccount(), feeAccount);
        assertEq(exchange.feePercent(), feePercent);
    }
    
    function testMockTokenMinting() public {
        uint256 initialSupply = mockToken.totalSupply();
        mockToken.mint(user1, 1000 ether);
        assertEq(mockToken.totalSupply(), initialSupply + 1000 ether);
        assertEq(mockToken.balanceOf(user1), 1000 ether);
    }
}