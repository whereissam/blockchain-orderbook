import { ethers } from 'ethers'
import TOKEN_ABI from '../abis/Token.json'
import EXCHANGE_ABI from '../abis/Exchange.json'

export const loadProvider = (dispatch) => {
  const connection = new ethers.providers.Web3Provider(window.ethereum)
  dispatch({ type: 'PROVIDER_LOADED', connection })
  console.log('loadProvider')
  return connection
}

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()
  dispatch({ type: 'NETWORK_LOADED', chainId })
  console.log('loadNetwork')
  return chainId
}

export const loadAccount = async (provider, dispatch) => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  console.log('loadAccount')

  console.log(accounts)
  const account = ethers.utils.getAddress(accounts[0])
  console.log(account)
  dispatch({ type: 'ACCOUNT_LOADED', account })

  let balance = await provider.getBalance(account)
  console.log(balance)
  balance = ethers.utils.formatEther(balance)
  console.log(balance)

  dispatch({ type: 'ETHER_BALANCE_LOADED', balance })

  return account
}

export const loadToken = async (provider, addresses, dispatch) => {
  let token, symbol

  token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
  symbol = await token.symbol()
  dispatch({ type: 'TOKEN_1_LOADED', token, symbol })

  token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
  symbol = await token.symbol()
  dispatch({ type: 'TOKEN_2_LOADED', token, symbol })

  return token
}

export const loadExchange = async (provider, address, dispatch) => {
  const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
  dispatch({ type: 'EXCHANGE_LOADED', exchange })

  return exchange
}