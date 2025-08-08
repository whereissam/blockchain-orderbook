import { useState } from 'react'
import { Button } from './ui/button'
import { useToast } from '../hooks/useToast'
import config from '../config.json'
import '../App.css'

const LocalSetup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { showToast } = useToast()
  
  const localConfig = config['31337']
  const testAccount = {
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    showToast(`${label} copied to clipboard!`, 'success', 2000)
  }

  const addLocalNetwork = async () => {
    if (!window.ethereum) {
      showToast('MetaMask not detected', 'error', 4000)
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x7A69',
          chainName: 'Localhost 8545',
          rpcUrls: ['http://127.0.0.1:8545'],
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
          }
        }]
      })
      showToast('Local network added successfully!', 'success', 3000)
    } catch (error) {
      console.error('Failed to add network:', error)
      showToast('Failed to add network. Please add manually.', 'error', 4000)
    }
  }

  if (!isOpen) {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 1000 
      }}>
        <Button 
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          style={{
            backgroundColor: 'var(--color-grey)',
            border: '1px solid var(--color-grey)',
            color: 'var(--color-white)',
            backdropFilter: 'blur(10px)'
          }}
        >
          ℹ️ Local Setup
        </Button>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--color-grey)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        color: 'var(--color-white)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: 'var(--color-white)' }}>🚀 Local Development Setup</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(false)}
            style={{ color: 'var(--color-white)' }}
          >
            ✕
          </Button>
        </div>

        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'var(--color-green)', borderRadius: '6px' }}>
          <strong>✅ All order scenarios tested and working:</strong> Buy orders, sell orders, order filling, and fee calculations are all functional.
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--color-white)', marginBottom: '10px' }}>1. Add Local Network</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
            <Button 
              onClick={addLocalNetwork}
              size="sm"
              style={{ backgroundColor: 'var(--color-blue)', color: 'white' }}
            >
              Add Localhost Network
            </Button>
            <span style={{ 
              backgroundColor: 'var(--color-grey)', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '12px',
              border: '1px solid var(--color-border)'
            }}>
              Chain ID: 31337
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text)', margin: 0 }}>
            Or manually add: RPC URL <code style={{ backgroundColor: 'var(--color-background)', padding: '2px 4px', borderRadius: '3px' }}>http://127.0.0.1:8545</code>, Chain ID <code style={{ backgroundColor: 'var(--color-background)', padding: '2px 4px', borderRadius: '3px' }}>31337</code>
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--color-white)', marginBottom: '10px' }}>2. Import Test Account</h3>
          <div style={{ backgroundColor: 'var(--color-background)', padding: '12px', borderRadius: '6px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Private Key:</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(testAccount.privateKey, 'Private key')}
                style={{ color: 'var(--color-white)' }}
              >
                📋
              </Button>
            </div>
            <code style={{ 
              fontSize: '11px', 
              wordBreak: 'break-all', 
              backgroundColor: 'var(--color-grey)', 
              padding: '8px', 
              borderRadius: '4px', 
              display: 'block',
              border: '1px solid var(--color-border)'
            }}>
              {testAccount.privateKey}
            </code>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Address:</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(testAccount.address, 'Address')}
                style={{ color: 'var(--color-white)' }}
              >
                📋
              </Button>
            </div>
            <code style={{ 
              fontSize: '11px', 
              backgroundColor: 'var(--color-grey)', 
              padding: '8px', 
              borderRadius: '4px', 
              display: 'block',
              border: '1px solid var(--color-border)'
            }}>
              {testAccount.address}
            </code>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-yellow)', padding: '8px', backgroundColor: 'rgba(255,193,7,0.1)', borderRadius: '4px' }}>
            ⚠️ This is a well-known test account. Never use it with real funds!
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--color-white)', marginBottom: '10px' }}>3. Current Contract Addresses</h3>
          <div style={{ fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>SSS Token:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={{ fontSize: '11px', backgroundColor: 'var(--color-background)', padding: '4px 8px', borderRadius: '4px' }}>
                  {localConfig?.SSS?.address || 'Not deployed'}
                </code>
                {localConfig?.SSS?.address && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(localConfig.SSS.address, 'SSS address')}
                    style={{ color: 'var(--color-white)', padding: '4px' }}
                  >
                    📋
                  </Button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>mETH Token:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={{ fontSize: '11px', backgroundColor: 'var(--color-background)', padding: '4px 8px', borderRadius: '4px' }}>
                  {localConfig?.mETH?.address || 'Not deployed'}
                </code>
                {localConfig?.mETH?.address && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(localConfig.mETH.address, 'mETH address')}
                    style={{ color: 'var(--color-white)', padding: '4px' }}
                  >
                    📋
                  </Button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>Exchange:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={{ fontSize: '11px', backgroundColor: 'var(--color-background)', padding: '4px 8px', borderRadius: '4px' }}>
                  {localConfig?.exchange?.address || 'Not deployed'}
                </code>
                {localConfig?.exchange?.address && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(localConfig.exchange.address, 'Exchange address')}
                    style={{ color: 'var(--color-white)', padding: '4px' }}
                  >
                    📋
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--color-white)', marginBottom: '10px' }}>4. Getting Started</h3>
          <ol style={{ fontSize: '14px', color: 'var(--color-text)', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              Make sure Anvil is running: <code style={{ backgroundColor: 'var(--color-background)', padding: '2px 4px', borderRadius: '3px' }}>npm run node:local</code>
            </li>
            <li style={{ marginBottom: '8px' }}>Switch to "Localhost" network in the dropdown above</li>
            <li style={{ marginBottom: '8px' }}>Connect your wallet with the imported test account</li>
            <li>Start trading! You'll have abundant test tokens</li>
          </ol>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--color-white)', marginBottom: '10px' }}>✅ Tested Features</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-green)' }}>✅</span>
              <span>Order Creation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-green)' }}>✅</span>
              <span>Order Filling</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-green)' }}>✅</span>
              <span>Buy/Sell Orders</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-green)' }}>✅</span>
              <span>Fee Calculations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-green)' }}>✅</span>
              <span>Token Transfers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-green)' }}>✅</span>
              <span>Balance Updates</span>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              showToast('Check LOCALNET_SETUP.md in the project root for detailed instructions', 'info', 5000)
            }}
            style={{ 
              width: '100%', 
              backgroundColor: 'transparent', 
              border: '1px solid var(--color-border)',
              color: 'var(--color-white)'
            }}
          >
            📖 View Full Setup Guide
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LocalSetup