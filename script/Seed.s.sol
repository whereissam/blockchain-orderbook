// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import "../contracts/Token.sol";
import "../contracts/Exchange.sol";

contract SeedScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Local deployed addresses (from recent deployment)
        address sssTokenAddress = 0x5FbDB2315678afecb367f032d93F642f64180aa3;
        address methTokenAddress = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512;
        address mdaiTokenAddress = 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0;
        address exchangeAddress = 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9;
        
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