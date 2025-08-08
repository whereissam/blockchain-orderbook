import { useEffect, useState, useMemo, useCallback } from 'react'
import useProviderStore from '../store/providerStore'
import useTokensStore from '../store/tokensStore'
import useExchangeStore from '../store/exchangeStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import '../App.css'

import SSS from '../assets/SSS.svg'
import eth from '../assets/eth.svg'

import {
  loadBalances,
  transferTokens,
  loadProvider,
  loadAccount,
  claimTestTokens
} from '../store/interactions'

// Connection status component
const ConnectionStatus = ({ isConnected, hasTokens, message, actionText, onAction, isLoading }) => (
  <div className="connection-status bg-card border border-border rounded-lg p-4 mb-4">
    <div className="status-indicator flex items-center gap-3">
      <div className={`status-dot w-3 h-3 rounded-full ${isConnected && hasTokens ? 'bg-green-500 animate-pulse' : isLoading ? 'bg-yellow-500 animate-bounce' : 'bg-orange-500'}`}></div>
      <span className="status-text">{message}</span>
    </div>
    {(!isConnected || !hasTokens) && actionText ? (
      <Button 
        variant={isConnected && hasTokens ? 'default' : isLoading ? 'secondary' : 'outline'}
        onClick={onAction}
        disabled={isLoading}
        className="mt-3 cursor-pointer hover:bg-accent disabled:cursor-not-allowed"
      >
        {actionText}
      </Button>
    ) : null}
  </div>
)

const Balance = () => {
  const [isDeposit, setIsDeposit] = useState(true)
  const [token1TransferAmount, setToken1TransferAmount] = useState(0)
  const [token2TransferAmount, setToken2TransferAmount] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)

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

  // Memoize tokens to prevent unnecessary re-renders
  const stableTokens = useMemo(() => {
    return (!tokens || !tokens[0] || !tokens[1] || tokens[0] === null || tokens[1] === null) ? null : tokens
  }, [tokens?.[0]?.address, tokens?.[1]?.address, tokens?.length])

  // Memoize connection status calculations
  const hasTokens = useMemo(() => {
    return tokens && tokens.length >= 2 && tokens[0] && tokens[1]
  }, [tokens])

  const hasContracts = useMemo(() => {
    return hasTokens && tokens[0]?.address && tokens[1]?.address
  }, [hasTokens, tokens])

  const isReady = useMemo(() => {
    const result = isConnected && hasContracts && account && exchange && provider && stableTokens
    console.log('🔍 isReady calculation:', {
      isConnected: typeof isConnected === 'boolean' ? isConnected : `[${typeof isConnected}]`,
      hasContracts: typeof hasContracts === 'boolean' ? hasContracts : `[${typeof hasContracts}]`,
      account: typeof account === 'string' ? !!account : `[${typeof account}]`,
      exchange: typeof exchange === 'object' ? !!exchange : `[${typeof exchange}]`,
      provider: typeof provider === 'object' ? !!provider : `[${typeof provider}]`,
      stableTokens: Array.isArray(stableTokens) ? !!stableTokens : `[${typeof stableTokens}]`,
      result: typeof result === 'boolean' ? result : `[${typeof result}] ${result}`
    })
    return result
  }, [isConnected, hasContracts, account, exchange, provider, stableTokens])

  // Simple connect handler (same as Navbar) - memoized to prevent re-renders
  const connectHandler = useCallback(async () => {
    try {
      setIsConnecting(true)
      // Load provider first if it doesn't exist
      const currentProvider = provider || await loadProvider()
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
  }, [provider])

  // Network switch handler for localhost
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
              rpcUrls: ['http://127.0.0.1:8545'],
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

  // Network switch handler for Base Sepolia - memoized
  const switchToBaseSepolia = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }], // 84532 in hex
      })
    } catch (error) {
      if (error.code === 4902) {
        // Network not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x14a34',
              chainName: 'Base Sepolia',
              rpcUrls: ['https://sepolia.base.org'],
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              },
              blockExplorerUrls: ['https://sepolia.basescan.org/']
            }]
          })
        } catch (addError) {
          console.error('Failed to add Base Sepolia network:', addError)
          if (window.showToast) {
            window.showToast('Failed to add Base Sepolia network to MetaMask', 'error', 4000)
          }
        }
      } else {
        console.error('Failed to switch to Base Sepolia:', error)
        if (window.showToast) {
          window.showToast('Failed to switch to Base Sepolia network', 'error', 4000)
        }
      }
    }
  }, [])

  // Memoize refresh handler
  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  // Memoize deploy handler
  const handleDeploy = useCallback(() => {
    if (window.showToast) {
      window.showToast('Run: bun run deploy:ethereum-sepolia in your terminal', 'info', 6000)
    }
  }, [])

  // Memoize connection status to prevent object recreation
  const connectionStatus = useMemo(() => {
    if (!isConnected || !account) {
      return {
        message: isConnecting ? 'Connecting wallet...' : 'Connect your wallet to start trading',
        actionText: isConnecting ? 'Connecting...' : 'Connect Wallet',
        onAction: connectHandler
      }
    }
    
    // Check if on Base Sepolia network (preferred)
    if (chainId === 84532) {
      if (!hasTokens || !exchange) {
        return {
          message: 'Base Sepolia connected. Loading contracts...',
          actionText: 'Refresh',
          onAction: handleRefresh
        }
      }
      return {
        message: 'Ready to trade on Base Sepolia',
        actionText: '',
        onAction: null
      }
    }
    
    // Check if on Ethereum Sepolia network
    if (chainId === 11155111) {
      if (!hasTokens || !exchange) {
        return {
          message: 'Ethereum Sepolia detected. Deploy contracts to continue.',
          actionText: 'Deploy to Sepolia',
          onAction: handleDeploy
        }
      }
      return {
        message: 'Ready to trade on Ethereum Sepolia',
        actionText: '',
        onAction: null
      }
    }
    
    // Check if on localhost network (31337)
    if (chainId === 31337) {
      if (!hasTokens || !exchange) {
        return {
          message: 'Localhost detected. Ensure contracts are deployed.',
          actionText: 'Refresh',
          onAction: handleRefresh
        }
      }
      return {
        message: 'Ready to trade on localhost',
        actionText: '',
        onAction: null
      }
    }
    
    // Wrong network - suggest Base Sepolia
    return {
      message: `Wrong network detected (${chainId}). Switch to Base Sepolia for best experience.`,
      actionText: 'Switch to Base Sepolia',
      onAction: switchToBaseSepolia
    }
  }, [isConnected, account, isConnecting, connectHandler, chainId, hasTokens, exchange, handleRefresh, handleDeploy, switchToBaseSepolia])

  const handleTabChange = useCallback((value) => {
    setIsDeposit(value === 'deposit')
  }, [])

  const amountHandler = useCallback((e, token) => {
    if (!isReady || !stableTokens) return

    if (token?.address === stableTokens[0]?.address) {
      setToken1TransferAmount(e.target.value)
    } else {
      setToken2TransferAmount(e.target.value)
    }
  }, [isReady, stableTokens])

  //Step 1 : do transfer
  //Step 2 : Notify app that transfer is pending
  //Step 3 : Get confirmation from blockchain that transfer was successful
  //Step 4 : Notify app that transfer was successful
  //Step 5 : Handle transfer fails = notify app

  const depositHandler = useCallback((e, token) => {
    e.preventDefault()
    
    // Basic validation - only prevent null/undefined cases
    if (!provider || !exchange || !token || !stableTokens) {
      window.showToast && window.showToast('Contracts not loaded yet', 'error', 3000)
      return
    }
    
    const tokenIndex = token.address === stableTokens[0].address ? 0 : 1
    const amount = tokenIndex === 0 ? token1TransferAmount : token2TransferAmount
    
    if (!amount || parseFloat(amount) <= 0) {
      window.showToast && window.showToast('Please enter a valid amount', 'error', 3000)
      return
    }
    
    // Let the transaction proceed - real errors will be caught and shown by transferTokens
    console.log('Attempting deposit:', { token: token.address, amount })
    
    if (token.address === stableTokens[0].address) {
      transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount)
      setToken1TransferAmount(0)
    } else {
      transferTokens(provider, exchange, 'Deposit', token, token2TransferAmount)
      setToken2TransferAmount(0)
    }
  }, [provider, exchange, stableTokens, token1TransferAmount, token2TransferAmount])

  const withdrawHandler = useCallback((e, token) => {
    e.preventDefault()
    if (!stableTokens || !provider || !exchange) return
    
    if (token.address === stableTokens[0].address) {
      transferTokens(provider, exchange, 'Withdraw', token, token1TransferAmount)
      setToken1TransferAmount(0)
    } else {
      transferTokens(provider, exchange, 'Withdraw', token, token2TransferAmount)
      setToken2TransferAmount(0)
    }
  }, [provider, exchange, stableTokens, token1TransferAmount, token2TransferAmount])

  // Memoized callback for loading balances - simplified dependencies
  const loadBalancesCallback = useCallback(async () => {
    console.log('loadBalancesCallback called:', {
      exchange: !!exchange,
      exchangeAddress: exchange?.address || exchange?.target,
      exchangeType: typeof exchange,
      exchangeConstructor: exchange?.constructor?.name,
      hasBalanceOfMethod: typeof exchange?.balanceOf,
      stableTokens: !!stableTokens,
      stableTokensAddresses: stableTokens?.map(t => t?.address || t?.target),
      account: !!account,
      willLoad: !!(exchange && stableTokens && account)
    })
    
    if (exchange && stableTokens && account) {
      setIsLoadingBalances(true)
      try {
        console.log('About to call loadBalances...')
        await loadBalances(exchange, stableTokens, account)
        console.log('loadBalances completed successfully')
      } catch (error) {
        console.error('Failed to load balances:', error)
      } finally {
        setIsLoadingBalances(false)
      }
    } else {
      console.log('Skipping balance load - missing requirements')
    }
  }, [exchange?.address, stableTokens?.[0]?.address, stableTokens?.[1]?.address, account])

  // Token claim handlers
  const handleClaimSSS = useCallback(async () => {
    if (!provider || !stableTokens?.[0]) return
    
    try {
      await claimTestTokens(provider, stableTokens[0].address, symbols?.[0] || 'SSS')
      // Reload balances after claiming
      setTimeout(() => {
        loadBalancesCallback()
      }, 2000)
    } catch (error) {
      console.error('Error claiming SSS:', error)
    }
  }, [provider, stableTokens, symbols, loadBalancesCallback])

  const handleClaimETH = useCallback(async () => {
    if (!provider || !stableTokens?.[1]) return
    
    try {
      await claimTestTokens(provider, stableTokens[1].address, symbols?.[1] || 'mETH')
      // Reload balances after claiming
      setTimeout(() => {
        loadBalancesCallback()
      }, 2000)
    } catch (error) {
      console.error('Error claiming mETH:', error)
    }
  }, [provider, stableTokens, symbols, loadBalancesCallback])

  useEffect(() => {
    loadBalancesCallback()
  }, [loadBalancesCallback, transferInProgress])

  return (
    <div className="component exchange__transfers">
      <div className="flex justify-between items-center p-6 border-b border-border">
        <h2>Balance</h2>
        <Tabs value={isDeposit ? 'deposit' : 'withdraw'} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
        </Tabs>
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
        <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-6 m-6">
          <h3 className="mb-4 text-destructive">Setup Required</h3>
          
          {/* Debug info - remove this once working */}
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            <strong>Debug Info:</strong><br/>
            Connected: {String(isConnected)} | Account: {account ? '✓' : '✗'} | Provider: {provider ? '✓' : '✗'}<br/>
            Exchange: {exchange ? '✓' : '✗'} | Tokens: {tokens?.length || 0} | StableTokens: {stableTokens ? '✓' : '✗'}<br/>
            HasTokens: {String(hasTokens)} | HasContracts: {String(hasContracts)} | IsReady: {String(isReady)}
          </div>
          {chainId === 84532 ? (
            // Base Sepolia network - show Base Sepolia setup
            <div>
              <p><strong>🌐 Base Sepolia Setup (Recommended)</strong></p>
              <ol>
                <li>✅ Connected to Base Sepolia</li>
                <li>Get Base Sepolia ETH from faucet: <a href="https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet" target="_blank" rel="noopener noreferrer">Coinbase Base Faucet</a></li>
                <li>Contracts are already deployed! 🎉</li>
                <li>Get test tokens: <code>bun run seed:base-sepolia</code></li>
                <li>Add SSS token to MetaMask: <code>0x4cC9e56C00a7b94424D94231bF5B603a32a0BF6D</code></li>
              </ol>
            </div>
          ) : chainId === 11155111 ? (
            // Ethereum Sepolia network - show Ethereum Sepolia setup
            <div>
              <p><strong>🌐 Ethereum Sepolia Setup</strong></p>
              <ol>
                <li>Get Ethereum Sepolia ETH from faucet: <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer">sepoliafaucet.com</a></li>
                <li>Deploy contracts: <code>bun run deploy:ethereum-sepolia</code></li>
                <li>Seed test data: <code>bun run seed:ethereum-sepolia</code></li>
                <li>Import tokens manually in MetaMask using contract addresses</li>
              </ol>
              <p><small>💡 <strong>Recommended:</strong> Use Base Sepolia for better experience and pre-deployed contracts.</small></p>
              <Button variant="default" onClick={switchToBaseSepolia} className="mt-3">
                Switch to Base Sepolia (Recommended)
              </Button>
            </div>
          ) : chainId === 31337 ? (
            // Localhost network - show localhost setup
            <div>
              <p><strong>🏠 Localhost Development Setup</strong></p>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded p-3 my-3">
                <p><strong>✅ Connected to Localhost (Chain ID: 31337)</strong></p>
              </div>
              <ol className="space-y-1">
                <li>✅ Network connected successfully</li>
                <li>✅ Using test account with 10,000 ETH</li>
                <li>✅ Contracts deployed to local blockchain</li>
                <li>✅ Test data seeded</li>
              </ol>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded">
                <p><strong>📝 Contract Addresses:</strong></p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>SSS Token: <code>0x5FbDB2315678afecb367f032d93F642f64180aa3</code></li>
                  <li>mETH Token: <code>0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512</code></li>
                  <li>Exchange: <code>0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9</code></li>
                </ul>
              </div>
              <p className="mt-3"><strong>🎉 Ready to trade!</strong> All contracts are loaded and you have test tokens.</p>
            </div>
          ) : (
            // Other networks - show network selection
            <div>
              <p><strong>🚀 Choose Your Network</strong></p>
              <div className="flex gap-3 my-4 flex-wrap">
                <Button variant="default" onClick={switchToBaseSepolia}>
                  Base Sepolia (Recommended)
                </Button>
                <Button variant="secondary" onClick={switchToLocalhost}>
                  Localhost Development
                </Button>
              </div>
              <p><small>Base Sepolia has contracts already deployed. Localhost requires manual deployment.</small></p>
            </div>
          )}
        </div>
      )}

      {/* Token Faucet Helper */}
      {isReady && tokenBalances && (parseFloat(tokenBalances[0]) === 0 || parseFloat(tokenBalances[1]) === 0) && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h4 className="mb-2 text-primary">🪙 Need Tokens?</h4>
          <p className="mb-3 text-muted-foreground">You need tokens in your wallet before you can deposit them to the exchange.</p>
          <div className="flex gap-3 flex-wrap mb-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.showToast) {
                  window.showToast('Run: bun run seed:base-sepolia in your terminal to get test tokens', 'info', 8000)
                }
              }}
            >
              Get Test Tokens (CLI)
            </Button>
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => {
                if (window.showToast) {
                  window.showToast('Add token to MetaMask: SSS = 0x4cC9e56C00a7b94424D94231bF5B603a32a0BF6D', 'info', 10000)
                }
              }}
            >
              Add SSS Token to MetaMask
            </Button>
          </div>
          <small className="text-muted-foreground">The CLI command will send tokens directly to your connected wallet address.</small>
        </div>
      )}

      {/* Deposit/Withdraw Component 1 (SSS) */}
      <div className={`p-6 space-y-6 ${!isReady ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className='space-y-4 p-6 bg-muted/30 rounded-lg'>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-medium">TOKEN:</span>
            <div className="flex items-center gap-2">
              <img src={SSS} alt="Token Logo" className="w-6 h-6" />
              <span className="font-semibold">{symbols && symbols[0] || 'SSS'}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground font-medium">WALLET:</span>
              <p className="font-mono text-lg font-semibold">
                {isLoadingBalances ? 'Updating...' : 
                  (tokenBalances && tokenBalances[0] !== undefined ? 
                    (typeof tokenBalances[0] === 'string' ? tokenBalances[0] : tokenBalances[0].toString()) : 
                    (!isReady ? 'Loading...' : '0.0'))}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClaimSSS}
              disabled={!isConnected || !provider}
              className="text-xs cursor-pointer hover:bg-accent w-full sm:w-auto flex-shrink-0"
            >
              🪙 Claim {symbols?.[0] || 'SSS'}
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-medium">EXCHANGE:</span>
            <p className="font-mono text-lg font-semibold">
              {isLoadingBalances ? 'Updating...' : 
                (exchangeBalances && exchangeBalances[0] !== undefined ? 
                  (typeof exchangeBalances[0] === 'string' ? exchangeBalances[0] : exchangeBalances[0].toString()) : 
                  (!isReady ? 'Loading...' : '0.0'))}
            </p>
          </div>
        </div>

        <form onSubmit={isReady && stableTokens ? (isDeposit ? (e) => depositHandler(e, stableTokens[0]) : (e => withdrawHandler(e, stableTokens[0]))) : (e) => e.preventDefault()} className="space-y-4">
          <div>
            <label htmlFor="token0" className="block mb-2">{symbols && symbols[0] || 'SSS'} Amount</label>
            <Input
              type="text"
              id='token0'
              placeholder={isReady ? '0.0000' : 'Connect wallet first...'}
              value={token1TransferAmount === 0 ? '' : token1TransferAmount}
              onChange={(e) => amountHandler(e, stableTokens && stableTokens[0])}
              disabled={!isReady}
            />
            {!isReady && (
              <small className="block mt-1 italic text-destructive">
                {!isConnected ? 'Connect your wallet to enable trading' : 'Loading contracts...'}
              </small>
            )}
          </div>

          <Button 
            type='submit' 
            disabled={transferInProgress || !isReady}
            className="w-full cursor-pointer hover:opacity-90 disabled:cursor-not-allowed"
            variant={transferInProgress ? 'outline' : isReady ? (isDeposit ? 'default' : 'secondary') : 'outline'}
          >
            {transferInProgress ? 'Processing...' : !isReady ? 'Setup Required' : isDeposit ? 'Deposit' : 'Withdraw'}
          </Button>
        </form>
      </div>

      <div className="relative my-6">
        <div className="border-t border-border mx-6"></div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-3">
          <span className="text-xs text-muted-foreground font-medium">• • •</span>
        </div>
      </div>

      {/* Deposit/Withdraw Component 2 (mETH) */}
      <div className={`p-6 space-y-6 ${!isReady ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className='space-y-4 p-6 bg-muted/30 rounded-lg'>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-medium">TOKEN:</span>
            <div className="flex items-center gap-2">
              <img src={eth} alt="Token Logo" className="w-6 h-6" />
              <span className="font-semibold">{symbols && symbols[1] || 'mETH'}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground font-medium">WALLET:</span>
              <p className="font-mono text-lg font-semibold">
                {isLoadingBalances ? 'Updating...' : 
                  (tokenBalances && tokenBalances[1] !== undefined ? tokenBalances[1] : 
                    (!isReady ? 'Loading...' : '0'))}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClaimETH}
              disabled={!isConnected || !provider}
              className="text-xs cursor-pointer hover:bg-accent w-full sm:w-auto flex-shrink-0"
            >
              🪙 Claim {symbols?.[1] || 'mETH'}
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-medium">EXCHANGE:</span>
            <p className="font-mono text-lg font-semibold">
              {isLoadingBalances ? 'Updating...' : 
                (exchangeBalances && exchangeBalances[1] !== undefined ? exchangeBalances[1] : 
                  (!isReady ? 'Loading...' : '0'))}
            </p>
          </div>
        </div>

        <form onSubmit={isReady && stableTokens ? (isDeposit ? (e) => depositHandler(e, stableTokens[1]) : (e => withdrawHandler(e, stableTokens[1]))) : (e) => e.preventDefault()} className="space-y-4">
          <div>
            <label htmlFor="token1" className="block mb-2">{symbols && symbols[1] || 'mETH'} Amount</label>
            <Input
              type="text"
              id='token1'
              placeholder={isReady ? '0.0000' : 'Connect wallet first...'}
              onChange={(e) => amountHandler(e, stableTokens && stableTokens[1])}
              value={token2TransferAmount === 0 ? '' : token2TransferAmount}
              disabled={!isReady}
            />
            {!isReady && (
              <small className="block mt-1 italic text-destructive">
                {!isConnected ? 'Connect your wallet to enable trading' : 'Loading contracts...'}
              </small>
            )}
          </div>

          <Button 
            type='submit' 
            disabled={transferInProgress || !isReady}
            className="w-full cursor-pointer hover:opacity-90 disabled:cursor-not-allowed"
            variant={transferInProgress ? 'outline' : isReady ? (isDeposit ? 'default' : 'secondary') : 'outline'}
          >
            {transferInProgress ? 'Processing...' : !isReady ? 'Setup Required' : isDeposit ? 'Deposit' : 'Withdraw'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Balance
