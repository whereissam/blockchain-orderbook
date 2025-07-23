import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const useTokensStore = create(
  subscribeWithSelector(
    immer((set, get) => ({
      // State
      loaded: false,
      contracts: [],
      symbols: [],
      balances: [],

      // Actions
      loadToken1: (token, symbol) => set((state) => {
        console.log('🔍 loadToken1 called with:', { 
          hasToken: !!token, 
          tokenTarget: token?.target, 
          symbol,
          isError: symbol === 'ERROR'
        })
        if (token && symbol && symbol !== 'ERROR') {
          state.loaded = true
          state.contracts = [token]
          state.symbols = [symbol]
          console.log('✅ Token1 stored in state')
        } else {
          console.log('❌ Token1 not stored - failed validation')
        }
      }),
      
      loadToken2: (token, symbol) => set((state) => {
        console.log('🔍 loadToken2 called with:', { 
          hasToken: !!token, 
          tokenTarget: token?.target, 
          symbol,
          isError: symbol === 'ERROR',
          currentContractsLength: state.contracts.length
        })
        if (token && symbol && symbol !== 'ERROR') {
          state.loaded = true
          state.contracts.push(token)
          state.symbols.push(symbol)
          console.log('✅ Token2 stored in state, total contracts:', state.contracts.length)
        } else {
          console.log('❌ Token2 not stored - failed validation')
        }
      }),
      
      loadToken1Balance: (balance) => set((state) => {
        state.balances = [balance]
      }),
      
      loadToken2Balance: (balance) => set((state) => {
        state.balances.push(balance)
      }),

      // Bulk update for better performance
      loadTokens: (tokens) => set((state) => {
        state.loaded = true
        state.contracts = tokens.map(t => t.contract)
        state.symbols = tokens.map(t => t.symbol)
      }),

      updateBalances: (balances) => set((state) => {
        state.balances = balances
      }),

      // Selectors
      getToken: (index) => {
        const state = get()
        return {
          contract: state.contracts[index],
          symbol: state.symbols[index],
          balance: state.balances[index]
        }
      },

      getTokenPair: () => {
        const state = get()
        return {
          token1: {
            contract: state.contracts[0],
            symbol: state.symbols[0],
            balance: state.balances[0]
          },
          token2: {
            contract: state.contracts[1],
            symbol: state.symbols[1],
            balance: state.balances[1]
          }
        }
      },

      // Reset store
      reset: () => set((state) => {
        state.loaded = false
        state.contracts = []
        state.symbols = []
        state.balances = []
      })
    }))
  )
)

export default useTokensStore