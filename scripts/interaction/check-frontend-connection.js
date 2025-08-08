#!/usr/bin/env node

/**
 * Script to diagnose frontend connection issues with local blockchain
 */

import { readFileSync } from 'fs'
import { join } from 'path'

async function checkBlockchainConnection() {
  console.log('🔍 Checking Local Blockchain Connection...\n')
  
  try {
    const response = await fetch('http://127.0.0.1:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    })

    const data = await response.json()
    const chainId = parseInt(data.result, 16)
    
    console.log('✅ Blockchain Status:')
    console.log(`   Chain ID: ${chainId}`)
    console.log(`   RPC URL: http://127.0.0.1:8545`)
    
    if (chainId !== 31337) {
      console.log('⚠️  Warning: Expected Chain ID 31337 for local development')
    }
    
    return true
  } catch (error) {
    console.log('❌ Blockchain Connection Failed:')
    console.log(`   Error: ${error.message}`)
    console.log('   Solution: Run "npm run node:local" to start Anvil')
    return false
  }
}

async function checkContractDeployment() {
  console.log('\n🔍 Checking Contract Deployment...\n')
  
  try {
    const configPath = join(process.cwd(), 'src/config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf8'))
    
    if (!config['31337']) {
      console.log('❌ Local network (31337) not found in config.json')
      console.log('   Solution: Run deployment script')
      return false
    }
    
    const contracts = config['31337']
    console.log('✅ Contract Configuration:')
    console.log(`   SSS Token: ${contracts.SSS?.address || 'NOT FOUND'}`)
    console.log(`   mETH Token: ${contracts.mETH?.address || 'NOT FOUND'}`)
    console.log(`   mDAI Token: ${contracts.mDAI?.address || 'NOT FOUND'}`)
    console.log(`   Exchange: ${contracts.exchange?.address || 'NOT FOUND'}`)
    
    // Verify contracts have code
    for (const [name, contract] of Object.entries(contracts)) {
      if (contract.address) {
        try {
          const response = await fetch('http://127.0.0.1:8545', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getCode',
              params: [contract.address, 'latest'],
              id: 1,
            }),
          })
          
          const data = await response.json()
          if (data.result === '0x') {
            console.log(`❌ ${name} contract has no code at ${contract.address}`)
            return false
          } else {
            console.log(`✅ ${name} contract verified at ${contract.address}`)
          }
        } catch (error) {
          console.log(`❌ Failed to verify ${name} contract: ${error.message}`)
          return false
        }
      }
    }
    
    return true
  } catch (error) {
    console.log(`❌ Config Check Failed: ${error.message}`)
    return false
  }
}

async function checkTestData() {
  console.log('\n🔍 Checking Test Data...\n')
  
  try {
    const exchangeAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
    
    // Check if exchange has orders
    const response = await fetch('http://127.0.0.1:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: exchangeAddress,
          data: '0x0b98ba0f' // orderCount() function selector
        }, 'latest'],
        id: 1,
      }),
    })
    
    const data = await response.json()
    const orderCount = parseInt(data.result, 16)
    
    console.log('✅ Test Data Status:')
    console.log(`   Order Count: ${orderCount}`)
    
    if (orderCount === 0) {
      console.log('⚠️  No orders found. Run seeding script:')
      console.log('   PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 ETHERSCAN_API_KEY=dummy forge script script/Seed.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --skip-simulation')
      return false
    }
    
    return true
  } catch (error) {
    console.log(`❌ Test Data Check Failed: ${error.message}`)
    return false
  }
}

function showFrontendInstructions() {
  console.log('\n🌐 Frontend Connection Instructions:\n')
  console.log('1. Open MetaMask and add Custom Network:')
  console.log('   Network Name: Localhost 8545')
  console.log('   RPC URL: http://127.0.0.1:8545')
  console.log('   Chain ID: 31337')
  console.log('   Currency Symbol: ETH')
  console.log('')
  console.log('2. Import Test Account:')
  console.log('   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
  console.log('   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
  console.log('')
  console.log('3. Open Frontend:')
  console.log('   URL: http://localhost:3501 (or 3502)')
  console.log('')
  console.log('4. Connect wallet and start trading!')
}

function showTroubleshootingSteps() {
  console.log('\n🛠️  Troubleshooting Steps:\n')
  console.log('If frontend shows "Setup Required":')
  console.log('• Check MetaMask is connected to localhost network')
  console.log('• Verify account is imported and selected')
  console.log('• Refresh the page after network changes')
  console.log('• Check browser console for errors')
  console.log('')
  console.log('If balances show zero:')
  console.log('• Verify contracts are deployed to correct addresses')
  console.log('• Check MetaMask network matches Chain ID 31337')
  console.log('• Try switching accounts and back')
  console.log('')
  console.log('If transactions fail:')
  console.log('• Ensure sufficient ETH for gas (should have 10,000 ETH)')
  console.log('• Try resetting MetaMask account (Settings > Advanced > Reset Account)')
  console.log('• Check Anvil is still running in terminal')
}

async function main() {
  console.log('🚀 Frontend Connection Diagnostic Tool')
  console.log('=====================================\n')
  
  const blockchainOk = await checkBlockchainConnection()
  const contractsOk = await checkContractDeployment()
  const testDataOk = await checkTestData()
  
  console.log('\n📋 Summary:')
  console.log('===========')
  console.log(`Blockchain Connection: ${blockchainOk ? '✅' : '❌'}`)
  console.log(`Contract Deployment: ${contractsOk ? '✅' : '❌'}`)
  console.log(`Test Data: ${testDataOk ? '✅' : '❌'}`)
  
  if (blockchainOk && contractsOk && testDataOk) {
    console.log('\n🎉 All systems ready! Your local testnet is working properly.')
    showFrontendInstructions()
  } else {
    console.log('\n⚠️  Issues detected! Follow the solutions above to fix them.')
    showTroubleshootingSteps()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}