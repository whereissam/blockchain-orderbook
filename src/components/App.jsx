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
} from '../store/interactions'

import Navbar from './Navbar'
import Markets from './Market'
import Balance from './Balance'
import Order from './Order'
import OrderBook from './OrderBook'
import PriceChart from './PriceChart'
import Trades from './Trade'
import Transactions from './Transaction'
import Alert from './Alert'
import { Toaster } from './ui/sonner'
import '../utils/toast.js' // This sets up the global toast functions

function App () {

  const loadBlockchainData = useCallback(async () => {
    try {
      console.log('🚀 Starting loadBlockchainData...')

      // Connect Ethers to blockchain
      const provider = await loadProvider()
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

    // Load account on initial page load
    const account = await loadAccount(provider)
    if (!account) {
      console.error('❌ Failed to load account')
      console.error('❌ Failed to connect to account')
      alert('Failed to connect to account. Please connect MetaMask.')
      return
    }
    console.log('✅ Account loaded:', account)

    //Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    //Fetch current account & balance from Metamask
    window.ethereum.on('accountsChanged', async () => {
      await loadAccount(provider)
    })

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
    const tokenResult = await loadToken(provider, [SSS.address, mETH.address])
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
    const exchange = await loadExchange(provider, exchangeConfig.address)
    if (!exchange) {
      console.error('❌ Failed to load exchange')
      console.error('❌ Failed to load exchange')
      alert('Failed to load exchange. Please refresh the page.')
      return
    }
    console.log('✅ Exchange loaded:', exchange.address || exchange.target)

    //Fetch all orders: open, filled, cancelled (including historical data)
    console.log('📊 Loading orders with historical data...')
    await loadAllOrdersWithHistory(provider, exchange)

    //Listen to events
    console.log('👂 Subscribing to events...')
    subscribeToEvents(exchange)
    
    console.log('🎉 Blockchain data loaded successfully!')
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

      {/* Sonner Toast Notifications */}
      <Toaster position="top-right" richColors />

    </div>
  )
}

export default App
