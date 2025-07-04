import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import config from '../config.json'

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadToken,
  loadExchange,
  subscribeToEvents,
  loadAllOrders,
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
  const dispatch = useDispatch()
  const { toasts, showToast, removeToast } = useToast()

  // Make toast available globally
  window.showToast = showToast

  const loadBlockchainData = async () => {

    // Connect Ethers to blockchain
    const provider = loadProvider(dispatch)
    console.log(provider)

    //Fetch current network's chainId
    const chainId = await loadNetwork(provider, dispatch)

    //Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    //Fetch current account & balance from Metamask
    window.ethereum.on('accountsChanged', async () => {
      await loadAccount(provider, dispatch)
    })

    // Token Smart Contract
    console.log(config)
    
    // Check if config exists for current chain
    if (!config[chainId]) {
      console.error(`No configuration found for chain ID: ${chainId}`)
      if (window.showToast) {
        window.showToast(`Unsupported network. Please switch to a supported network.`, 'error', 5000)
      }
      return
    }
    
    const SSS = config[chainId].SSS
    const mETH = config[chainId].mETH
    
    if (!SSS || !mETH) {
      console.error('Token configuration missing')
      return
    }
    
    await loadToken(provider, [SSS.address, mETH.address], dispatch)

    //Load exchange Contract
    const exchangeConfig = config[chainId].exchange
    if (!exchangeConfig) {
      console.error('Exchange configuration missing')
      return
    }
    
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)
    // console.log(exchange.address)

    //Fetch all orders: open, filled, cancelled
    loadAllOrders(provider, exchange, dispatch)

    //Listen to events
    subscribeToEvents(exchange, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

          <Order />

        </section>
        <section className='exchange__section--right grid'>

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
