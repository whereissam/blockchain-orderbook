import { ethers } from 'ethers'
import TOKEN_ABI from '../abis/Token.json'
import EXCHANGE_ABI from '../abis/Exchange.json'
// import { exchange } from './reducers'

//1. Load provider(Login wallet) - get the connection info
export const loadProvider = (dispatch) => {
  const connection = new ethers.providers.Web3Provider(window.ethereum)
  dispatch({ type: 'PROVIDER_LOADED', connection })
  // console.log('loadProvider')
  return connection
}

//2. Load provider network(Login wallet) - get the network info
export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()
  dispatch({ type: 'NETWORK_LOADED', chainId })
  // console.log('loadNetwork')
  return chainId
}

//3. Load provider account(Login wallet) - get the account info & balance
export const loadAccount = async (provider, dispatch) => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

  const account = ethers.utils.getAddress(accounts[0])
  dispatch({ type: 'ACCOUNT_LOADED', account })

  let balance = await provider.getBalance(account)
  balance = ethers.utils.formatEther(balance)

  dispatch({ type: 'ETHER_BALANCE_LOADED', balance })

  return account
}

//4. Load provider token(have two tokens)(Login wallet) - get the two tokens
export const loadToken = async (provider, addresses, dispatch) => {
  let token, symbol

  // console.log(addresses[0])
  token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
  symbol = await token.symbol() //sss
  // console.log(symbol)
  dispatch({ type: 'TOKEN_1_LOADED', token, symbol })

  token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
  symbol = await token.symbol() //mETH
  dispatch({ type: 'TOKEN_2_LOADED', token, symbol })

  return token
}

// 5. load provider exchange (Login wallet) - get the exchange 
export const loadExchange = async (provider, address, dispatch) => {
  // console.log(address)
  const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
  // console.log(exchange)
  dispatch({ type: 'EXCHANGE_LOADED', exchange })

  return exchange
}

export const subscribeToEvents = (exchange, dispatch) => {
  exchange.on('Cancel', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
    const order = event.args
    dispatch({ type: 'ORDER_CANCEL_SUCCESS', order, event })
  })

  exchange.on('Trade', (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timestamp, event) => {
    const order = event.args
    dispatch({ type: 'ORDER_FILL_SUCCESS', order, event })
  })

  exchange.on('Deposit', (token, user, amount, balance, event) => {
    dispatch({ type: 'TRANSFER_SUCCESS', event })
  })

  exchange.on('Withdraw', (token, user, amount, balance, event) => {
    dispatch({ type: 'TRANSFER_SUCCESS', event })
  })

  exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
    const order = event.args
    dispatch({ type: 'NEW_ORDER_SUCCESS', order, event })
  })
}

//Load user balances ( wallet & exchange balances)

export const loadBalances = async (exchange, tokens, account, dispatch) => {

  let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18)
  dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance })

  balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
  dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance })

  balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18)
  dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance })

  balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
  dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance })
}

//Load all orders
export const loadAllOrders = async (provider, exchange, dispatch) => {
  const block = await provider.getBlockNumber()
  // console.log(block)

  //Fetch cancel orders
  const cancelStream = await exchange.queryFilter('Cancel', 0, block) //From block 0 to block tail
  const cancelledOrders = cancelStream.map(event => event.args)
  dispatch({ type: 'CANCELLED_ORDERS_LOADED', cancelledOrders })

  //Fetch filled orders
  const tradeStream = await exchange.queryFilter('Trade', 0, block)
  const filledOrders = tradeStream.map(event => event.args)
  dispatch({ type: 'FILLED_ORDERS_LOADED', filledOrders })

  //Fetch all orders
  const orderStream = await exchange.queryFilter('Order', 0, block)
  const allOrders = orderStream.map(event => event.args)

  dispatch({ type: 'ALL_ORDERS_LOADED', allOrders })
}

//Transfer tokens ( deposit & withdraw)

export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
  let transaction

  dispatch({ type: 'TRANSFER_REQUEST' })

  try {
    const signer = await provider.getSigner()
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)

    if (transferType === 'Deposit') {
      transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
      await transaction.wait()
      transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)
    } else {
      transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer)

    }


    await transaction.wait()
  } catch (error) {
    console.error(error)
    dispatch({ type: 'TRANSFER_FAIL' })
  }

}

// Orders ( buy & sell )

export const makeBuyOrder = async (provider, exchange, tokens, order, dispatch) => {
  // address _tokenGet,
  // uint256 _amountGet, 
  // address _tokenGive,
  // uint256 _amountGive (orderAmount * orderPrice)
  const tokenGet = tokens[0].address
  const amountGet = ethers.utils.parseUnits(order.amount, 18)
  const tokenGive = tokens[1].address
  const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)

  dispatch({ type: 'NEW_ORDER_REQUEST' })

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
    await transaction.Wait()
  } catch (error) {
    dispatch({ type: 'NEW_ORDER_FAIL' })
  }

}

export const makeSellOrder = async (provider, exchange, tokens, order, dispatch) => {
  // address _tokenGet,
  // uint256 _amountGet, 
  // address _tokenGive,
  // uint256 _amountGive (orderAmount * orderPrice)
  const tokenGet = tokens[1].address
  const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)
  const tokenGive = tokens[0].address
  const amountGive = ethers.utils.parseUnits(order.amount, 18)

  dispatch({ type: 'NEW_ORDER_REQUEST' })

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
    await transaction.Wait()
  } catch (error) {
    dispatch({ type: 'NEW_ORDER_FAIL' })
  }

}

//----------------------------------------------------------------------------------------------
// Cancel order

export const cancelOrder = async (provider, exchange, order, dispatch) => {
  dispatch({ type: 'CANCEL_ORDER_REQUEST' })

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).cancelOrder(order.id)
    await transaction.Wait()
  } catch (error) {
    dispatch({ type: 'ORDER_CANCEL_FAIL' })
  }
}


//----------------------------------------------------------------------------------------------
// Fill order

export const fillOrder = async (provider, exchange, order, dispatch) => {
  dispatch({ type: 'ORDER_FILL_REQUEST' })

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).fillOrder(order.id)
    await transaction.Wait()
  } catch (error) {
    dispatch({ type: 'ORDER_FILL_FAIL' })
  }
}