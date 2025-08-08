#!/usr/bin/env node

import { ethers } from 'ethers'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load config and ABIs
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/config.json'), 'utf8'))
const TOKEN_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/abis/Token.json'), 'utf8'))
const EXCHANGE_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/abis/Exchange.json'), 'utf8'))

async function testContracts() {
  console.log('🧪 Testing Blockchain Contracts...\n')
  
  try {
    // Connect to Local Network
    const chainId = '31337'
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
    
    console.log('📡 Connected to Local Network (Anvil)')
    console.log(`Block Number: ${await provider.getBlockNumber()}\n`)

    // Test network config
    const networkConfig = config[chainId]
    if (!networkConfig) {
      throw new Error(`No config found for chain ID ${chainId}`)
    }
    
    console.log('⚙️  Network Configuration:')
    console.log(`Exchange: ${networkConfig.exchange.address}`)
    console.log(`SSS Token: ${networkConfig.SSS.address}`)
    console.log(`mETH Token: ${networkConfig.mETH.address}\n`)

    // Test Token Contracts
    console.log('🪙 Testing Token Contracts...')
    
    const sssContract = new ethers.Contract(networkConfig.SSS.address, TOKEN_ABI, provider)
    const methContract = new ethers.Contract(networkConfig.mETH.address, TOKEN_ABI, provider)
    
    try {
      const sssSymbol = await sssContract.symbol()
      const sssName = await sssContract.name()
      const sssDecimals = await sssContract.decimals()
      console.log(`✅ SSS Token: ${sssName} (${sssSymbol}) - ${sssDecimals} decimals`)
    } catch (error) {
      console.log(`❌ SSS Token failed: ${error.message}`)
    }
    
    try {
      const methSymbol = await methContract.symbol()
      const methName = await methContract.name()
      const methDecimals = await methContract.decimals()
      console.log(`✅ mETH Token: ${methName} (${methSymbol}) - ${methDecimals} decimals`)
    } catch (error) {
      console.log(`❌ mETH Token failed: ${error.message}`)
    }

    // Test Exchange Contract
    console.log('\n🏪 Testing Exchange Contract...')
    
    const exchangeContract = new ethers.Contract(networkConfig.exchange.address, EXCHANGE_ABI, provider)
    
    try {
      const feeAccount = await exchangeContract.feeAccount()
      const feePercent = await exchangeContract.feePercent()
      console.log(`✅ Exchange: Fee Account: ${feeAccount}, Fee: ${feePercent}%`)
    } catch (error) {
      console.log(`❌ Exchange failed: ${error.message}`)
    }

    // Test balanceOf function specifically
    console.log('\n💰 Testing balanceOf functions...')
    
    const testAddress = '0x0000000000000000000000000000000000000001'
    
    try {
      const sssBalance = await sssContract.balanceOf(testAddress)
      console.log(`✅ SSS balanceOf works: ${ethers.formatEther(sssBalance)} SSS`)
    } catch (error) {
      console.log(`❌ SSS balanceOf failed: ${error.message}`)
    }
    
    try {
      const exchangeBalance = await exchangeContract.balanceOf(networkConfig.SSS.address, testAddress)
      console.log(`✅ Exchange balanceOf works: ${ethers.formatEther(exchangeBalance)} SSS`)
    } catch (error) {
      console.log(`❌ Exchange balanceOf failed: ${error.message}`)
    }

    // Test recent events (minimal range to avoid rate limiting)
    console.log('\n📋 Testing recent events (last 10 blocks)...')
    
    try {
      const currentBlock = await provider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - 10)
      
      console.log(`Checking blocks ${fromBlock} to ${currentBlock}`)
      
      const orderEvents = await exchangeContract.queryFilter('Order', fromBlock, currentBlock)
      console.log(`✅ Found ${orderEvents.length} Order events`)
      
      if (orderEvents.length > 0) {
        const event = orderEvents[0]
        console.log(`   Latest order: ID ${event.args.id}, User: ${event.args.user.slice(0, 10)}...`)
      }
    } catch (error) {
      console.log(`❌ Events query failed: ${error.message}`)
      if (error.message.includes('rate limit')) {
        console.log('   ⚠️  This is expected - rate limiting from RPC provider')
      }
    }

    console.log('\n✨ Contract test completed!')
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testContracts()