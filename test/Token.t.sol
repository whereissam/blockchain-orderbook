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
}