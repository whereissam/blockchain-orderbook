// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import "../contracts/Token.sol";

contract TokenTest is Test {
    Token public token;
    
    address public owner = address(this);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    
    function setUp() public {
        token = new Token("Test Token", "TEST", 1000000);
    }
    
    function test_InitialState() public {
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 1000000 * 10**18);
        assertEq(token.balanceOf(owner), 1000000 * 10**18);
    }
    
    function test_Transfer() public {
        uint256 amount = 1000 * 10**18;
        
        bool success = token.transfer(user1, amount);
        
        assertTrue(success);
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.balanceOf(owner), (1000000 * 10**18) - amount);
    }
    
    function test_Approve() public {
        uint256 amount = 1000 * 10**18;
        
        bool success = token.approve(user1, amount);
        
        assertTrue(success);
        assertEq(token.allowance(owner, user1), amount);
    }
    
    function test_TransferFrom() public {
        uint256 amount = 1000 * 10**18;
        
        // First approve
        token.approve(user1, amount);
        
        // Then transfer from
        vm.prank(user1);
        bool success = token.transferFrom(owner, user2, amount);
        
        assertTrue(success);
        assertEq(token.balanceOf(user2), amount);
        assertEq(token.balanceOf(owner), (1000000 * 10**18) - amount);
        assertEq(token.allowance(owner, user1), 0);
    }
    
    function test_RevertWhen_TransferInsufficientBalance() public {
        uint256 amount = 2000000 * 10**18; // More than total supply
        
        vm.expectRevert();
        token.transfer(user1, amount);
    }
    
    function test_RevertWhen_TransferFromInsufficientAllowance() public {
        uint256 amount = 1000 * 10**18;
        
        // Don't approve first
        vm.expectRevert();
        vm.prank(user1);
        token.transferFrom(owner, user2, amount);
    }
    
    function test_RevertWhen_TransferFromInsufficientBalance() public {
        uint256 amount = 2000000 * 10**18;
        
        // Approve more than balance
        token.approve(user1, amount);
        
        vm.expectRevert();
        vm.prank(user1);
        token.transferFrom(owner, user2, amount);
    }
    
    function test_TransferToZeroAddress() public {
        uint256 amount = 1000 * 10**18;
        
        vm.expectRevert();
        token.transfer(address(0), amount);
    }
    
    function test_ApproveZeroAddress() public {
        uint256 amount = 1000 * 10**18;
        
        vm.expectRevert();
        token.approve(address(0), amount);
    }
    
    function test_MultipleTransfers() public {
        uint256 amount1 = 1000 * 10**18;
        uint256 amount2 = 2000 * 10**18;
        
        // Transfer to user1
        token.transfer(user1, amount1);
        assertEq(token.balanceOf(user1), amount1);
        
        // Transfer from user1 to user2
        vm.prank(user1);
        token.transfer(user2, amount1);
        assertEq(token.balanceOf(user1), 0);
        assertEq(token.balanceOf(user2), amount1);
        
        // Transfer more to user1
        token.transfer(user1, amount2);
        assertEq(token.balanceOf(user1), amount2);
    }
    
    function test_Events() public {
        uint256 amount = 1000 * 10**18;
        
        // Test Transfer event
        vm.expectEmit(true, true, true, true);
        emit Transfer(owner, user1, amount);
        token.transfer(user1, amount);
        
        // Test Approval event
        vm.expectEmit(true, true, true, true);
        emit Approval(owner, user2, amount);
        token.approve(user2, amount);
        
        // Test TransferFrom event
        vm.expectEmit(true, true, true, true);
        emit Transfer(owner, user1, amount);
        vm.prank(user2);
        token.transferFrom(owner, user1, amount);
    }
    
    function test_PartialTransferFrom() public {
        uint256 approveAmount = 1000 * 10**18;
        uint256 transferAmount = 500 * 10**18;
        
        // Approve larger amount
        token.approve(user1, approveAmount);
        
        // Transfer partial amount
        vm.prank(user1);
        token.transferFrom(owner, user2, transferAmount);
        
        // Check remaining allowance
        assertEq(token.allowance(owner, user1), approveAmount - transferAmount);
        assertEq(token.balanceOf(user2), transferAmount);
    }
    
    function test_FuzzTransfer(uint256 amount) public {
        // Bound amount to reasonable range
        amount = bound(amount, 1, token.balanceOf(owner));
        
        uint256 initialBalance = token.balanceOf(owner);
        token.transfer(user1, amount);
        
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.balanceOf(owner), initialBalance - amount);
    }
    
    // Events to test
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}