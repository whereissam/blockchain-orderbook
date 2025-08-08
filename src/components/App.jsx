import { useEffect, useCallback } from 'react'
import config from '../config.json'

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadToken,
  loadExchange,
  subscribeToEvents,
  loadAllOrders,
  loadAllOrdersWithHistory,
  loadBalances,
} from '../store/interactions'

import useTokensStore from '../store/tokensStore'

import Navbar from './Navbar'
import Markets from './Market'
import Balance from './Balance'
import Order from './Order'
import OrderBook from './OrderBook'
import PriceChart from './PriceChart'
import Trades from './Trade'
import Transactions from './Transaction'
import Alert from './Alert'
import LocalSetup from './LocalSetup'
import { Toaster } from './ui/sonner'
import '../utils/toast.js' // This sets up the global toast functions

function App () {

  const loadBlockchainData = useCallback(async () => {
    let provider, exchange, tokenResult // Declare in outer scope
    
    try {
      console.log('🚀 Starting loadBlockchainData...')

      // Connect Ethers to blockchain
      provider = await loadProvider()
      console.log('Provider loaded:', provider)

      if (!provider) {
        console.log('❌ No provider available - MetaMask not detected or not connected')
        console.error('❌ MetaMask not detected')
        alert('MetaMask not detected. Please install MetaMask extension.')
        return
      }

    //Fetch current network's chainId
    const chainId = await loadNetwork(provider)
    console.log('✅ Network loaded, chainId:', chainId)

    // Try to load account if already connected, but don't force connection
    let account = null
    try {
      // Only check existing accounts, don't request permission
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        account = await loadAccount(provider)
        console.log('✅ Account already connected:', account)
      } else {
        console.log('ℹ️ No wallet connected yet - orders will load without wallet')
      }
    } catch (error) {
      console.log('ℹ️ Could not check wallet connection, continuing without wallet')
    }

    //Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    //Fetch current account & balance from Metamask
    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        const newAccount = await loadAccount(provider)
        // Load balances for the new account
        if (newAccount && exchange && tokenResult) {
          await loadBalances(exchange, useTokensStore.getState().contracts, newAccount)
        }
      }
    })

    console.log('🔍 About to load tokens...')
    
    // Token Smart Contract
    console.log('📋 Config:', config)
    
    // Check if config exists for current chain
    if (!config[chainId]) {
      console.error(`❌ No configuration found for chain ID: ${chainId}`)
      console.error(`❌ Unsupported network: ${chainId}`)
      alert(`Unsupported network. Please switch to a supported network.`)
      return
    }
    
    const SSS = config[chainId].SSS
    const mETH = config[chainId].mETH
    
    if (!SSS || !mETH) {
      console.error('❌ Token configuration missing:', { SSS: !!SSS, mETH: !!mETH })
      console.error('❌ Token configuration missing')
      alert('Token configuration missing. Please check network settings.')
      return
    }
    
    console.log('🪙 Loading tokens:', { SSS: SSS.address, mETH: mETH.address })
    tokenResult = await loadToken(provider, [SSS.address, mETH.address])
    if (!tokenResult) {
      console.error('❌ Failed to load tokens')
      console.error('❌ Failed to load tokens')
      alert('Failed to load tokens. Please refresh the page.')
    } else {
      console.log('✅ Tokens loaded successfully')
    }

    //Load exchange Contract
    const exchangeConfig = config[chainId].exchange
    if (!exchangeConfig) {
      console.error('❌ Exchange configuration missing')
      console.error('❌ Exchange configuration missing')
      alert('Exchange configuration missing. Please check network settings.')
      return
    }
    
    console.log('🏦 Loading exchange:', exchangeConfig.address)
    exchange = await loadExchange(provider, exchangeConfig.address)
    if (!exchange) {
      console.error('❌ Failed to load exchange')
      console.error('❌ Failed to load exchange')
      alert('Failed to load exchange. Please refresh the page.')
      return
    }
    console.log('✅ Exchange loaded:', exchange.address || exchange.target)

    //Fetch all orders: open, filled, cancelled (including historical data)
    // Load orders regardless of wallet connection status
    console.log('📊 Loading orders with historical data...')
    await loadAllOrdersWithHistory(provider, exchange)

    //Listen to events
    console.log('👂 Subscribing to events...')
    subscribeToEvents(exchange)
    
    console.log('🎉 Blockchain data loaded successfully!')
    
    // Load balances only if account is connected
    if (account && tokenResult) {
      console.log('💰 Loading balances...')
      await loadBalances(exchange, useTokensStore.getState().contracts, account)
    }
  } catch (error) {
    console.error('❌ Error in loadBlockchainData:', error)
    console.error('❌ Failed to load blockchain data:', error.message)
    alert(`Failed to load blockchain data: ${error.message}`)
  }
}, [])

  useEffect(() => {
    loadBlockchainData()
  }, [loadBlockchainData])

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left'>

          <Markets />

          <Balance />

          <Order />

        </section>
        <section className='exchange__section--right'>

          <PriceChart />

          <Transactions />

          <Trades />

          <OrderBook />

        </section>
      </main>

      <Alert />

      {/* Local Development Setup */}
      <LocalSetup />

      {/* Sonner Toast Notifications */}
      <Toaster position="top-right" richColors />

    </div>
  )
}

export default App
