#!/usr/bin/env node

/**
 * Setup script for testing environment
 * This script helps set up a local blockchain with test data for comprehensive testing
 */

import { spawn } from 'child_process'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

const LOG_FILE = join(process.cwd(), 'test-setup.log')

function log(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  console.log(message)
  writeFileSync(LOG_FILE, logMessage, { flag: 'a' })
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    log(`Running: ${command} ${args.join(' ')}`)
    
    const child = spawn(command, args, {
      stdio: 'pipe',
      ...options
    })
    
    let stdout = ''
    let stderr = ''
    
    child.stdout?.on('data', (data) => {
      stdout += data.toString()
      if (options.verbose) {
        process.stdout.write(data)
      }
    })
    
    child.stderr?.on('data', (data) => {
      stderr += data.toString()
      if (options.verbose) {
        process.stderr.write(data)
      }
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`))
      }
    })
    
    child.on('error', reject)
  })
}

async function checkPrerequisites() {
  log('Checking prerequisites...')
  
  try {
    await runCommand('node', ['--version'])
    log('✓ Node.js is available')
  } catch (error) {
    throw new Error('Node.js is required but not found')
  }
  
  try {
    await runCommand('npm', ['--version'])
    log('✓ npm is available')
  } catch (error) {
    throw new Error('npm is required but not found')
  }
  
  // Check if forge is available for contract operations
  try {
    await runCommand('forge', ['--version'])
    log('✓ Foundry forge is available')
  } catch (error) {
    log('⚠ Foundry forge not found. Some contract tests may be limited.')
  }
}

async function installDependencies() {
  log('Installing dependencies...')
  
  try {
    await runCommand('npm', ['install'], { verbose: false })
    log('✓ Dependencies installed')
  } catch (error) {
    throw new Error(`Failed to install dependencies: ${error.message}`)
  }
}

async function startLocalBlockchain() {
  log('Starting local blockchain...')
  
  return new Promise((resolve, reject) => {
    // Try Anvil first, then Hardhat as fallback
    const anvilProcess = spawn('anvil', [
      '--host', '127.0.0.1',
      '--port', '8545',
      '--accounts', '10',
      '--balance', '10000',
      '--gas-limit', '30000000',
      '--code-size-limit', '50000',
      '--gas-price', '1000000000'
    ], {
      stdio: 'pipe',
      detached: true
    })
    
    let started = false
    
    anvilProcess.stdout.on('data', (data) => {
      const output = data.toString()
      if (output.includes('Listening on') && !started) {
        started = true
        log('✓ Anvil blockchain started on http://127.0.0.1:8545')
        
        // Save PID for cleanup
        writeFileSync('.anvil.pid', anvilProcess.pid.toString())
        
        // Give it a moment to fully start
        setTimeout(() => resolve(anvilProcess), 2000)
      }
    })
    
    anvilProcess.stderr.on('data', (data) => {
      const error = data.toString()
      if (error.includes('Error') && !started) {
        log('Anvil failed, trying Hardhat node...')
        startHardhatNode().then(resolve).catch(reject)
      }
    })
    
    anvilProcess.on('error', (error) => {
      if (!started) {
        log('Anvil not available, trying Hardhat node...')
        startHardhatNode().then(resolve).catch(reject)
      }
    })
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!started) {
        anvilProcess.kill()
        reject(new Error('Failed to start local blockchain'))
      }
    }, 10000)
  })
}

async function startHardhatNode() {
  return new Promise((resolve, reject) => {
    const hardhatProcess = spawn('npx', ['hardhat', 'node'], {
      stdio: 'pipe',
      detached: true
    })
    
    let started = false
    
    hardhatProcess.stdout.on('data', (data) => {
      const output = data.toString()
      if (output.includes('Started HTTP and WebSocket JSON-RPC server') && !started) {
        started = true
        log('✓ Hardhat node started on http://127.0.0.1:8545')
        
        // Save PID for cleanup
        writeFileSync('.hardhat.pid', hardhatProcess.pid.toString())
        
        setTimeout(() => resolve(hardhatProcess), 2000)
      }
    })
    
    hardhatProcess.on('error', reject)
    
    setTimeout(() => {
      if (!started) {
        hardhatProcess.kill()
        reject(new Error('Failed to start Hardhat node'))
      }
    }, 15000)
  })
}

async function deployContracts() {
  log('Deploying contracts to local blockchain...')
  
  try {
    // Try Forge deployment first
    await runCommand('npm', ['run', 'deploy:local'], { verbose: true })
    log('✓ Contracts deployed via Forge')
  } catch (forgeError) {
    try {
      // Fallback to Hardhat deployment
      await runCommand('npm', ['run', 'hardhat:deploy:local'], { verbose: true })
      log('✓ Contracts deployed via Hardhat')
    } catch (hardhatError) {
      throw new Error(`Failed to deploy contracts: ${forgeError.message}`)
    }
  }
}

async function seedTestData() {
  log('Seeding test data...')
  
  try {
    await runCommand('npm', ['run', 'seed:local'], { verbose: true })
    log('✓ Test data seeded')
  } catch (forgeError) {
    try {
      await runCommand('npm', ['run', 'hardhat:seed:local'], { verbose: true })
      log('✓ Test data seeded via Hardhat')
    } catch (hardhatError) {
      log('⚠ Failed to seed test data. Tests may have limited functionality.')
    }
  }
}

async function runTests() {
  log('Running test suite...')
  
  try {
    await runCommand('npm', ['test'], { verbose: true })
    log('✓ All tests completed')
  } catch (error) {
    log(`⚠ Some tests failed: ${error.message}`)
    // Don't throw here as we want to show the cleanup instructions
  }
}

function createCleanupScript() {
  const cleanupScript = `#!/usr/bin/env node

import { readFileSync, unlinkSync, existsSync } from 'fs'

function cleanup() {
  console.log('Cleaning up test environment...')
  
  // Kill Anvil process if running
  if (existsSync('.anvil.pid')) {
    try {
      const pid = readFileSync('.anvil.pid', 'utf8').trim()
      process.kill(parseInt(pid), 'SIGTERM')
      unlinkSync('.anvil.pid')
      console.log('✓ Anvil process terminated')
    } catch (error) {
      console.log('⚠ Could not terminate Anvil process')
    }
  }
  
  // Kill Hardhat process if running
  if (existsSync('.hardhat.pid')) {
    try {
      const pid = readFileSync('.hardhat.pid', 'utf8').trim()
      process.kill(parseInt(pid), 'SIGTERM')
      unlinkSync('.hardhat.pid')
      console.log('✓ Hardhat process terminated')
    } catch (error) {
      console.log('⚠ Could not terminate Hardhat process')
    }
  }
  
  // Clean up log file
  if (existsSync('test-setup.log')) {
    unlinkSync('test-setup.log')
  }
  
  console.log('✓ Cleanup completed')
}

cleanup()
`
  
  writeFileSync('scripts/cleanup-test-env.js', cleanupScript)
  log('✓ Cleanup script created')
}

async function main() {
  console.log('🚀 Setting up blockchain orderbook testing environment...\n')
  
  try {
    await checkPrerequisites()
    await installDependencies()
    
    const blockchainProcess = await startLocalBlockchain()
    
    // Wait a bit for blockchain to be ready
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    await deployContracts()
    await seedTestData()
    
    createCleanupScript()
    
    log('\n✅ Test environment setup completed!')
    log('\nNext steps:')
    log('  • Run tests: npm test')
    log('  • Run specific test suite: npm test -- components')
    log('  • Run integration tests: npm test -- integration')
    log('  • Run blockchain tests: npm test -- blockchain')
    log('  • Clean up: node scripts/cleanup-test-env.js')
    log('\nLocal blockchain is running on http://127.0.0.1:8545')
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`)
    process.exit(1)
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  log('Received SIGINT, cleaning up...')
  if (existsSync('scripts/cleanup-test-env.js')) {
    runCommand('node', ['scripts/cleanup-test-env.js']).then(() => {
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
})

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}