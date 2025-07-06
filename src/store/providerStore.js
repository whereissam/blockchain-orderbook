import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useProviderStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    connection: null,
    chainId: null,
    account: null,
    balance: null,
    isConnected: false,

    // Actions
    loadProvider: (connection) => set({ 
      connection, 
      isConnected: true 
    }),
    
    loadNetwork: (chainId) => set({ chainId }),
    
    loadAccount: (account) => set({ account }),
    
    loadEtherBalance: (balance) => set({ balance }),
    
    
    disconnectAccount: () => set({ 
      account: null, 
      balance: null 
    }),
    
    disconnectProvider: () => set({ 
      connection: null, 
      chainId: null, 
      isConnected: false,
      account: null,
      balance: null
    }),

    // Selectors
    getConnectionStatus: () => get().isConnected && get().connection !== null,
    getAccountInfo: () => ({
      account: get().account,
      balance: get().balance,
      chainId: get().chainId
    })
  }))
)

export default useProviderStore