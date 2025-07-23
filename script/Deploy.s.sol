// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import "../contracts/Token.sol";
import "../contracts/Exchange.sol";

contract DeployScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Token contracts
        console.log("\nDeploying Token contracts...");
        
        // Deploy SSS Token
        Token sssToken = new Token(
            "Super Sonic Speed Token",
            "SSS", 
            1000000000 // 1 billion tokens
        );
        console.log("SSS Token deployed to:", address(sssToken));
        
        // Deploy mETH Token  
        Token methToken = new Token(
            "Mock Ethereum",
            "mETH",
            1000000000 // 1 billion tokens
        );
        console.log("mETH Token deployed to:", address(methToken));
        
        // Deploy mDAI Token
        Token mdaiToken = new Token(
            "Mock DAI",
            "mDAI", 
            1000000000 // 1 billion tokens
        );
        console.log("mDAI Token deployed to:", address(mdaiToken));
        
        // Deploy Exchange contract
        console.log("\nDeploying Exchange contract...");
        
        address feeAccount = deployer; // Use deployer as fee account
        uint256 feePercent = 10; // 1% fee (10/1000)
        
        Exchange exchange = new Exchange(feeAccount, feePercent);
        console.log("Exchange deployed to:", address(exchange));
        
        vm.stopBroadcast();
        
        // Log deployment summary
        console.log("\nDeployment Summary:");
        console.log("====================");
        console.log("SSS Token:", address(sssToken));
        console.log("mETH Token:", address(methToken));
        console.log("mDAI Token:", address(mdaiToken));
        console.log("Exchange:", address(exchange));
        console.log("Deployer:", deployer);
        
        console.log("\nTo update the frontend config, add these addresses to src/config.json:");
        console.log('  "', vm.toString(block.chainid), '": {');
        console.log('    "exchange": { "address": "', vm.toString(address(exchange)), '" },');
        console.log('    "SSS": { "address": "', vm.toString(address(sssToken)), '" },');
        console.log('    "mETH": { "address": "', vm.toString(address(methToken)), '" },');
        console.log('    "mDAI": { "address": "', vm.toString(address(mdaiToken)), '" },');
        console.log('    "explorerURL": "', getExplorerURL(), '"');
        console.log('  }');
    }
    
    function getExplorerURL() internal view returns (string memory) {
        uint256 chainId = block.chainid;
        if (chainId == 84532) {
            return "https://sepolia.basescan.org/";
        } else if (chainId == 11155111) {
            return "https://sepolia.etherscan.io/";
        } else if (chainId == 5) {
            return "https://goerli.etherscan.io/";
        } else {
            return "#";
        }
    }
}