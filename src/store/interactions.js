import { ethers } from 'ethers'
import TOKEN_ABI from '../abis/Token.json'
import EXCHANGE_ABI from '../abis/Exchange.json'

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
  console.log('subscribeToEvents')
  exchange.on('Deposit', (token, user, amount, balance, event) => {
    dispatch({ type: 'TRANSFER_SUCCESS', event })
  })
}

//Load user balances ( wallet & exchange balances)

export const loadBalances = async (exchange, tokens, account, dispatch) => {

  let amount = await tokens[0].balanceOf(account)
  // console.log(amount)
  let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18)
  // console.log(exchange, tokens, account, balance)
  dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance })

  // let temp = await exchange.balanceOf(tokens[0].address, account)

  balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
  console.log(balance)

  dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance })

  balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18)
  dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance })

  balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
  dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance })
}

//Transfer tokens ( deposit & withdraw)

export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
  let transaction

  console.log('1')
  dispatch({ type: 'TRANSFER_REQUEST' })
  console.log('2')

  try {
    const signer = await provider.getSigner()
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)
    // console.log(amountToTransfer)

    transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
    // console.log(transaction)
    await transaction.wait()
    transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)

    await transaction.wait()
  } catch (error) {
    console.error(error)
    dispatch({ type: 'TRANSFER_FAIL' })
  }

}