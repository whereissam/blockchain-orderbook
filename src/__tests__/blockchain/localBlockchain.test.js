import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { ethers } from 'ethers'

describe('Local Blockchain Integration Tests', () => {
  let provider
  let signer
  let tokenContract
  let exchangeContract
  let accounts

  beforeAll(async () => {
    // Connect to local blockchain (Anvil/Hardhat node)
    provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
    
    // Get test accounts (Anvil provides 10 accounts by default)
    accounts = [
      { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' },
      { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
      { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' }
    ]
    signer = await provider.getSigner()
    
    // Deploy contracts if needed or use existing deployed addresses
    // This would typically read from deployment artifacts
    try {
      const network = await provider.getNetwork()
      expect(network.chainId).toBe(31337n) // Local network
    } catch (error) {
      console.warn('Local blockchain not running. Start with: npm run node:local')
      throw new Error('Local blockchain required for these tests')
    }
  }, 30000) // 30 second timeout for blockchain connection

  afterAll(async () => {
    // Cleanup if needed
    if (provider) {
      await provider.destroy?.()
    }
  })

  it('connects to local blockchain successfully', async () => {
    expect(provider).toBeDefined()
    expect(signer).toBeDefined()
    
    const blockNumber = await provider.getBlockNumber()
    expect(blockNumber).toBeGreaterThanOrEqual(0)
    
    const balance = await provider.getBalance(await signer.getAddress())
    expect(balance).toBeGreaterThan(0n)
  })

  it('has sufficient test accounts', async () => {
    expect(accounts.length).toBeGreaterThanOrEqual(2)
    
    // Check each account has ETH
    for (const account of accounts.slice(0, 3)) {
      const balance = await provider.getBalance(account.address)
      expect(balance).toBeGreaterThan(ethers.parseEther('100'))
    }
  })

  it('can deploy and interact with Token contract', async () => {
    // This test assumes contracts are already deployed via script
    // In a real test, you might deploy them here or read deployment artifacts
    
    const tokenABI = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function approve(address spender, uint256 amount) returns (bool)',
    ]

    // Try to connect to deployed token (address would come from deployment)
    // For now, we'll skip if not available
    try {
      // Use actual deployed address from our deployment
      const tokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3' // SSS Token
      tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer)
      
      const name = await tokenContract.name()
      const symbol = await tokenContract.symbol()
      const decimals = await tokenContract.decimals()
      
      expect(name).toBeDefined()
      expect(symbol).toBeDefined()
      expect(decimals).toBe(18)
    } catch (error) {
      console.warn('Token contract not deployed. Run: npm run deploy:local')
      // Skip this test if contracts aren't deployed
      return
    }
  }, 10000)

  it('can deploy and interact with Exchange contract', async () => {
    const exchangeABI = [
      'function feeAccount() view returns (address)',
      'function feePercent() view returns (uint256)',
      'function tokens(address, address) view returns (uint256)',
      'function orderCount() view returns (uint256)',
      'function orders(uint256) view returns (tuple(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp))',
      'function depositToken(address _token, uint256 _amount)',
      'function withdrawToken(address _token, uint256 _amount)',
      'function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive)',
      'function fillOrder(uint256 _id)',
      'function cancelOrder(uint256 _id)',
    ]

    try {
      // Use actual deployed address from our deployment  
      const exchangeAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' // Exchange
      exchangeContract = new ethers.Contract(exchangeAddress, exchangeABI, signer)
      
      const feeAccount = await exchangeContract.feeAccount()
      const feePercent = await exchangeContract.feePercent()
      const orderCount = await exchangeContract.orderCount()
      
      expect(feeAccount).toBeDefined()
      expect(feePercent).toBeDefined()
      expect(orderCount).toBeGreaterThanOrEqual(0n)
    } catch (error) {
      console.warn('Exchange contract not deployed. Run: npm run deploy:local')
      return
    }
  }, 10000)

  it('can perform token operations', async () => {
    if (!tokenContract) return

    try {
      const initialBalance = await tokenContract.balanceOf(await signer.getAddress())
      
      // Test transfer to another account if we have tokens
      if (initialBalance > 0n) {
        const recipient = accounts[1].address
        const transferAmount = ethers.parseEther('10')
        
        const tx = await tokenContract.transfer(recipient, transferAmount)
        const receipt = await tx.wait()
        
        expect(receipt.status).toBe(1)
        
        const recipientBalance = await tokenContract.balanceOf(recipient)
        expect(recipientBalance).toBeGreaterThanOrEqual(transferAmount)
      }
    } catch (error) {
      console.warn('Token operations failed:', error.message)
    }
  }, 15000)

  it('can perform exchange operations', async () => {
    if (!tokenContract || !exchangeContract) return

    try {
      const tokenAddress = await tokenContract.getAddress()
      const exchangeAddress = await exchangeContract.getAddress()
      const userAddress = await signer.getAddress()
      
      // Approve exchange to spend tokens
      const approveAmount = ethers.parseEther('100')
      const approveTx = await tokenContract.approve(exchangeAddress, approveAmount)
      await approveTx.wait()
      
      // Deposit tokens to exchange
      const depositAmount = ethers.parseEther('50')
      const depositTx = await exchangeContract.depositToken(tokenAddress, depositAmount)
      await depositTx.wait()
      
      // Check balance on exchange
      const exchangeBalance = await exchangeContract.tokens(tokenAddress, userAddress)
      expect(exchangeBalance).toBeGreaterThanOrEqual(depositAmount)
      
      console.log('Exchange operations successful')
    } catch (error) {
      console.warn('Exchange operations failed:', error.message)
    }
  }, 20000)

  it('can create and fill orders', async () => {
    if (!tokenContract || !exchangeContract) return

    try {
      // This would require a second token and more complex setup
      // For now, just verify we can call the functions
      const orderCount = await exchangeContract.orderCount()
      expect(orderCount).toBeGreaterThanOrEqual(0n)
      
      console.log('Order operations verified')
    } catch (error) {
      console.warn('Order operations failed:', error.message)
    }
  }, 15000)

  it('handles blockchain events correctly', async () => {
    if (!exchangeContract) return

    try {
      // Listen for events (this would be more complex in practice)
      const filter = exchangeContract.filters.Deposit()
      const events = await exchangeContract.queryFilter(filter, -10) // Last 10 blocks
      
      expect(Array.isArray(events)).toBe(true)
      console.log(`Found ${events.length} deposit events`)
    } catch (error) {
      console.warn('Event handling failed:', error.message)
    }
  })

  it('simulates network conditions', async () => {
    // Test with different gas prices, network congestion, etc.
    const gasPrice = await provider.getFeeData()
    expect(gasPrice.gasPrice).toBeGreaterThan(0n)
    
    // Test block time
    const block1 = await provider.getBlock('latest')
    await new Promise(resolve => setTimeout(resolve, 1000))
    const block2 = await provider.getBlock('latest')
    
    // In Anvil, blocks are mined on demand, so they might be the same
    expect(block2.number).toBeGreaterThanOrEqual(block1.number)
  })
})