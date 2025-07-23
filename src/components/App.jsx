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
import Toast from './Toast'
import { useToast } from '../hooks/useToast'

function App () {
  const { toasts, showToast, removeToast } = useToast()

  // Make toast available globally
  window.showToast = showToast

  const loadBlockchainData = useCallback(async () => {
    try {
      console.log('🚀 Starting loadBlockchainData...')

      // Connect Ethers to blockchain
      const provider = loadProvider()
      console.log('Provider loaded:', provider)

      if (!provider) {
        console.log('❌ No provider available - MetaMask not detected or not connected')
        if (window.showToast) {
          window.showToast('MetaMask not detected. Please install MetaMask.', 'error', 5000)
        }
        return
      }

    //Fetch current network's chainId
    const chainId = await loadNetwork(provider)
    console.log('✅ Network loaded, chainId:', chainId)

    // Load account on initial page load
    const account = await loadAccount(provider)
    if (!account) {
      console.error('❌ Failed to load account')
      if (window.showToast) {
        window.showToast('Failed to connect to account. Please connect MetaMask.', 'error', 5000)
      }
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
      if (window.showToast) {
        window.showToast(`Unsupported network. Please switch to a supported network.`, 'error', 5000)
      }
      return
    }
    
    const SSS = config[chainId].SSS
    const mETH = config[chainId].mETH
    
    if (!SSS || !mETH) {
      console.error('❌ Token configuration missing:', { SSS: !!SSS, mETH: !!mETH })
      if (window.showToast) {
        window.showToast('Token configuration missing. Please check network settings.', 'error', 5000)
      }
      return
    }
    
    console.log('🪙 Loading tokens:', { SSS: SSS.address, mETH: mETH.address })
    const tokenResult = await loadToken(provider, [SSS.address, mETH.address])
    if (!tokenResult) {
      console.error('❌ Failed to load tokens')
      if (window.showToast) {
        window.showToast('Failed to load tokens. Please refresh the page.', 'error', 5000)
      }
    } else {
      console.log('✅ Tokens loaded successfully')
    }

    //Load exchange Contract
    const exchangeConfig = config[chainId].exchange
    if (!exchangeConfig) {
      console.error('❌ Exchange configuration missing')
      if (window.showToast) {
        window.showToast('Exchange configuration missing. Please check network settings.', 'error', 5000)
      }
      return
    }
    
    console.log('🏦 Loading exchange:', exchangeConfig.address)
    const exchange = await loadExchange(provider, exchangeConfig.address)
    if (!exchange) {
      console.error('❌ Failed to load exchange')
      if (window.showToast) {
        window.showToast('Failed to load exchange. Please refresh the page.', 'error', 5000)
      }
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
    if (window.showToast) {
      window.showToast(`Failed to load blockchain data: ${error.message}`, 'error', 5000)
    }
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

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}

    </div>
  )
}

export default App
