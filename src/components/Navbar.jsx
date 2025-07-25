import { useState } from 'react'
import Blockies from 'react-blockies'
import { loadProvider, loadAccount } from '../store/interactions'
import useProviderStore from '../store/providerStore'
import { useToast } from '../hooks/useToast'
import { Button } from '../components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import config from '../config.json'
import logo from '../assets/logo.png'
import eth from '../assets/eth.svg'
import '../App.css'

const Navbar = () => {
  const provider = useProviderStore(state => state.connection)
  const chainId = useProviderStore(state => state.chainId)
  const account = useProviderStore(state => state.account)
  const balance = useProviderStore(state => state.balance)
  const disconnectProvider = useProviderStore(state => state.disconnectProvider)
  const { showToast } = useToast()
  

  const connectHandler = async () => {
    try {
      // Load provider first if it doesn't exist
      const currentProvider = provider || await loadProvider()
      // Then load account
      await loadAccount(currentProvider)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      showToast('Failed to connect wallet. Please check MetaMask.', 'error', 4000)
    }
  }

  const copyAddressHandler = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      showToast('Address copied to clipboard', 'success', 2000)
    }
  }

  const disconnectHandler = () => {
    disconnectProvider()
  }


  const networkHandler = async (chainId) => {
    console.log('Network handler called with chainId:', chainId)
    
    if (!window.ethereum) {
      console.error('MetaMask not detected')
      showToast('MetaMask not detected. Please install MetaMask.', 'error', 4000)
      return
    }
    
    try {
      console.log('Attempting to switch to network:', chainId)
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      })
      console.log('Network switch successful')
    } catch (error) {
      console.error('Failed to switch network:', error)
      
      // If the network doesn't exist, try to add it
      if (error.code === 4902) {
        try {
          // Network configurations for different chains
          const networkConfigs = {
            '0x7A69': { // localhost
              chainId: '0x7A69',
              chainName: 'Localhost 8545',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
            },
            '0xAA36A7': { // sepolia
              chainId: '0xAA36A7',
              chainName: 'Sepolia',
              rpcUrls: ['https://rpc.sepolia.org'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            },
            '0x14a34': { // base sepolia
              chainId: '0x14a34',
              chainName: 'Base Sepolia',
              rpcUrls: ['https://sepolia.base.org'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://sepolia-explorer.base.org']
            }
          }
          
          const networkConfig = networkConfigs[chainId]
          if (networkConfig) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkConfig],
            })
            showToast('Network added and switched successfully!', 'success', 3000)
          } else {
            showToast('Network configuration not found.', 'error', 4000)
          }
        } catch (addError) {
          console.error('Failed to add network:', addError)
          showToast('Failed to add network. Please add it manually in MetaMask.', 'error', 4000)
        }
      } else {
        showToast('Failed to switch network. Please try again.', 'error', 4000)
      }
    }
  }

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 31337: return 'Localhost'
      case 11155111: return 'Sepolia'
      case 84532: return 'Base Sepolia'
      default: return 'Unknown'
    }
  }

  return (
    <div className='exchange__header grid'>
      <div className='exchange__header--brand flex'>
        <img src={logo} className="logo" alt="DApp Logo"></img>
        <h1>SSS Token Exchange</h1>
      </div>
      <div className='exchange__header--networks flex'>
        <img src={eth} alt="ETH Logo" className='Eth Logo' />

        {chainId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-secondary border-border">
                {getNetworkName(chainId)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => networkHandler('0x7A69')}>
                Localhost
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => networkHandler('0xAA36A7')}>
                Sepolia
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => networkHandler('0x14a34')}>
                Base Sepolia
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

      </div>
      <div className='exchange__header--account flex'>
        {balance ? (
          <p><small>My Balance</small>{Number(balance).toFixed(4)}</p>
        ) : (
          <p><small>My Balance</small>0 ETH</p>
        )}
        {account ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="flex items-center gap-3 h-12">
                {account.slice(0, 5) + '...' + account.slice(38, 42)}
                <Blockies
                  seed={account}
                  size={10}
                  scale={3}
                  color="#60a5fa"
                  bgColor="#1e293b"
                  spotColor="#94a3b8"
                  className="identicon rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => copyAddressHandler()}>
                Copy Address
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a 
                  href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : `#`}
                  target='_blank'
                  rel='noreferrer'
                  className="w-full"
                >
                  View on Explorer
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={disconnectHandler} className="text-destructive focus:text-destructive">
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={connectHandler}>Connect</Button>
        )}
      </div>
    </div>
  )

}

export default Navbar