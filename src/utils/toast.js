import { toast } from 'sonner'

// Enhanced toast utility with better UX and different colors for different situations
export const showToast = {
  // Success toast - green color
  success: (message, options = {}) => {
    toast.success(message, {
      duration: options.duration || 4000,
      ...options
    })
  },

  // Error toast - red color
  error: (message, options = {}) => {
    toast.error(message, {
      duration: options.duration || 6000,
      ...options
    })
  },

  // Warning toast - orange/yellow color
  warning: (message, options = {}) => {
    toast.warning(message, {
      duration: options.duration || 5000,
      ...options
    })
  },

  // Info toast - blue color
  info: (message, options = {}) => {
    toast.info(message, {
      duration: options.duration || 4000,
      ...options
    })
  },

  // Loading toast - for ongoing operations
  loading: (message, options = {}) => {
    return toast.loading(message, {
      duration: Infinity, // Loading toasts should not auto-dismiss
      ...options
    })
  },

  // Promise toast - handles async operations with different states
  promise: (promise, messages, options = {}) => {
    return toast.promise(promise, messages, {
      duration: 4000,
      ...options
    })
  },

  // Custom toast with action buttons
  action: (message, actionLabel, actionFn, options = {}) => {
    return toast(message, {
      action: {
        label: actionLabel,
        onClick: actionFn
      },
      duration: options.duration || 6000,
      ...options
    })
  },

  // Dismiss specific toast
  dismiss: (toastId) => {
    toast.dismiss(toastId)
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss()
  }
}

// Enhanced blockchain-specific toast messages
export const blockchainToasts = {
  // Transaction states
  transactionPending: (txHash) => {
    return showToast.loading(`Transaction pending...`, {
      description: `Hash: ${txHash?.slice(0, 10)}...`,
      id: `tx-${txHash}`
    })
  },

  transactionSuccess: (message, txHash) => {
    if (txHash) {
      showToast.dismiss(`tx-${txHash}`)
    }
    return showToast.success(message, {
      description: txHash ? `Hash: ${txHash.slice(0, 10)}...` : undefined,
      action: txHash ? {
        label: 'View',
        onClick: () => window.open(`https://sepolia.basescan.org/tx/${txHash}`, '_blank')
      } : undefined
    })
  },

  transactionError: (message, error, txHash) => {
    if (txHash) {
      showToast.dismiss(`tx-${txHash}`)
    }
    
    let errorMessage = message
    let description = undefined
    
    // Parse common error types
    if (error?.code === 'ACTION_REJECTED' || error?.message?.includes('user rejected')) {
      errorMessage = 'Transaction cancelled'
      description = 'You rejected the transaction in MetaMask'
    } else if (error?.message?.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds'
      description = 'You don\'t have enough tokens or ETH for gas'
    } else if (error?.message?.includes('gas')) {
      errorMessage = 'Gas estimation failed'
      description = 'Transaction may fail or gas price too low'
    } else if (error?.message) {
      description = error.message.slice(0, 100) + (error.message.length > 100 ? '...' : '')
    }

    return showToast.error(errorMessage, {
      description,
      duration: 8000
    })
  },

  // Connection states
  walletConnecting: () => {
    return showToast.loading('Connecting wallet...', {
      description: 'Please check MetaMask',
      id: 'wallet-connecting'
    })
  },

  walletConnected: (address) => {
    showToast.dismiss('wallet-connecting')
    return showToast.success('Wallet connected!', {
      description: `${address.slice(0, 6)}...${address.slice(-4)}`
    })
  },

  walletConnectionError: (error) => {
    showToast.dismiss('wallet-connecting')
    return showToast.error('Failed to connect wallet', {
      description: 'Please check MetaMask and try again'
    })
  },

  // Network states
  networkSwitching: (networkName) => {
    return showToast.loading(`Switching to ${networkName}...`, {
      id: 'network-switching'
    })
  },

  networkSwitched: (networkName) => {
    showToast.dismiss('network-switching')
    return showToast.success(`Switched to ${networkName}`)
  },

  networkError: (error) => {
    showToast.dismiss('network-switching')
    return showToast.error('Network switch failed', {
      description: 'Please try switching manually in MetaMask'
    })
  },

  // Token operations
  tokenClaim: (tokenSymbol, balance) => {
    if (balance > 1000) {
      return showToast.success(`You have plenty of ${tokenSymbol} tokens!`, {
        description: `Balance: ${Math.floor(balance).toLocaleString()} ${tokenSymbol}`,
        action: {
          label: 'Trade Now',
          onClick: () => {
            // Could scroll to trading section or highlight it
            console.log('Navigate to trading')
          }
        }
      })
    } else if (balance > 0) {
      return showToast.info(`Your ${tokenSymbol} balance: ${balance}`, {
        description: 'Need more tokens? Contact the deployer'
      })
    } else {
      return showToast.warning(`No ${tokenSymbol} tokens found`, {
        description: 'Contact deployer or check faucet',
        duration: 8000
      })
    }
  },

  // Order operations
  orderCreating: (type, amount, price) => {
    return showToast.loading(`Creating ${type} order...`, {
      description: `${amount} tokens at ${price} price`,
      id: 'order-creating'
    })
  },

  orderSuccess: (type, amount, price, txHash) => {
    showToast.dismiss('order-creating')
    return showToast.success(`${type} order created!`, {
      description: `${amount} tokens at ${price} price`,
      action: txHash ? {
        label: 'View Tx',
        onClick: () => window.open(`https://sepolia.basescan.org/tx/${txHash}`, '_blank')
      } : undefined
    })
  },

  orderError: (type, error) => {
    showToast.dismiss('order-creating')
    return blockchainToasts.transactionError(`Failed to create ${type} order`, error)
  }
}

// Make it available globally for backward compatibility
if (typeof window !== 'undefined') {
  window.showToast = showToast
  window.blockchainToasts = blockchainToasts
}