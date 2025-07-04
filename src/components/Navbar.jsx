import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import Blockies from 'react-blockies'
import { loadProvider, loadAccount } from '../store/interactions'
import config from '../config.json'
import logo from '../assets/logo.png'
import eth from '../assets/eth.svg'
const Navbar = () => {
  const provider = useSelector(state => state.provider.connection)
  const chainId = useSelector(state => state.provider.chainId)
  const account = useSelector(state => state.provider.account)
  const balance = useSelector(state => state.provider.balance)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false)

  const dispatch = useDispatch()
  const connectHandler = async () => {
    try {
      // Load provider first if it doesn't exist
      const currentProvider = provider || loadProvider(dispatch)
      // Then load account
      await loadAccount(currentProvider, dispatch)
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
    dispatch({ type: 'ACCOUNT_DISCONNECTED' })
    dispatch({ type: 'PROVIDER_DISCONNECTED' })
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
      setShowNetworkDropdown(false)
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
          <div className="network-dropdown">
            <div className="network-button" onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}>
              {getNetworkName(chainId)}
            </div>
            {showNetworkDropdown && (
              <div className="network-menu">
                <button onClick={() => {
                  console.log('Localhost button clicked')
                  networkHandler('0x7A69')
                }}>
                  Localhost
                </button>
                <button onClick={() => {
                  console.log('Sepolia button clicked')
                  networkHandler('0xAA36A7')
                }}>
                  Sepolia
                </button>
              </div>
            )}
          </div>
        )}

      </div>
      <div className='exchange__header--account flex'>
        {balance ? (
          <p><small>My Balance</small>{Number(balance).toFixed(4)}</p>
        ) : (
          <p><small>My Balance</small>0 ETH</p>
        )}
        {account ? (
          <div className="wallet-dropdown">
            <div className="wallet-button" onClick={() => setShowDropdown(!showDropdown)}>
              {account.slice(0, 5) + '...' + account.slice(38, 42)}
              <Blockies
                seed={account}
                size={10}
                scale={3}
                color="#2187D0"
                bgColor="#F1F2F9"
                spotColor="#767F92"
                className="identicon"
              />
            </div>
            {showDropdown && (
              <div className="wallet-menu">
                <button onClick={() => { copyAddressHandler(); setShowDropdown(false); }}>
                  Copy Address
                </button>
                <a 
                  href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : `#`}
                  target='_blank'
                  rel='noreferrer'
                  onClick={() => setShowDropdown(false)}
                >
                  View on Explorer
                </a>
                <button onClick={() => { disconnectHandler(); setShowDropdown(false); }} className="disconnect">
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="button" onClick={connectHandler}>Connect</button>
        )}
      </div>
    </div>
  )

}

export default Navbar