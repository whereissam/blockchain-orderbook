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
  
  const connection = new ethers.BrowserProvider(window.ethereum)
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
  let token, symbol

  token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
  symbol = await token.symbol()
  useTokensStore.getState().loadToken1(token, symbol)

  token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
  symbol = await token.symbol()
  useTokensStore.getState().loadToken2(token, symbol)

  return token
}

// 5. load provider exchange (Login wallet) - get the exchange 
export const loadExchange = async (provider, address) => {
  const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
  useExchangeStore.getState().loadExchange(exchange)
  return exchange
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
  const tokensStore = useTokensStore.getState()
  const exchangeStore = useExchangeStore.getState()

  let balance = formatUnits(await tokens[0].balanceOf(account), 18)
  tokensStore.loadToken1Balance(balance)

  balance = formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
  exchangeStore.loadExchangeToken1Balance(balance)

  balance = formatUnits(await tokens[1].balanceOf(account), 18)
  tokensStore.loadToken2Balance(balance)

  balance = formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
  exchangeStore.loadExchangeToken2Balance(balance)
}

//Load all orders
export const loadAllOrders = async (provider, exchange) => {
  const exchangeStore = useExchangeStore.getState()
  const block = await provider.getBlockNumber()

  //Fetch cancel orders
  const cancelStream = await exchange.queryFilter('Cancel', 0, block)
  const cancelledOrders = cancelStream.map(event => event.args)
  exchangeStore.loadCancelledOrders(cancelledOrders)

  //Fetch filled orders
  const tradeStream = await exchange.queryFilter('Trade', 0, block)
  const filledOrders = tradeStream.map(event => event.args)
  exchangeStore.loadFilledOrders(filledOrders)

  //Fetch all orders
  const orderStream = await exchange.queryFilter('Order', 0, block)
  const allOrders = orderStream.map(event => event.args)
  exchangeStore.loadAllOrders(allOrders)
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
      if (error.message.includes('insufficient funds')) {
        window.showToast('Insufficient balance for this transaction', 'error', 4000)
      } else if (error.message.includes('user rejected')) {
        window.showToast('Transaction rejected by user', 'error', 3000)
      } else {
        window.showToast(`Transaction failed: ${error.message}`, 'error', 4000)
      }
    }
    exchangeStore.transferFail()
  }
}

// Orders ( buy & sell )
export const makeBuyOrder = async (provider, exchange, tokens, order) => {
  const exchangeStore = useExchangeStore.getState()
  
  const tokenGet = tokens[0].address
  const amountGet = ethers.parseUnits(order.amount, 18)
  const tokenGive = tokens[1].address
  const amountGive = ethers.parseUnits((order.amount * order.price).toString(), 18)

  exchangeStore.newOrderRequest()

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
    await transaction.wait()
  } catch (error) {
    exchangeStore.newOrderFail()
  }
}

export const makeSellOrder = async (provider, exchange, tokens, order) => {
  const exchangeStore = useExchangeStore.getState()
  
  const tokenGet = tokens[1].address
  const amountGet = ethers.parseUnits((order.amount * order.price).toString(), 18)
  const tokenGive = tokens[0].address
  const amountGive = ethers.parseUnits(order.amount, 18)

  exchangeStore.newOrderRequest()

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
    await transaction.wait()
  } catch (error) {
    exchangeStore.newOrderFail()
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