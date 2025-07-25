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
    
    function test_FillOrder() public {
        uint256 depositAmount = 1000 * 10**18;
        uint256 orderAmount = 100 * 10**18;
        uint256 orderPrice = 10 * 10**18; // 10 token2 for 100 token1
        
        // User1 creates sell order (wants to sell token1 for token2)
        vm.startPrank(user1);
        token1.approve(address(exchange), depositAmount);
        exchange.depositToken(address(token1), depositAmount);
        exchange.makeOrder(address(token2), orderPrice, address(token1), orderAmount);
        vm.stopPrank();
        
        // User2 fills the order (buys token1 with token2)
        vm.startPrank(user2);
        token2.approve(address(exchange), orderPrice);
        exchange.depositToken(address(token2), orderPrice);
        exchange.fillOrder(1);
        vm.stopPrank();
        
        // Check balances after trade
        uint256 feeAmount = (orderPrice * feePercent) / 100;
        
        // User1 should receive token2 minus fee
        assertEq(exchange.balanceOf(address(token2), user1), orderPrice - feeAmount);
        // User2 should receive token1
        assertEq(exchange.balanceOf(address(token1), user2), orderAmount);
        // Fee account should receive fee
        assertEq(exchange.balanceOf(address(token2), feeAccount), feeAmount);
        
        // Order should be marked as filled
        assertTrue(exchange.orderFilled(1));
    }
    
    function test_RevertWhen_FillOrderTwice() public {
        uint256 depositAmount = 1000 * 10**18;
        uint256 orderAmount = 100 * 10**18;
        uint256 orderPrice = 10 * 10**18;
        
        // Create and fill order
        vm.startPrank(user1);
        token1.approve(address(exchange), depositAmount);
        exchange.depositToken(address(token1), depositAmount);
        exchange.makeOrder(address(token2), orderPrice, address(token1), orderAmount);
        vm.stopPrank();
        
        vm.startPrank(user2);
        token2.approve(address(exchange), orderPrice);
        exchange.depositToken(address(token2), orderPrice);
        exchange.fillOrder(1);
        
        // Try to fill again (should fail)
        vm.expectRevert();
        exchange.fillOrder(1);
        vm.stopPrank();
    }
    
    function test_RevertWhen_FillCancelledOrder() public {
        uint256 depositAmount = 1000 * 10**18;
        uint256 orderAmount = 100 * 10**18;
        uint256 orderPrice = 10 * 10**18;
        
        // Create order
        vm.startPrank(user1);
        token1.approve(address(exchange), depositAmount);
        exchange.depositToken(address(token1), depositAmount);
        exchange.makeOrder(address(token2), orderPrice, address(token1), orderAmount);
        exchange.cancelOrder(1);
        vm.stopPrank();
        
        // Try to fill cancelled order (should fail)
        vm.startPrank(user2);
        token2.approve(address(exchange), orderPrice);
        exchange.depositToken(address(token2), orderPrice);
        vm.expectRevert();
        exchange.fillOrder(1);
        vm.stopPrank();
    }
    
    function test_RevertWhen_InsufficientBalance() public {
        uint256 orderAmount = 100 * 10**18;
        uint256 orderPrice = 10 * 10**18;
        
        // Try to make order without sufficient balance
        vm.expectRevert();
        vm.prank(user1);
        exchange.makeOrder(address(token2), orderPrice, address(token1), orderAmount);
    }
    
    function test_MultipleOrdersAndTrades() public {
        uint256 depositAmount = 2000 * 10**18;
        
        // Setup both users with deposits
        vm.startPrank(user1);
        token1.approve(address(exchange), depositAmount);
        exchange.depositToken(address(token1), depositAmount);
        vm.stopPrank();
        
        vm.startPrank(user2);
        token2.approve(address(exchange), depositAmount);
        exchange.depositToken(address(token2), depositAmount);
        vm.stopPrank();
        
        // Create multiple orders
        vm.prank(user1);
        exchange.makeOrder(address(token2), 10 * 10**18, address(token1), 100 * 10**18); // Order 1
        
        vm.prank(user1);
        exchange.makeOrder(address(token2), 20 * 10**18, address(token1), 200 * 10**18); // Order 2
        
        vm.prank(user2);
        exchange.makeOrder(address(token1), 150 * 10**18, address(token2), 15 * 10**18); // Order 3
        
        assertEq(exchange.orderCount(), 3);
        
        // Fill some orders
        vm.prank(user2);
        exchange.fillOrder(1);
        
        vm.prank(user1);
        exchange.fillOrder(3);
        
        // Check that orders are marked as filled
        assertTrue(exchange.orderFilled(1));
        assertTrue(exchange.orderFilled(3));
        assertFalse(exchange.orderFilled(2)); // Order 2 should still be open
    }
    
    function test_Events() public {
        uint256 depositAmount = 1000 * 10**18;
        uint256 orderAmount = 100 * 10**18;
        uint256 orderPrice = 10 * 10**18;
        
        // Test Deposit event
        vm.startPrank(user1);
        token1.approve(address(exchange), depositAmount);
        
        vm.expectEmit(true, true, true, true);
        emit Deposit(address(token1), user1, depositAmount, depositAmount);
        exchange.depositToken(address(token1), depositAmount);
        
        // Test Order event
        vm.expectEmit(true, true, true, true);
        emit Order(1, user1, address(token2), orderPrice, address(token1), orderAmount, block.timestamp);
        exchange.makeOrder(address(token2), orderPrice, address(token1), orderAmount);
        vm.stopPrank();
        
        // Test Trade event
        vm.startPrank(user2);
        token2.approve(address(exchange), orderPrice);
        exchange.depositToken(address(token2), orderPrice);
        
        vm.expectEmit(true, true, true, true);
        emit Trade(1, user2, address(token2), orderPrice, address(token1), orderAmount, user1, block.timestamp);
        exchange.fillOrder(1);
        vm.stopPrank();
    }
    
    // Events to test
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
    event Trade(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address creator, uint256 timestamp);
}