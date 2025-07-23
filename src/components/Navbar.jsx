import { useState } from 'react'
import Blockies from 'react-blockies'
import { loadProvider, loadAccount } from '../store/interactions'
import useProviderStore from '../store/providerStore'
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
  

  const connectHandler = async () => {
    try {
      // Load provider first if it doesn't exist
      const currentProvider = provider || loadProvider()
      // Then load account
      await loadAccount(currentProvider)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      if (window.showToast) {
        window.showToast('Failed to connect wallet. Please check MetaMask.', 'error', 4000)
      }
    }
  }

  const copyAddressHandler = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      if (window.showToast) {
        window.showToast('Address copied to clipboard', 'success', 2000)
      }
    }
  }

  const disconnectHandler = () => {
    disconnectProvider()
  }


  const networkHandler = async (chainId) => {
    console.log('Network handler called with chainId:', chainId)
    
    if (!window.ethereum) {
      console.error('MetaMask not detected')
      if (window.showToast) {
        window.showToast('MetaMask not detected. Please install MetaMask.', 'error', 4000)
      }
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
      if (window.showToast) {
        window.showToast('Failed to switch network. Please try again.', 'error', 4000)
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