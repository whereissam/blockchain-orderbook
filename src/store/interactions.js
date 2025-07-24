import { ethers, formatUnits } from 'ethers'
import TOKEN_ABI from '../abis/Token.json'
import EXCHANGE_ABI from '../abis/Exchange.json'
import useProviderStore from './providerStore'
import useTokensStore from './tokensStore'
import useExchangeStore from './exchangeStore'

//1. Load provider(Login wallet) - get the connection info
export const loadProvider = () => {
  if (!window.ethereum) {
    console.log('MetaMask not detected')
    return null
  }
  
  // Use Alchemy RPC for better rate limits on Base Sepolia
  const ALCHEMY_RPC_URL = 'https://base-sepolia.g.alchemy.com/v2/SVPGtLg2pMLIc57MJXG-R1En6DcnBB9K'
  
  const connection = new ethers.BrowserProvider(window.ethereum)
  
  // Override the connection to use Alchemy for read operations
  const alchemyProvider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL)
  
  // Create a hybrid provider: use MetaMask for signing, Alchemy for reading
  connection._getProvider = () => alchemyProvider._getProvider()
  connection.getBlockNumber = () => alchemyProvider.getBlockNumber()
  connection.getBlock = (block) => alchemyProvider.getBlock(block)
  connection.queryFilter = (filter, fromBlock, toBlock) => alchemyProvider.queryFilter(filter, fromBlock, toBlock)
  connection.getCode = (address) => alchemyProvider.getCode(address)
  connection.call = (transaction) => alchemyProvider.call(transaction)
  
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
export const loadAccount = async (provider) => {
  try {
    // First try to get existing accounts without requesting permission
    let accounts = await window.ethereum.request({ method: 'eth_accounts' })
    
    // If no accounts, then request permission
    if (accounts.length === 0) {
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    }

    if (accounts.length === 0) {
      console.log('No accounts available')
      return null
    }

    const account = ethers.getAddress(accounts[0])
    useProviderStore.getState().loadAccount(account)

    let balance = await provider.getBalance(account)
    balance = ethers.formatEther(balance)

    useProviderStore.getState().loadEtherBalance(balance)

    return account
  } catch (error) {
    console.error('Failed to load account:', error)
    return null
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
    if (window.showToast) {
      window.showToast('No contracts found at the configured addresses. Check your network and contract deployments.', 'error', 8000)
    }
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
      hasFilledOrders: typeof exchange.filledOrders,
      hasCancelledOrders: typeof exchange.cancelledOrders,
      address: exchange.target,
      interface: exchange.interface ? 'Available' : 'Missing'
    })
    
    useExchangeStore.getState().loadExchange(exchange)
    return exchange
  } catch (error) {
    console.error('❌ Error loading exchange:', error)
    if (window.showToast) {
      window.showToast(`Failed to load exchange contract: ${error.message}`, 'error', 5000)
    }
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

  exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
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
    if (window.showToast) {
      window.showToast('Error loading balances. Please refresh.', 'error', 3000)
    }
  }
}

//Load all orders
export const loadAllOrders = async (provider, exchange) => {
  try {
    const exchangeStore = useExchangeStore.getState()
    const block = await provider.getBlockNumber()
    
    // Limit to recent blocks to avoid rate limiting - much smaller range
    const fromBlock = Math.max(0, block - 1000) // Last ~1000 blocks (increased for better chart data)
    
    console.log(`Loading orders from block ${fromBlock} to ${block}`)

    //Fetch cancel orders with delay
    const cancelStream = await exchange.queryFilter('Cancel', fromBlock, block)
    const cancelledOrders = cancelStream.map(event => event.args)
    exchangeStore.loadCancelledOrders(cancelledOrders)
    
    // Increased delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))

    //Fetch filled orders
    const tradeStream = await exchange.queryFilter('Trade', fromBlock, block)
    const filledOrders = tradeStream.map(event => event.args)
    exchangeStore.loadFilledOrders(filledOrders)
    
    // Increased delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))

    //Fetch all orders
    const orderStream = await exchange.queryFilter('Order', fromBlock, block)
    const allOrders = orderStream.map(event => event.args)
    exchangeStore.loadAllOrders(allOrders)
    
    console.log('Orders loaded successfully')
  } catch (error) {
    console.error('Error loading orders:', error)
    if (window.showToast) {
      window.showToast('Error loading orders. Some features may not work.', 'error', 3000)
    }
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

    if (transferType === 'Deposit') {
      transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
      await transaction.wait()
      transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)
    } else {
      transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer)
    }
    await transaction.wait()
    
    exchangeStore.transferSuccess(null)
  } catch (error) {
    console.error('Transfer failed:', error)
    if (window.showToast) {
      if (error.code === 'ACTION_REJECTED' || error.message.includes('user rejected') || error.message.includes('user denied')) {
        window.showToast('Transaction cancelled by user', 'warning', 3000)
      } else if (error.message.includes('insufficient funds')) {
        window.showToast('Insufficient balance for this transaction', 'error', 4000)
      } else if (error.message.includes('gas')) {
        window.showToast('Transaction failed due to gas estimation error', 'error', 4000)
      } else {
        window.showToast(`Transaction failed: ${error.message.split('\n')[0]}`, 'error', 4000)
      }
    }
    exchangeStore.transferFail()
  }
}

// Orders ( buy & sell )
export const makeBuyOrder = async (provider, exchange, tokens, order) => {
  try {
    console.log('🛒 Creating buy order:', { amount: order.amount, price: order.price })
    
    if (!provider || !exchange || !tokens || tokens.length < 2) {
      throw new Error('Missing required components for order creation')
    }

    if (!order.amount || !order.price || order.amount <= 0 || order.price <= 0) {
      throw new Error('Invalid order amount or price')
    }

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

    // Show loading toast for order creation
    if (window.blockchainToasts) {
      window.blockchainToasts.orderCreating('buy', order.amount, order.price)
    }

    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
    
    console.log('📝 Transaction sent:', transaction.hash)
    
    // Show pending transaction toast
    if (window.blockchainToasts) {
      window.blockchainToasts.transactionPending(transaction.hash)
    }
    
    await transaction.wait()
    
    console.log('✅ Buy order created successfully')
    
    // Show success toast with transaction link
    if (window.blockchainToasts) {
      window.blockchainToasts.orderSuccess('Buy', order.amount, order.price, transaction.hash)
    }
    
    exchangeStore.newOrderSuccess()
  } catch (error) {
    console.error('❌ Error creating buy order:', error)
    const exchangeStore = useExchangeStore.getState()
    exchangeStore.newOrderFail()
    
    // Show enhanced error toast
    if (window.blockchainToasts) {
      window.blockchainToasts.orderError('buy', error)
    }
  }
}

export const makeSellOrder = async (provider, exchange, tokens, order) => {
  try {
    console.log('💰 Creating sell order:', { amount: order.amount, price: order.price })
    
    if (!provider || !exchange || !tokens || tokens.length < 2) {
      throw new Error('Missing required components for order creation')
    }

    if (!order.amount || !order.price || order.amount <= 0 || order.price <= 0) {
      throw new Error('Invalid order amount or price')
    }

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

    // Show loading toast for order creation
    if (window.blockchainToasts) {
      window.blockchainToasts.orderCreating('sell', order.amount, order.price)
    }

    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
    
    console.log('📝 Transaction sent:', transaction.hash)
    
    // Show pending transaction toast
    if (window.blockchainToasts) {
      window.blockchainToasts.transactionPending(transaction.hash)
    }
    
    await transaction.wait()
    
    console.log('✅ Sell order created successfully')
    
    // Show success toast with transaction link
    if (window.blockchainToasts) {
      window.blockchainToasts.orderSuccess('Sell', order.amount, order.price, transaction.hash)
    }
    
    exchangeStore.newOrderSuccess()
  } catch (error) {
    console.error('❌ Error creating sell order:', error)
    const exchangeStore = useExchangeStore.getState()
    exchangeStore.newOrderFail()
    
    // Show enhanced error toast
    if (window.blockchainToasts) {
      window.blockchainToasts.orderError('sell', error)
    }
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
    
    if (window.showToast) {
      window.showToast(`Requesting ${tokenSymbol} tokens...`, 'info', 3000)
    }

    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()
    
    // Try to call transfer function from deployer to user (if deployer has tokens)
    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider)
    
    // Check current balance
    const currentBalance = await tokenContract.balanceOf(userAddress)
    const balanceFormatted = ethers.formatEther(currentBalance)
    const balanceNumber = parseFloat(balanceFormatted)
    console.log(`ℹ️ Current ${tokenSymbol} balance: ${balanceFormatted}`)

    // Use enhanced token claim toast
    if (window.blockchainToasts) {
      window.blockchainToasts.tokenClaim(tokenSymbol, balanceNumber)
    }
    
    // Copy user address to clipboard if available
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
    if (window.showToast) {
      window.showToast(`Failed to check ${tokenSymbol} balance: ${error.message}`, 'error', 5000)
    }
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
    
    if (window.showToast) {
      window.showToast(`Minting not available. Contact deployer for test tokens.`, 'warning', 5000)
    }
    
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
    const targetBlocksBack = 2000 // Reduced from 10,000 to avoid rate limits
    const startBlock = Math.max(0, block - targetBlocksBack)
    
    console.log(`📊 Loading orders in chunks from block ${startBlock} to ${block}`)
    
    let allCancelledOrders = []
    let allFilledOrders = []
    
    // Query in chunks of 1000 blocks
    for (let fromBlock = startBlock; fromBlock < block; fromBlock += maxBlockRange) {
      const toBlock = Math.min(fromBlock + maxBlockRange - 1, block)
      
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
    
    // Load all orders in chunks too
    let allOrders = []
    for (let fromBlock = startBlock; fromBlock < block; fromBlock += maxBlockRange) {
      const toBlock = Math.min(fromBlock + maxBlockRange - 1, block)
      
      try {
        console.log(`📊 Querying orders chunk: blocks ${fromBlock} to ${toBlock}`)
        const orderStream = await exchange.queryFilter('Order', fromBlock, toBlock)
        const orders = orderStream.map(event => event.args)
        allOrders.push(...orders)
        
        await new Promise(resolve => setTimeout(resolve, 1000)) // Increased delay to prevent rate limiting
        
      } catch (error) {
        console.log(`📊 Error querying orders chunk ${fromBlock}-${toBlock}:`, error.message)
        
        // If rate limited, wait longer before continuing
        if (error.message.includes('rate limit')) {
          console.log('📊 Rate limited, waiting 5 seconds...')
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      }
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