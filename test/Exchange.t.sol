// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import "../contracts/Token.sol";
import "../contracts/Exchange.sol";

contract ExchangeTest is Test {
    Token public token1;
    Token public token2;
    Exchange public exchange;
    
    address public feeAccount = address(0x999);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    
    uint256 public feePercent = 10; // 1%
    
    function setUp() public {
        token1 = new Token("Token1", "TK1", 1000000);
        token2 = new Token("Token2", "TK2", 1000000);
        exchange = new Exchange(feeAccount, feePercent);
        
        // Transfer tokens to users
        token1.transfer(user1, 100000 * 10**18);
        token2.transfer(user2, 100000 * 10**18);
    }
    
    function test_InitialState() public {
        assertEq(exchange.feeAccount(), feeAccount);
        assertEq(exchange.feePercent(), feePercent);
        assertEq(exchange.orderCount(), 0);
    }
    
    function test_DepositToken() public {
        uint256 amount = 1000 * 10**18;
        
        vm.startPrank(user1);
        token1.approve(address(exchange), amount);
        exchange.depositToken(address(token1), amount);
        vm.stopPrank();
        
        assertEq(exchange.balanceOf(address(token1), user1), amount);
        assertEq(token1.balanceOf(address(exchange)), amount);
    }
    
    function test_WithdrawToken() public {
        uint256 amount = 1000 * 10**18;
        
        // First deposit
        vm.startPrank(user1);
        token1.approve(address(exchange), amount);
        exchange.depositToken(address(token1), amount);
        
        // Then withdraw
        exchange.withdrawToken(address(token1), amount);
        vm.stopPrank();
        
        assertEq(exchange.balanceOf(address(token1), user1), 0);
        assertEq(token1.balanceOf(user1), 100000 * 10**18); // Back to original
    }
    
    function test_MakeOrder() public {
        uint256 depositAmount = 1000 * 10**18;
        uint256 orderAmount = 100 * 10**18;
        uint256 orderPrice = 1 * 10**17; // 0.1 token2 for 1 token1
        
        vm.startPrank(user1);
        token1.approve(address(exchange), depositAmount);
        exchange.depositToken(address(token1), depositAmount);
        
        exchange.makeOrder(
            address(token2), // tokenGet
            orderPrice,      // amountGet  
            address(token1), // tokenGive
            orderAmount      // amountGive
        );
        vm.stopPrank();
        
        assertEq(exchange.orderCount(), 1);
        
        (uint256 id, address user, address tokenGet, uint256 amountGet, 
         address tokenGive, uint256 amountGive, uint256 timestamp) = exchange.orders(1);
         
        assertEq(id, 1);
        assertEq(user, user1);
        assertEq(tokenGet, address(token2));
        assertEq(amountGet, orderPrice);
        assertEq(tokenGive, address(token1));
        assertEq(amountGive, orderAmount);
        assertTrue(timestamp > 0);
    }
    
    function test_CancelOrder() public {
        uint256 depositAmount = 1000 * 10**18;
        uint256 orderAmount = 100 * 10**18;
        uint256 orderPrice = 1 * 10**17;
        
        // Create order
        vm.startPrank(user1);
        token1.approve(address(exchange), depositAmount);
        exchange.depositToken(address(token1), depositAmount);
        exchange.makeOrder(address(token2), orderPrice, address(token1), orderAmount);
        
        // Cancel order
        exchange.cancelOrder(1);
        vm.stopPrank();
        
        assertTrue(exchange.orderCancelled(1));
    }
    
    function test_RevertWhen_CancelOrderNotOwner() public {
        uint256 depositAmount = 1000 * 10**18;
        uint256 orderAmount = 100 * 10**18;
        uint256 orderPrice = 1 * 10**17;
        
        // Create order as user1
        vm.startPrank(user1);
        token1.approve(address(exchange), depositAmount);
        exchange.depositToken(address(token1), depositAmount);
        exchange.makeOrder(address(token2), orderPrice, address(token1), orderAmount);
        vm.stopPrank();
        
        // Try to cancel as user2 (should fail)
        vm.expectRevert();
        vm.prank(user2);
        exchange.cancelOrder(1);
    }
}