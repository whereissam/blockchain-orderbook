// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import "../contracts/Token.sol";
import "../contracts/Exchange.sol";

contract SeedScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Base Sepolia deployed addresses (from config.json)
        address sssTokenAddress = 0x4cC9e56C00a7b94424D94231bF5B603a32a0BF6D;
        address methTokenAddress = 0xe6f9D40767Db3D90ac878228ABf407C675de1ba5;
        address mdaiTokenAddress = 0xAD2A615a5121A79124e9704C259e7772721386a7;
        address exchangeAddress = 0x43d827e34D3e98F987075a469C513f8b8bA28a26;
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Seeding exchange with sample data...");
        
        Token sssToken = Token(sssTokenAddress);
        Token methToken = Token(methTokenAddress);
        Token mdaiToken = Token(mdaiTokenAddress);
        Exchange exchange = Exchange(exchangeAddress);
        
        // Transfer tokens to test users (using deployer as user for simplicity)
        console.log("Setting up test data...");
        
        uint256 amount = 10000 * 10**18; // 10,000 tokens
        
        // Approve exchange to spend tokens
        sssToken.approve(exchangeAddress, amount);
        methToken.approve(exchangeAddress, amount);
        mdaiToken.approve(exchangeAddress, amount);
        
        // Deposit tokens to exchange
        exchange.depositToken(address(sssToken), amount / 2);
        exchange.depositToken(address(methToken), amount / 2);
        exchange.depositToken(address(mdaiToken), amount / 2);
        
        // Create sample orders
        console.log("Creating sample orders...");
        
        // Create buy orders for SSS
        exchange.makeOrder(
            address(sssToken),   // tokenGet
            100 * 10**18,        // amountGet (100 SSS)
            address(methToken),  // tokenGive
            1 * 10**17           // amountGive (0.1 mETH)
        );
        
        exchange.makeOrder(
            address(sssToken),   // tokenGet  
            50 * 10**18,         // amountGet (50 SSS)
            address(methToken),  // tokenGive
            5 * 10**16           // amountGive (0.05 mETH)
        );
        
        vm.stopBroadcast();
        
        console.log("Exchange seeded successfully!");
    }
}