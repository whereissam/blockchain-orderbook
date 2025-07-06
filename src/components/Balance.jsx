import { useEffect, useState, useRef } from 'react'
import useProviderStore from '../store/providerStore'
import useTokensStore from '../store/tokensStore'
import useExchangeStore from '../store/exchangeStore'

import SSS from '../assets/SSS.svg'
import eth from '../assets/eth.svg'

import {
  loadBalances,
  transferTokens,
  loadProvider,
  loadAccount
} from '../store/interactions'

// Connection status component
const ConnectionStatus = ({ isConnected, hasTokens, message, actionText, onAction, isLoading }) => (
  <div className="connection-status">
    <div className="status-indicator">
      <div className={`status-dot ${isConnected && hasTokens ? 'connected' : isLoading ? 'connecting' : 'disconnected'}`}></div>
      <span className="status-text">{message}</span>
    </div>
    {(!isConnected || !hasTokens) && actionText ? (
      <button 
        className="button button--outline" 
        onClick={onAction}
        disabled={isLoading}
      >
        {actionText}
      </button>
    ) : null}
  </div>
)

const Balance = () => {
  const [isDeposit, setIsDeposit] = useState(true)
  const [token1TransferAmount, setToken1TransferAmount] = useState(0)
  const [token2TransferAmount, setToken2TransferAmount] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)

  const provider = useProviderStore(state => state.connection)
  const account = useProviderStore(state => state.account)
  const isConnected = useProviderStore(state => state.isConnected)
  const chainId = useProviderStore(state => state.chainId)
  
  const exchange = useExchangeStore(state => state.contract)
  const exchangeBalances = useExchangeStore(state => state.balances)
  const transferInProgress = useExchangeStore(state => state.transferInProgress)
  
  const tokens = useTokensStore(state => state.contracts)
  const symbols = useTokensStore(state => state.symbols)
  const tokenBalances = useTokensStore(state => state.balances)

  // Simple connect handler (same as Navbar)
  const connectHandler = async () => {
    try {
      setIsConnecting(true)
      // Load provider first if it doesn't exist
      const currentProvider = provider || loadProvider()
      // Then load account
      await loadAccount(currentProvider)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      if (window.showToast) {
        window.showToast('Failed to connect wallet. Please check MetaMask.', 'error', 4000)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  // Calculate connection status
  const hasTokens = tokens && tokens.length >= 2
  const isReady = isConnected && hasTokens && account && exchange

  // Network switch handler
  const switchToLocalhost = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 31337 in hex
      })
    } catch (error) {
      if (error.code === 4902) {
        // Network not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7A69',
              chainName: 'Localhost 8545',
              rpcUrls: ['http://localhost:8545'],
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              }
            }]
          })
        } catch (addError) {
          console.error('Failed to add localhost network:', addError)
        }
      }
    }
  }

  // Get status message and action
  const getConnectionStatus = () => {
    if (!isConnected || !account) {
      return {
        message: isConnecting ? 'Connecting wallet...' : 'Connect your wallet to start trading',
        actionText: isConnecting ? 'Connecting...' : 'Connect Wallet',
        onAction: connectHandler
      }
    }
    
    // Check if on Sepolia network
    if (chainId === 11155111) {
      if (!hasTokens || !exchange) {
        return {
          message: 'Sepolia testnet detected. Deploy contracts to continue.',
          actionText: 'Deploy to Sepolia',
          onAction: () => {
            if (window.showToast) {
              window.showToast('Run: npm run deploy:sepolia in your terminal', 'info', 6000)
            }
          }
        }
      }
    }
    
    if (!hasTokens) {
      return {
        message: 'Loading tokens... Please ensure contracts are deployed',
        actionText: 'Refresh',
        onAction: () => window.location.reload()
      }
    }
    if (!exchange) {
      return {
        message: 'Loading exchange contract...',
        actionText: 'Refresh',
        onAction: () => window.location.reload()
      }
    }
    return {
      message: 'Ready to trade',
      actionText: '',
      onAction: null
    }
  }

  const connectionStatus = getConnectionStatus()

  const depositRef = useRef(null)
  const withdrawRef = useRef(null)

  const tabHandler = (e) => {
    if (e.target.className !== depositRef.current.className) {
      e.target.className = 'tab tab--active'
      depositRef.current.className = 'tab'
      setIsDeposit(false)
    } else {
      e.target.className = 'tab tab--active'
      withdrawRef.current.className = 'tab'
      setIsDeposit(true)

    }
  }

  const amountHandler = (e, token) => {
    if (!isReady) return

    if (token.address === tokens[0].address) {
      setToken1TransferAmount(e.target.value)
    } else {
      setToken2TransferAmount(e.target.value)
    }
  }

  //Step 1 : do transfer
  //Step 2 : Notify app that transfer is pending
  //Step 3 : Get confirmation from blockchain that transfer was successful
  //Step 4 : Notify app that transfer was successful
  //Step 5 : Handle transfer fails = notify app

  const depositHandler = (e, token) => {
    e.preventDefault()
    if (token.address === tokens[0].address) {
      transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount)
      setToken1TransferAmount(0)
    } else {
      transferTokens(provider, exchange, 'Deposit', token, token2TransferAmount)
      setToken2TransferAmount(0)

    }
  }

  const withdrawHandler = (e, token) => {
    e.preventDefault()
    if (token.address === tokens[0].address) {
      transferTokens(provider, exchange, 'Withdraw', token, token1TransferAmount)
      setToken1TransferAmount(0)
    } else {
      transferTokens(provider, exchange, 'Withdraw', token, token2TransferAmount)
      setToken2TransferAmount(0)

    }
  }

  useEffect(() => {
    if (exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account)
    }
  }, [exchange, tokens, account, transferInProgress])

  return (
    <div className='component exchange__transfers'>
      <div className='component__header flex-between'>
        <h2>Balance</h2>
        <div className='tabs'>
          <button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
          <button onClick={tabHandler} ref={withdrawRef} className='tab'>Withdraw</button>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus 
        isConnected={isConnected && hasTokens}
        hasTokens={hasTokens}
        message={connectionStatus.message}
        actionText={connectionStatus.actionText}
        onAction={connectionStatus.onAction}
        isLoading={isConnecting}
      />

      {!isReady && (
        <div className="setup-instructions">
          <h3>Setup Required</h3>
          {chainId === 11155111 ? (
            // Sepolia network - show Sepolia setup
            <div>
              <p><strong>🌐 Sepolia Testnet Setup</strong></p>
              <ol>
                <li>Get Sepolia ETH from faucet: <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer">sepoliafaucet.com</a></li>
                <li>Deploy contracts to Sepolia: <code>npm run deploy:sepolia</code></li>
                <li>Seed test data: <code>npm run seed:sepolia</code></li>
                <li>Import tokens manually in MetaMask using contract addresses</li>
              </ol>
              <p><small>💡 <strong>Alternative:</strong> For faster development, you can also switch to localhost network and run local Hardhat node.</small></p>
              <button className="button button--outline" onClick={switchToLocalhost} style={{marginTop: '10px'}}>
                Switch to Localhost Instead
              </button>
            </div>
          ) : (
            // Other networks - show general setup
            <ol>
              <li>Connect your MetaMask wallet</li>
              <li>Ensure you're on the correct network (localhost:8545 for development)</li>
              <li>Make sure smart contracts are deployed: <code>npm run deploy:local</code></li>
              <li>Seed with test data: <code>npm run seed:local</code></li>
            </ol>
          )}
        </div>
      )}

      {/* Deposit/Withdraw Component 1 (SSS) */}
      <div className={`exchange__transfers--form ${!isReady ? 'disabled' : ''}`}>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={SSS} alt="Token Logo" />{symbols && symbols[0] || 'SSS'}</p>
          <p><small>Wallet</small><br />{isReady ? (tokenBalances && tokenBalances[0]) || '0.0000' : 'Loading...'}</p>
          <p><small>Exchange</small><br />{isReady ? (exchangeBalances && exchangeBalances[0]) || '0.0000' : 'Loading...'}</p>
        </div>

        <form onSubmit={isReady ? (isDeposit ? (e) => depositHandler(e, tokens[0]) : (e => withdrawHandler(e, tokens[0]))) : (e) => e.preventDefault()}>
          <label htmlFor="token0">{symbols && symbols[0] || 'SSS'} Amount</label>
          <input
            type="text"
            id='token0'
            placeholder={isReady ? '0.0000' : 'Connect wallet first...'}
            value={token1TransferAmount === 0 ? '' : token1TransferAmount}
            onChange={(e) => amountHandler(e, tokens && tokens[0])}
            disabled={!isReady}
            className={!isReady ? 'input-disabled' : ''}
          />
          {!isReady && (
            <small className="input-help">
              {!isConnected ? 'Connect your wallet to enable trading' : 'Loading contracts...'}
            </small>
          )}

          <button 
            className='button' 
            type='submit' 
            disabled={transferInProgress || !isReady}
            title={!isReady ? 'Complete setup first' : ''}
          >
            {transferInProgress ? (
              <span>Processing...</span>
            ) : !isReady ? (
              <span>Setup Required</span>
            ) : isDeposit ? (
              <span>Deposit</span>
            ) : (
              <span>Withdraw</span>
            )}
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}
      <div className={`exchange__transfers--form ${!isReady ? 'disabled' : ''}`}>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={eth} alt="Token Logo" />{symbols && symbols[1] || 'mETH'}</p>
          <p><small>Wallet</small><br />{isReady ? (tokenBalances && tokenBalances[1]) || '0.0000' : 'Loading...'}</p>
          <p><small>Exchange</small><br />{isReady ? (exchangeBalances && exchangeBalances[1]) || '0.0000' : 'Loading...'}</p>
        </div>

        <form onSubmit={isReady ? (isDeposit ? (e) => depositHandler(e, tokens[1]) : (e => withdrawHandler(e, tokens[1]))) : (e) => e.preventDefault()}>
          <label htmlFor="token1">{symbols && symbols[1] || 'mETH'} Amount</label>
          <input
            type="text"
            id='token1'
            placeholder={isReady ? '0.0000' : 'Connect wallet first...'}
            onChange={(e) => amountHandler(e, tokens && tokens[1])}
            value={token2TransferAmount === 0 ? '' : token2TransferAmount}
            disabled={!isReady}
            className={!isReady ? 'input-disabled' : ''}
          />
          {!isReady && (
            <small className="input-help">
              {!isConnected ? 'Connect your wallet to enable trading' : 'Loading contracts...'}
            </small>
          )}

          <button 
            className='button' 
            type='submit' 
            disabled={transferInProgress || !isReady}
            title={!isReady ? 'Complete setup first' : ''}
          >
            {transferInProgress ? (
              <span>Processing...</span>
            ) : !isReady ? (
              <span>Setup Required</span>
            ) : isDeposit ? (
              <span>Deposit</span>
            ) : (
              <span>Withdraw</span>
            )}
          </button>
        </form>
      </div>

      <hr />
    </div>
  )
}

export default Balance
