#!/usr/bin/env node

/**
 * Complete End-to-End Test of Local Testnet Setup
 * This script verifies that everything is working correctly
 */

import { ethers } from 'ethers'
import { readFileSync } from 'fs'
import { join } from 'path'

const TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
]

const EXCHANGE_ABI = [
  'function feeAccount() view returns (address)',
  'function feePercent() view returns (uint256)',
  'function orderCount() view returns (uint256)',
  'function tokens(address, address) view returns (uint256)',
  'function orders(uint256) view returns (tuple(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp))',
]

async function testCompleteSetup() {
  console.log('🧪 Complete Local Testnet Test')
  console.log('==============================\n')

  try {
    // 1. Connect to local blockchain
    console.log('1️⃣ Connecting to local blockchain...')
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
    
    const network = await provider.getNetwork()
    const blockNumber = await provider.getBlockNumber()
    
    console.log(`✅ Connected to Chain ID: ${network.chainId}`)
    console.log(`✅ Current Block: ${blockNumber}`)
    
    if (Number(network.chainId) !== 31337) {
      throw new Error(`Wrong network! Expected 31337, got ${network.chainId}`)
    }

    // 2. Load contract addresses
    console.log('\n2️⃣ Loading contract configuration...')
    const configPath = join(process.cwd(), 'src/config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf8'))
    const contracts = config['31337']
    
    if (!contracts) {
      throw new Error('Local network configuration not found in config.json')
    }
    
    console.log(`✅ SSS Token: ${contracts.SSS.address}`)
    console.log(`✅ mETH Token: ${contracts.mETH.address}`)
    console.log(`✅ mDAI Token: ${contracts.mDAI.address}`)
    console.log(`✅ Exchange: ${contracts.exchange.address}`)

    // 3. Test token contracts
    console.log('\n3️⃣ Testing token contracts...')
    
    const sssToken = new ethers.Contract(contracts.SSS.address, TOKEN_ABI, provider)
    const methToken = new ethers.Contract(contracts.mETH.address, TOKEN_ABI, provider)
    
    const sssName = await sssToken.name()
    const sssSymbol = await sssToken.symbol()
    const sssDecimals = await sssToken.decimals()
    
    const methName = await methToken.name()
    const methSymbol = await methToken.symbol()
    
    console.log(`✅ ${sssSymbol} (${sssName}) - ${sssDecimals} decimals`)
    console.log(`✅ ${methSymbol} (${methName})`)

    // 4. Test exchange contract
    console.log('\n4️⃣ Testing exchange contract...')
    
    const exchange = new ethers.Contract(contracts.exchange.address, EXCHANGE_ABI, provider)
    
    const feeAccount = await exchange.feeAccount()
    const feePercent = await exchange.feePercent()
    const orderCount = await exchange.orderCount()
    
    console.log(`✅ Fee Account: ${feeAccount}`)
    console.log(`✅ Fee Percent: ${feePercent}`)
    console.log(`✅ Order Count: ${orderCount}`)

    // 5. Test account balances
    console.log('\n5️⃣ Testing account balances...')
    
    const testAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    const ethBalance = await provider.getBalance(testAccount)
    const sssBalance = await sssToken.balanceOf(testAccount)
    const methBalance = await methToken.balanceOf(testAccount)
    
    console.log(`✅ ETH Balance: ${ethers.formatEther(ethBalance)} ETH`)
    console.log(`✅ SSS Balance: ${ethers.formatUnits(sssBalance, 18)} SSS`)
    console.log(`✅ mETH Balance: ${ethers.formatUnits(methBalance, 18)} mETH`)

    // 6. Test exchange balances
    console.log('\n6️⃣ Testing exchange balances...')
    
    const sssExchangeBalance = await exchange.tokens(contracts.SSS.address, testAccount)
    const methExchangeBalance = await exchange.tokens(contracts.mETH.address, testAccount)
    
    console.log(`✅ SSS on Exchange: ${ethers.formatUnits(sssExchangeBalance, 18)} SSS`)
    console.log(`✅ mETH on Exchange: ${ethers.formatUnits(methExchangeBalance, 18)} mETH`)

    // 7. Test orders
    console.log('\n7️⃣ Testing orders...')
    
    if (orderCount > 0) {
      for (let i = 1; i <= Math.min(Number(orderCount), 3); i++) {
        try {
          const order = await exchange.orders(i)
          console.log(`✅ Order ${i}: ${ethers.formatUnits(order.amountGet, 18)} tokens for ${ethers.formatUnits(order.amountGive, 18)} tokens`)
        } catch (error) {
          console.log(`⚠️ Could not read order ${i}: ${error.message}`)
        }
      }
    } else {
      console.log('⚠️ No orders found. You may need to run the seed script.')
    }

    // 8. Summary
    console.log('\n🎉 Test Summary')
    console.log('===============')
    console.log('✅ Blockchain connection: Working')
    console.log('✅ Contract deployment: Successful')
    console.log('✅ Token contracts: Functional')
    console.log('✅ Exchange contract: Functional')
    console.log('✅ Account balances: Available')
    console.log('✅ Exchange balances: Available')
    console.log(`✅ Order system: ${orderCount > 0 ? 'Has orders' : 'Ready for orders'}`)
    
    console.log('\n🚀 Ready for Frontend Testing!')
    console.log('==============================')
    console.log('1. Open http://localhost:3502 in your browser')
    console.log('2. Connect MetaMask to localhost:8545 (Chain ID: 31337)')
    console.log('3. Import account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
    console.log('4. Click "Localhost Development" button')
    console.log('5. Start trading!')
    
    return true

  } catch (error) {
    console.error('\n❌ Test Failed!')
    console.error('================')
    console.error(`Error: ${error.message}`)
    console.error('\nTroubleshooting:')
    console.error('• Ensure Anvil is running: npm run node:local')
    console.error('• Ensure contracts are deployed: run deployment script')
    console.error('• Check that you are using the correct addresses')
    
    return false
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCompleteSetup()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('Test script error:', error)
      process.exit(1)
    })
}

export default testCompleteSetup