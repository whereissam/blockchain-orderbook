import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import config from '../config.json'

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadToken,
  loadExchange
} from '../store/interactions'

import Navbar from './Navbar'
import Markets from './Market'

function App () {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {

    // Connect Ethers to blockchain
    const provider = loadProvider(dispatch)

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
    const SSS = config[chainId].SSS
    const mETH = config[chainId].mETH
    await loadToken(provider, [SSS.address, mETH.address], dispatch)

    //Load exchange Contract
    const exchangeConfig = config[chainId].exchange
    const exchange = await loadExchange(provider, exchangeConfig, dispatch)
    console.log(exchange.address)
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

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  )
}

export default App
