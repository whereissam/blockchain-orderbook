import { ethers, formatUnits } from 'ethers'
import TOKEN_JSON from '../abis/Token.json'
import EXCHANGE_JSON from '../abis/Exchange.json'

// Handle different JSON structures - some have .abi property, others are direct arrays
const TOKEN_ABI = TOKEN_JSON.abi || TOKEN_JSON
const EXCHANGE_ABI = EXCHANGE_JSON.abi || EXCHANGE_JSON
import useProviderStore from './providerStore'
import useTokensStore from './tokensStore'
import useExchangeStore from './exchangeStore'

//1. Load provider(Login wallet) - get the connection info
export const loadProvider = async () => {
  if (!window.ethereum) {
    console.log('MetaMask not detected')
    return null
  }
  
  const connection = new ethers.BrowserProvider(window.ethereum)
  
  try {
    // Get the current network to determine which provider to use
    const network = await connection.getNetwork()
    const chainId = Number(network.chainId)
    
    // Only use Alchemy for Base Sepolia, use MetaMask directly for other networks
    if (chainId === 84532) { // Base Sepolia
      const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY
      const ALCHEMY_RPC_URL = ALCHEMY_API_KEY 
        ? `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
        : 'https://sepolia.base.org' // Fallback to public RPC
      const alchemyProvider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL)
      
      // Create a hybrid provider: use MetaMask for signing, Alchemy for reading
      connection._getProvider = () => alchemyProvider._getProvider()
      connection.getBlockNumber = () => alchemyProvider.getBlockNumber()
      connection.getBlock = (block) => alchemyProvider.getBlock(block)
      connection.queryFilter = (filter, fromBlock, toBlock) => alchemyProvider.queryFilter(filter, fromBlock, toBlock)
      connection.getCode = (address) => alchemyProvider.getCode(address)
      connection.call = (transaction) => alchemyProvider.call(transaction)
      
      console.log('Using Alchemy provider for Base Sepolia')
    } else if (chainId === 31337) { // Localhost
      console.log('Using MetaMask provider for localhost development')
      // Use MetaMask directly for localhost - no modifications needed
    } else {
      console.log(`Using MetaMask provider for network ${chainId}`)
      // Use MetaMask directly for other networks
    }
  } catch (error) {
    console.log('Could not determine network, using MetaMask provider directly:', error)
  }
  
  useProviderStore.getState().loadProvider(connection)
  return connection
}

//2. Load provider network(Login wallet) - get the network info
export const loadNetwork = async (provider) => {
  const { chainId } = await provider.getNetwork()
  console.log(chainId)
  // Convert BigInt to number for serialization
  const chainIdNumber = Number(chainId)
  useProviderStore.getState().loadNetwork(chainIdNumber)
  return chainIdNumber
}

//3. Load provider account(Login wallet) - get the account info & balance
export const loadAccount = async (provider, forceConnect = false) => {
  try {
    // First try to get existing accounts without requesting permission
    let accounts = await window.ethereum.request({ method: 'eth_accounts' })
    
    // Only request permission if explicitly forced (like when user clicks connect)
    if (accounts.length === 0 && forceConnect) {
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    }

    if (accounts.length === 0) {
      console.log('No accounts available')
      return null
    }

    const account = ethers.getAddress(accounts[0])
    useProviderStore.getState().loadAccount(account)

    // Get balance with retry logic for rate limiting
    let balance
    try {
      const getBalanceWithRetry = async (maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            return await provider.getBalance(account)
          } catch (error) {
            if (error.message.includes('rate limit') && i < maxRetries - 1) {
              console.log(`📊 Rate limited getting balance, retrying in ${(i + 1) * 2} seconds...`)
              await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000))
              continue
            }
            throw error
          }
        }
      }
      
      balance = await getBalanceWithRetry()
      balance = ethers.formatEther(balance)
      useProviderStore.getState().loadEtherBalance(balance)
    } catch (balanceError) {
      console.warn('⚠️ Could not get balance due to rate limiting, using 0.0')
      balance = '0.0'
      useProviderStore.getState().loadEtherBalance(balance)
    }

    return account
  } catch (error) {
    console.error('Failed to load account:', error)
    return null
  }
}

// Connect wallet and load balances
export const connectWalletAndLoadBalances = async (provider, exchange) => {
  try {
    const account = await loadAccount(provider, true)
    if (account && exchange) {
      const tokensStore = useTokensStore.getState()
      if (tokensStore.contracts && tokensStore.contracts.length >= 2) {
        await loadBalances(exchange, tokensStore.contracts, account)
      }
    }
    return account
  } catch (error) {
    console.error('Failed to connect wallet and load balances:', error)
    throw error
  }
}

//4. Load provider token(have two tokens)(Login wallet) - get the two tokens
export const loadToken = async (provider, addresses) => {
  let token1, token2, symbol1, symbol2
  let successCount = 0

  console.log('🔍 Loading tokens with addresses:', addresses)
  console.log('🔍 Provider details:', {
    hasProvider: !!provider,
    providerType: provider?.constructor?.name,
    chainId: await provider?.getNetwork().then(n => n.chainId).catch(() => 'unknown')
  })
  console.log('🔍 TOKEN_ABI available:', !!TOKEN_ABI, 'length:', TOKEN_ABI?.length)

  // Test provider connection first
  try {
    const network = await provider.getNetwork()
    console.log('🔍 Network info:', { chainId: network.chainId, name: network.name })
  } catch (error) {
    console.error('❌ Provider network check failed:', error)
    return null
  }

  // Token 1
  try {
    console.log('🔍 Creating contract for token 1 at:', addresses[0])
    token1 = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
    console.log('🔍 Contract created, calling symbol()...')
    
    // Test if contract exists by calling a simple function
    const code = await provider.getCode(addresses[0])
    if (code === '0x') {
      throw new Error(`No contract deployed at address ${addresses[0]}`)
    }
    console.log('🔍 Contract code exists, length:', code.length)
    
    symbol1 = await token1.symbol()
    console.log('✅ Token 1 loaded successfully:', symbol1, token1.target)
    // Ensure the contract has an address property for compatibility
    token1.address = token1.target
    useTokensStore.getState().loadToken1(token1, symbol1)
    successCount++
  } catch (error) {
    console.error('❌ Error loading token 1 at address', addresses[0], ':', error.message)
    console.error('❌ Full error:', error)
    useTokensStore.getState().loadToken1(null, 'ERROR')
  }

  // Token 2
  try {
    console.log('🔍 Creating contract for token 2 at:', addresses[1])
    token2 = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
    
    // Test if contract exists
    const code = await provider.getCode(addresses[1])
    if (code === '0x') {
      throw new Error(`No contract deployed at address ${addresses[1]}`)
    }
    console.log('🔍 Contract code exists, length:', code.length)
    
    symbol2 = await token2.symbol()
    console.log('✅ Token 2 loaded successfully:', symbol2, token2.target)
    // Ensure the contract has an address property for compatibility
    token2.address = token2.target
    useTokensStore.getState().loadToken2(token2, symbol2)
    successCount++
  } catch (error) {
    console.error('❌ Error loading token 2 at address', addresses[1], ':', error.message)
    console.error('❌ Full error:', error)
    useTokensStore.getState().loadToken2(null, 'ERROR')
  }

  // Debug: Check if tokens are stored
  const tokensState = useTokensStore.getState()
  console.log('🔍 Final tokens state:', {
    loaded: tokensState.loaded,
    contracts: tokensState.contracts.length,
    symbols: tokensState.symbols,
    contractAddresses: tokensState.contracts.map(c => c?.target || c?.address || 'null'),
    contractDetails: tokensState.contracts.map(c => ({
      hasContract: !!c,
      target: c?.target,
      address: c?.address,
      type: typeof c,
      constructor: c?.constructor?.name
    })),
    successCount
  })

  if (successCount === 0) {
    console.error('❌ No tokens loaded successfully!')
    console.error('❌ No contracts found at the configured addresses. Check your network and contract deployments.')
    alert('No contracts found at the configured addresses. Check your network and contract deployments.')
  }

  return successCount > 0 ? (token2 || token1) : null
}

// 5. load provider exchange (Login wallet) - get the exchange 
export const loadExchange = async (provider, address) => {
  try {
    console.log('🔍 Creating exchange contract at:', address)
    
    // Test if contract exists
    const code = await provider.getCode(address)
    if (code === '0x') {
      throw new Error(`No contract deployed at exchange address ${address}`)
    }
    console.log('🔍 Exchange contract code exists, length:', code.length)
    
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
    
    // Ensure compatibility with legacy .address property
    exchange.address = exchange.target
    
    // Test if the contract has required methods
    if (typeof exchange.balanceOf !== 'function') {
      console.error('❌ Exchange contract missing balanceOf method')
      throw new Error('Exchange contract does not have balanceOf method')
    }
    
    // Test actual method calls to verify contract is working
    console.log('🔍 Testing exchange contract methods...')
    try {
      // Test balanceOf method with a dummy call
      const testBalance = await exchange.balanceOf('0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000')
      console.log('✅ balanceOf test call succeeded:', testBalance.toString())
    } catch (testError) {
      console.error('❌ balanceOf test call failed:', testError.message)
    }
    
    console.log('✅ Exchange contract loaded with methods:', {
      hasBalanceOf: typeof exchange.balanceOf,
      hasDepositToken: typeof exchange.depositToken,
      hasWithdrawToken: typeof exchange.withdrawToken,
      hasOrderFilled: typeof exchange.orderFilled,
      hasOrderCancelled: typeof exchange.orderCancelled,
      address: exchange.target,
      interface: exchange.interface ? 'Available' : 'Missing'
    })
    
    useExchangeStore.getState().loadExchange(exchange)
    return exchange
  } catch (error) {
    console.error('❌ Error loading exchange:', error)
    console.error('❌ Failed to load exchange contract:', error.message)
    alert(`Failed to load exchange contract: ${error.message}`)
    return null
  }
}

export const subscribeToEvents = (exchange) => {
  const exchangeStore = useExchangeStore.getState()

  exchange.on('Cancel', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
    const order = event.args
    exchangeStore.cancelOrderSuccess(order, event)
  })

  exchange.on('Trade', (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timestamp, event) => {
    const order = event.args
    console.log('trade', order)
    exchangeStore.fillOrderSuccess(order, event)
  })

  exchange.on('Deposit', (token, user, amount, balance, event) => {
    exchangeStore.transferSuccess(event)
  })

  exchange.on('Withdraw', (token, user, amount, balance, event) => {
    exchangeStore.transferSuccess(event)
  })

  exchange.on('OrderCreated', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
    const order = event.args
    exchangeStore.newOrderSuccess(order, event)
  })
}

//Load user balances ( wallet & exchange balances)
export const loadBalances = async (exchange, tokens, account) => {
  try {
    const tokensStore = useTokensStore.getState()
    const exchangeStore = useExchangeStore.getState()

    // Check if all parameters are valid
    console.log('loadBalances called with:', {
      exchange: !!exchange,
      hasBalanceOf: exchange ? typeof exchange.balanceOf : 'N/A',
      tokens: tokens ? tokens.map(t => ({ address: t?.address, hasBalanceOf: t ? typeof t.balanceOf : 'N/A' })) : null,
      account
    })

    if (!exchange || !tokens || !tokens[0] || !tokens[1] || !account || 
        tokens[0] === null || tokens[1] === null || 
        typeof exchange.balanceOf !== 'function' ||
        typeof tokens[0].balanceOf !== 'function' ||
        typeof tokens[1].balanceOf !== 'function') {
      console.error('loadBalances: Missing required parameters or invalid exchange contract', { 
        exchange: !!exchange, 
        hasBalanceOf: exchange ? typeof exchange.balanceOf : 'N/A',
        tokens: tokens ? tokens.length : 0, 
        account 
      })
      return
    }

    let balance = formatUnits(await tokens[0].balanceOf(account), 18)
    tokensStore.loadToken1Balance(balance)

    balance = formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
    exchangeStore.loadExchangeToken1Balance(balance)

    balance = formatUnits(await tokens[1].balanceOf(account), 18)
    tokensStore.loadToken2Balance(balance)

    balance = formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
    exchangeStore.loadExchangeToken2Balance(balance)
    
    console.log('Balances loaded successfully')
  } catch (error) {
    console.error('Error loading balances:', error)
    console.error('❌ Error loading balances. Please refresh.')
    alert('Error loading balances. Please refresh.')
  }
}

//Load all orders - Fixed version
export const loadAllOrders = async (provider, exchange) => {
  try {
    const exchangeStore = useExchangeStore.getState()
    const block = await provider.getBlockNumber()
    
    // Limit to recent blocks to avoid rate limiting
    const fromBlock = Math.max(0, block - 1000)
    
    console.log(`Loading orders from block ${fromBlock} to ${block}`)

    //Fetch cancel orders with delay
    const cancelStream = await exchange.queryFilter('Cancel', fromBlock, block)
    const cancelledOrders = cancelStream.map(event => event.args)
    exchangeStore.loadCancelledOrders(cancelledOrders)
    
    await new Promise(resolve => setTimeout(resolve, 1000))

    //Fetch filled orders
    const tradeStream = await exchange.queryFilter('Trade', fromBlock, block)
    const filledOrders = tradeStream.map(event => event.args)
    exchangeStore.loadFilledOrders(filledOrders)
    
    await new Promise(resolve => setTimeout(resolve, 1000))

    //Fetch all orders - FIXED: Use 'OrderCreated' instead of 'Order'
    const orderStream = await exchange.queryFilter('OrderCreated', fromBlock, block)
    const allOrders = orderStream.map(event => event.args)
    exchangeStore.loadAllOrders(allOrders)
    
    console.log(`Orders loaded successfully: ${allOrders.length} orders found`)
  } catch (error) {
    console.error('Error loading orders:', error)
    console.error('❌ Error loading orders. Some features may not work.')
  }
}

//Transfer tokens ( deposit & withdraw)
export const transferTokens = async (provider, exchange, transferType, token, amount) => {
  const exchangeStore = useExchangeStore.getState()
  let transaction

  exchangeStore.transferRequest()

  try {
    const signer = await provider.getSigner()
    const amountToTransfer = ethers.parseUnits(amount.toString(), 18)
    const account = await signer.getAddress()
    
    // Pre-flight checks to prevent "missing revert data" errors
    if (transferType === 'Deposit') {
      // Check if user has enough token balance
      const tokenBalance = await token.balanceOf(account)
      if (tokenBalance < amountToTransfer) {
        throw new Error(`Insufficient token balance. You have ${ethers.formatEther(tokenBalance)} but trying to deposit ${amount}`)
      }
    } else {
      // Check if user has enough balance in exchange
      const exchangeBalance = await exchange.balanceOf(token.address, account)
      if (exchangeBalance < amountToTransfer) {
        throw new Error(`Insufficient exchange balance. You have ${ethers.formatEther(exchangeBalance)} but trying to withdraw ${amount}`)
      }
    }

    // Retry function for rate limited requests
    const executeWithRetry = async (fn, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn()
        } catch (error) {
          if (error.message.includes('rate limit') && i < maxRetries - 1) {
            console.log(`📊 Rate limited, retrying in ${(i + 1) * 2} seconds...`)
            await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000))
            continue
          }
          throw error
        }
      }
    }

    if (transferType === 'Deposit') {
      // First approve with retry
      transaction = await executeWithRetry(() => 
        token.connect(signer).approve(exchange.address, amountToTransfer)
      )
      await transaction.wait()
      
      // Small delay between transactions
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Then deposit with retry
      transaction = await executeWithRetry(() =>
        exchange.connect(signer).depositToken(token.address, amountToTransfer)
      )
    } else {
      transaction = await executeWithRetry(() =>
        exchange.connect(signer).withdrawToken(token.address, amountToTransfer)
      )
    }
    
    await transaction.wait()
    exchangeStore.transferSuccess(null)
  } catch (error) {
    console.error('Transfer failed:', error)
    
    let errorMessage = 'Transaction failed'
    
    if (error.code === 'ACTION_REJECTED' || error.message.includes('user rejected') || error.message.includes('user denied')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient balance for this transaction'
    } else if (error.message.includes('missing revert data')) {
      errorMessage = 'Transaction failed - likely insufficient balance or tokens not approved'
    } else if (error.message.includes('gas')) {
      errorMessage = 'Transaction failed due to gas estimation error'
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Request rate limited - please try again in a moment'
    } else {
      errorMessage = `Transaction failed: ${error.message.split('\n')[0]}`
    }
    
    console.error('💥 Transfer Error:', errorMessage)
    alert(errorMessage) // Temporary fallback until toast is properly set up
    exchangeStore.transferFail()
  }
}

// Orders ( buy & sell )
// Validation helper function
const validateOrderInputs = (provider, exchange, tokens, order) => {
  if (!provider) throw new Error('Provider not available. Please connect your wallet.')
  if (!exchange) throw new Error('Exchange contract not loaded. Please refresh the page.')
  if (!tokens || tokens.length < 2) throw new Error('Trading tokens not loaded. Please refresh the page.')
  if (!order) throw new Error('Order data is missing.')
  
  // Validate order amounts
  const amount = parseFloat(order.amount)
  const price = parseFloat(order.price)
  
  if (isNaN(amount) || amount <= 0) throw new Error('Order amount must be a positive number')
  if (amount < 0.001) throw new Error('Order amount must be at least 0.001')
  if (amount > 1000000) throw new Error('Order amount too large')
  
  if (isNaN(price) || price <= 0) throw new Error('Order price must be a positive number')
  if (price < 0.000001) throw new Error('Order price must be at least 0.000001')
  if (price > 1000000) throw new Error('Order price too large')
  
  return { amount, price }
}

export const makeBuyOrder = async (provider, exchange, tokens, order) => {
  try {
    const { amount, price } = validateOrderInputs(provider, exchange, tokens, order)
    console.log('🛒 Creating buy order:', { amount, price })

    const exchangeStore = useExchangeStore.getState()
    
    const tokenGet = tokens[0].address || tokens[0].target
    const amountGet = ethers.parseUnits(order.amount.toString(), 18)
    const tokenGive = tokens[1].address || tokens[1].target
    const amountGive = ethers.parseUnits((order.amount * order.price).toString(), 18)

    console.log('🔍 Order details:', {
      tokenGet,
      amountGet: ethers.formatEther(amountGet),
      tokenGive,
      amountGive: ethers.formatEther(amountGive)
    })

    exchangeStore.newOrderRequest()

    // Log order creation
    console.log(`📝 Creating buy order: ${order.amount} at ${order.price}`)

    const signer = await provider.getSigner()
    
    // Add gas settings for faster confirmation
    const gasSettings = {
      gasLimit: 200000, // Set reasonable gas limit
      maxFeePerGas: ethers.parseUnits('2', 'gwei'), // Higher fee for faster processing
      maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei')
    }
    
    // Retry function for rate limited requests
    const executeWithRetry = async (fn, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn()
        } catch (error) {
          if (error.message.includes('rate limit') && i < maxRetries - 1) {
            console.log(`📊 Rate limited, retrying order in ${(i + 1) * 2} seconds...`)
            await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000))
            continue
          }
          throw error
        }
      }
    }
    
    const transaction = await executeWithRetry(() =>
      exchange.connect(signer).makeOrder(
        tokenGet, amountGet, tokenGive, amountGive, gasSettings
      )
    )
    
    console.log('📝 Transaction sent:', transaction.hash)
    
    // Log pending transaction
    console.log(`⏳ Transaction pending: ${transaction.hash}`)
    
    // Wait for confirmation with timeout and retry logic
    const waitForReceipt = async (maxRetries = 5) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await Promise.race([
            transaction.wait(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Transaction timeout after 60 seconds')), 60000)
            )
          ])
        } catch (error) {
          if (error.message.includes('rate limit') && i < maxRetries - 1) {
            console.log(`📊 Rate limited waiting for receipt, retrying in ${(i + 1) * 3} seconds...`)
            await new Promise(resolve => setTimeout(resolve, (i + 1) * 3000))
            continue
          }
          throw error
        }
      }
    }
    
    const receipt = await waitForReceipt()
    
    console.log('✅ Buy order created successfully', receipt)
    
    // Log success
    console.log(`✅ Buy order successful: ${order.amount} at ${order.price}, TX: ${transaction.hash}`)
    
    exchangeStore.newOrderSuccess()
  } catch (error) {
    console.error('❌ Error creating buy order:', error)
    const exchangeStore = useExchangeStore.getState()
    exchangeStore.newOrderFail()
    
    // Enhanced error handling
    console.error('💥 Buy order failed:', error.message)
    
    // If transaction was submitted but receipt failed due to rate limiting, 
    // the order might still have been processed
    if (transaction && transaction.hash && error.message.includes('rate limit')) {
      console.log('⚠️ Transaction was submitted but receipt failed due to rate limiting')
      console.log(`🔗 Check transaction: https://sepolia.basescan.org/tx/${transaction.hash}`)
      alert(`Order was submitted but confirmation failed due to rate limiting. Check transaction: ${transaction.hash}`)
      
      // Still try to update the UI optimistically
      exchangeStore.newOrderSuccess()
      return
    }
    
    alert(`Buy order failed: ${error.message.split('\n')[0]}`)
  }
}

export const makeSellOrder = async (provider, exchange, tokens, order) => {
  try {
    const { amount, price } = validateOrderInputs(provider, exchange, tokens, order)
    console.log('💰 Creating sell order:', { amount, price })

    const exchangeStore = useExchangeStore.getState()
    
    const tokenGet = tokens[1].address || tokens[1].target
    const amountGet = ethers.parseUnits((order.amount * order.price).toString(), 18)
    const tokenGive = tokens[0].address || tokens[0].target
    const amountGive = ethers.parseUnits(order.amount.toString(), 18)

    console.log('🔍 Order details:', {
      tokenGet,
      amountGet: ethers.formatEther(amountGet),
      tokenGive,
      amountGive: ethers.formatEther(amountGive)
    })

    exchangeStore.newOrderRequest()

    // Log order creation
    console.log(`📝 Creating sell order: ${order.amount} at ${order.price}`)

    const signer = await provider.getSigner()
    
    // Add gas settings for faster confirmation
    const gasSettings = {
      gasLimit: 200000, // Set reasonable gas limit
      maxFeePerGas: ethers.parseUnits('2', 'gwei'), // Higher fee for faster processing
      maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei')
    }
    
    // Retry function for rate limited requests
    const executeWithRetry = async (fn, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn()
        } catch (error) {
          if (error.message.includes('rate limit') && i < maxRetries - 1) {
            console.log(`📊 Rate limited, retrying order in ${(i + 1) * 2} seconds...`)
            await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000))
            continue
          }
          throw error
        }
      }
    }
    
    const transaction = await executeWithRetry(() =>
      exchange.connect(signer).makeOrder(
        tokenGet, amountGet, tokenGive, amountGive, gasSettings
      )
    )
    
    console.log('📝 Transaction sent:', transaction.hash)
    
    // Log pending transaction
    console.log(`⏳ Transaction pending: ${transaction.hash}`)
    
    // Wait for confirmation with timeout and retry logic
    const waitForReceipt = async (maxRetries = 5) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await Promise.race([
            transaction.wait(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Transaction timeout after 60 seconds')), 60000)
            )
          ])
        } catch (error) {
          if (error.message.includes('rate limit') && i < maxRetries - 1) {
            console.log(`📊 Rate limited waiting for receipt, retrying in ${(i + 1) * 3} seconds...`)
            await new Promise(resolve => setTimeout(resolve, (i + 1) * 3000))
            continue
          }
          throw error
        }
      }
    }
    
    const receipt = await waitForReceipt()
    
    console.log('✅ Sell order created successfully', receipt)
    
    // Log success
    console.log(`✅ Sell order successful: ${order.amount} at ${order.price}, TX: ${transaction.hash}`)
    
    exchangeStore.newOrderSuccess()
  } catch (error) {
    console.error('❌ Error creating sell order:', error)
    const exchangeStore = useExchangeStore.getState()
    exchangeStore.newOrderFail()
    
    // Log error
    console.error('💥 Sell order failed:', error.message)
    alert(`Sell order failed: ${error.message.split('\n')[0]}`)
  }
}

// Cancel order
export const cancelOrder = async (provider, exchange, order) => {
  const exchangeStore = useExchangeStore.getState()
  
  exchangeStore.cancelOrderRequest()

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).cancelOrder(order.id)
    await transaction.wait()
  } catch (error) {
    exchangeStore.cancelOrderFail()
  }
}

// Fill order
export const fillOrder = async (provider, exchange, order) => {
  const exchangeStore = useExchangeStore.getState()
  
  exchangeStore.fillOrderRequest()

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).fillOrder(order.id)
    await transaction.wait()
  } catch (error) {
    exchangeStore.fillOrderFail()
  }
}

// Token Faucet - Request test tokens from the deployer
export const claimTestTokens = async (provider, tokenAddress, tokenSymbol) => {
  try {
    console.log(`🪙 Claiming ${tokenSymbol} tokens...`)

    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()
    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer)
    
    // Check current balance before claiming
    const currentBalance = await tokenContract.balanceOf(userAddress)
    const balanceFormatted = ethers.formatEther(currentBalance)
    console.log(`ℹ️ Current ${tokenSymbol} balance: ${balanceFormatted}`)

    // Try different claiming methods
    let transaction
    const claimAmount = ethers.parseEther("1000") // Try to claim 1000 tokens
    
    try {
      // Method 1: Try faucet function (common in test tokens)
      if (tokenContract.faucet) {
        console.log(`🚰 Trying faucet method for ${tokenSymbol}...`)
        transaction = await tokenContract.faucet()
        await transaction.wait()
        console.log(`✅ Faucet successful for ${tokenSymbol}`)
      }
    } catch (error) {
      console.log(`❌ Faucet method failed: ${error.message}`)
      
      try {
        // Method 2: Try mint function (if user has permission)
        if (tokenContract.mint) {
          console.log(`🏭 Trying mint method for ${tokenSymbol}...`)
          transaction = await tokenContract.mint(userAddress, claimAmount)
          await transaction.wait()
          console.log(`✅ Mint successful for ${tokenSymbol}`)
        }
      } catch (mintError) {
        console.log(`❌ Mint method failed: ${mintError.message}`)
        
        try {
          // Method 3: Try claim function with amount
          if (tokenContract.claim) {
            console.log(`📥 Trying claim method for ${tokenSymbol}...`)
            transaction = await tokenContract.claim(claimAmount)
            await transaction.wait()
            console.log(`✅ Claim successful for ${tokenSymbol}`)
          }
        } catch (claimError) {
          console.log(`❌ Claim method failed: ${claimError.message}`)
          throw new Error(`No working claim method found for ${tokenSymbol}. Available methods: ${Object.getOwnPropertyNames(tokenContract).filter(name => typeof tokenContract[name] === 'function').join(', ')}`)
        }
      }
    }
    
    // Wait a moment for balance to update
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check new balance
    const newBalance = await tokenContract.balanceOf(userAddress)
    const newBalanceFormatted = ethers.formatEther(newBalance)
    const difference = ethers.formatEther(newBalance - currentBalance)
    
    console.log(`💰 Successfully claimed ${difference} ${tokenSymbol} tokens!`)
    console.log(`💰 New ${tokenSymbol} balance: ${newBalanceFormatted}`)
    
    alert(`Successfully claimed ${difference} ${tokenSymbol} tokens! New balance: ${newBalanceFormatted}`)
    
    // Copy user address to clipboard
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(userAddress)
        console.log('📋 Your address copied to clipboard')
      } catch (e) {
        console.log('📋 Could not copy to clipboard')
      }
    }

    return true

  } catch (error) {
    console.error(`❌ Error claiming ${tokenSymbol} tokens:`, error)
    
    let errorMessage = `Failed to claim ${tokenSymbol} tokens`
    if (error.message.includes('No working claim method')) {
      errorMessage = `${tokenSymbol} tokens don't have a public claim/faucet function. You may need to contact the deployer or use a different method to get test tokens.`
    } else if (error.message.includes('already claimed') || error.message.includes('cooldown')) {
      errorMessage = `You've already claimed ${tokenSymbol} tokens recently. Please wait before claiming again.`
    } else {
      errorMessage = `Failed to claim ${tokenSymbol} tokens: ${error.message.split('\n')[0]}`
    }
    
    console.error(`💥 ${errorMessage}`)
    alert(errorMessage)
    return false
  }
}

// Alternative: Check if user is deployer and can mint tokens
export const mintTokensAsDeployer = async (provider, tokenAddress, tokenSymbol, amount) => {
  try {
    console.log(`🏭 Attempting to mint ${amount} ${tokenSymbol} tokens...`)
    
    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()
    
    // Simple approach: try to transfer from the contract's initial supply
    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer)
    
    // Check the contract's balance and owner
    const contractBalance = await tokenContract.balanceOf(tokenAddress)
    console.log(`Contract ${tokenSymbol} balance:`, ethers.formatEther(contractBalance))
    
    console.warn('⚠️  Minting not available. Contact deployer for test tokens.')
    alert('Minting not available. Contact deployer for test tokens.')
    
    return false
    
  } catch (error) {
    console.error(`❌ Error minting ${tokenSymbol}:`, error)
    return false
  }
}

// Fetch historical trade data from BaseScan API
export const fetchHistoricalTrades = async (exchangeAddress, fromBlock = 0) => {
  try {
    // Use BaseScan API without API key first (rate limited but works for testing)
    const BASESCAN_API_URL = 'https://api.basescan.org/api'
    
    console.log('🔍 Fetching historical trades from BaseScan for:', exchangeAddress)
    
    // Trade event topic0: keccak256("Trade(uint256,address,address,uint256,address,uint256,address,uint256)")
    const tradeEventTopic = '0x3961c92afd33e32ee23f452be4d803587cda92f539098451ab96ea106912d6c2'
    
    // Fetch Trade events from the exchange contract
    const tradeEventsUrl = `${BASESCAN_API_URL}?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=latest&address=${exchangeAddress}&topic0=${tradeEventTopic}`
    
    console.log('📊 API URL:', tradeEventsUrl)
    
    const response = await fetch(tradeEventsUrl)
    const data = await response.json()
    
    console.log('📊 BaseScan API response:', { status: data.status, message: data.message, resultCount: data.result?.length })
    console.log('📊 Full API response:', data)
    
    if (data.status !== '1') {
      console.log('📊 BaseScan API error:', data.message)
      console.log('📊 Falling back to direct blockchain query...')
      return []
    }
    
    // Ensure we have valid results to process
    if (!data.result || !Array.isArray(data.result)) {
      console.log('📊 No valid results to process')
      return []
    }
    
    console.log('📊 Found', data.result.length, 'historical trade events')
    
    // Parse the trade events using ethers for proper decoding
    const trades = []
    
    for (const log of data.result) {
      try {
        console.log('📊 Processing log:', log)
        // Use ethers to properly decode the event
        const iface = new ethers.Interface(EXCHANGE_ABI)
        const decodedLog = iface.parseLog({
          topics: log.topics,
          data: log.data
        })
        
        console.log('📊 Decoded log:', decodedLog)
        
        if (decodedLog && decodedLog.name === 'Trade') {
          const args = decodedLog.args
          trades.push({
            id: args.id.toString(),
            user: args.user,
            tokenGet: args.tokenGet,
            amountGet: args.amountGet.toString(),
            tokenGive: args.tokenGive,
            amountGive: args.amountGive.toString(),
            creator: args.creator,
            timestamp: args.timestamp.toString(),
            blockNumber: parseInt(log.blockNumber, 16),
            transactionHash: log.transactionHash
          })
        }
      } catch (parseError) {
        console.error('Error parsing trade event:', parseError)
      }
    }
    
    console.log('📊 Successfully parsed', trades.length, 'historical trades from', data.result.length, 'logs')
    console.log('📊 Parsed trades:', trades)
    return trades
  } catch (error) {
    console.error('❌ Error fetching historical trades:', error)
    return []
  }
}

// Enhanced loadAllOrders to include historical data
export const loadAllOrdersWithHistory = async (provider, exchange) => {
  try {
    const exchangeStore = useExchangeStore.getState()
    
    // First, load historical trades from BaseScan
    const historicalTrades = await fetchHistoricalTrades(exchange.target)
    console.log('📊 Historical trades loaded:', historicalTrades.length)
    
    // Then load recent orders from the blockchain (existing logic)
    const block = await provider.getBlockNumber()
    
    // Use smaller chunks to avoid RPC limits and rate limiting
    const maxBlockRange = 500  // Reduced from 1000 to be more conservative
    const targetBlocksBack = 2000 // Reduced back to 2000 for recent orders, but ensure we get current block
    
    // Get fresh current block to ensure we capture very recent transactions
    const currentBlock = await provider.getBlockNumber()
    const network = await provider.getNetwork()
    // For localhost/development, search from block 0 to ensure we catch all orders
    const startBlock = Number(network.chainId) === 31337 ? 0 : Math.max(0, currentBlock - targetBlocksBack)
    
    console.log(`📊 Current block: ${currentBlock}, searching from ${startBlock} to ${currentBlock}`)
    
    console.log(`📊 Loading orders in chunks from block ${startBlock} to ${block}`)
    
    let allCancelledOrders = []
    let allFilledOrders = []
    
    // Query in chunks using the current block
    for (let fromBlock = startBlock; fromBlock < currentBlock; fromBlock += maxBlockRange) {
      const toBlock = Math.min(fromBlock + maxBlockRange - 1, currentBlock)
      
      try {
        console.log(`📊 Querying chunk: blocks ${fromBlock} to ${toBlock}`)
        
        // Load cancelled orders for this chunk
        const cancelStream = await exchange.queryFilter('Cancel', fromBlock, toBlock)
        const cancelledOrders = cancelStream.map(event => event.args)
        allCancelledOrders.push(...cancelledOrders)
        
        await new Promise(resolve => setTimeout(resolve, 1000)) // Increased delay to prevent rate limiting
        
        // Load filled orders for this chunk
        const tradeStream = await exchange.queryFilter('Trade', fromBlock, toBlock)
        const filledOrders = tradeStream.map(event => event.args)
        allFilledOrders.push(...filledOrders)
        
        await new Promise(resolve => setTimeout(resolve, 1000)) // Increased delay to prevent rate limiting
        
      } catch (error) {
        console.log(`📊 Error querying chunk ${fromBlock}-${toBlock}:`, error.message)
        
        // If rate limited, wait longer before continuing
        if (error.message.includes('rate limit')) {
          console.log('📊 Rate limited, waiting 5 seconds...')
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
        // Continue with next chunk even if one fails
      }
    }
    
    // Store all collected orders
    exchangeStore.loadCancelledOrders(allCancelledOrders)
    console.log('📊 Total cancelled orders found:', allCancelledOrders.length)
    
    // Combine historical and blockchain trades
    console.log('📊 Blockchain trades found:', allFilledOrders.length)
    console.log('📊 Historical trades from API:', historicalTrades.length)
    
    const combinedTrades = [...historicalTrades, ...allFilledOrders]
    console.log('📊 Combined trades total:', combinedTrades.length)
    
    exchangeStore.loadFilledOrders(combinedTrades)
    
    // Load all orders - Fix event name and improve reliability
    let allOrders = []
    
    try {
      console.log(`📊 Loading OrderCreated events from block ${startBlock} to ${currentBlock}`)
      
      // The correct event name is 'OrderCreated' not 'Order' - this is the key fix!
      for (let fromBlock = startBlock; fromBlock < currentBlock; fromBlock += maxBlockRange) {
        const toBlock = Math.min(fromBlock + maxBlockRange - 1, currentBlock)
        
        try {
          console.log(`📊 Querying OrderCreated events: blocks ${fromBlock} to ${toBlock}`)
          
          const orderStream = await exchange.queryFilter('OrderCreated', fromBlock, toBlock)
          const orders = orderStream.map(event => event.args)
          
          console.log(`📊 Found ${orders.length} OrderCreated events in this chunk`)
          allOrders.push(...orders)
          
          // Debug sample order
          if (orders.length > 0) {
            console.log(`📊 Sample order from chunk:`, {
              id: orders[0].id?.toString(),
              user: orders[0].user,
              tokenGet: orders[0].tokenGet,
              tokenGive: orders[0].tokenGive
            })
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000)) // Increased delay
          
        } catch (chunkError) {
          console.log(`📊 Error querying OrderCreated chunk ${fromBlock}-${toBlock}:`, chunkError.message)
          
          if (chunkError.message.includes('rate limit')) {
            console.log('📊 Rate limited, waiting 5 seconds...')
            await new Promise(resolve => setTimeout(resolve, 5000))
          }
        }
      }
      
    } catch (error) {
      console.log(`📊 Error querying OrderCreated events:`, error.message)
    }
    
    console.log('📊 Total orders found:', allOrders.length)
    exchangeStore.loadAllOrders(allOrders)
    
    console.log('📊 Orders loaded successfully (with historical data)')
  } catch (error) {
    console.error('Error loading orders with history:', error)
    // Fallback to original method
    await loadAllOrders(provider, exchange)
  }
}