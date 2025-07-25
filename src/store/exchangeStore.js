import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const useExchangeStore = create(
  subscribeWithSelector(
    immer((set, get) => ({
  loaded: false,
  contract: null,
  balances: [],
  
  transaction: {
    isSuccessful: false
  },
  
  allOrders: {
    loaded: false,
    data: []
  },
  
  cancelledOrders: {
    loaded: false,
    data: []
  },
  
  filledOrders: {
    loaded: false,
    data: []
  },
  
  events: [],
  transferInProgress: false,

  // Actions
  loadExchange: (exchange) => set((state) => {
    state.loaded = true
    state.contract = exchange
  }),

  // Orders loaded
  loadCancelledOrders: (cancelledOrders) => set((state) => {
    state.cancelledOrders.loaded = true
    state.cancelledOrders.data = cancelledOrders
  }),

  loadFilledOrders: (filledOrders) => set((state) => {
    state.filledOrders.loaded = true
    state.filledOrders.data = filledOrders
  }),

  loadAllOrders: (allOrders) => set((state) => {
    state.allOrders.loaded = true
    state.allOrders.data = allOrders
  }),

  // Exchange balances
  loadExchangeToken1Balance: (balance) => set((state) => {
    state.balances = [balance]
  }),

  loadExchangeToken2Balance: (balance) => set((state) => {
    state.balances.push(balance)
  }),

  // Cancel orders
  cancelOrderRequest: () => set((state) => {
    state.transaction = {
      transactionType: 'Cancel',
      isPending: true,
      isSuccessful: false
    }
  }),

  cancelOrderSuccess: (order, event) => set((state) => {
    state.transaction = {
      transactionType: 'Cancel',
      isPending: false,
      isSuccessful: true
    }
    state.cancelledOrders.data.push(order)
    state.events.unshift(event)
  }),

  cancelOrderFail: () => set((state) => {
    state.transaction = {
      transactionType: 'Cancel',
      isPending: false,
      isSuccessful: false,
      isError: true
    }
  }),

  // Fill orders
  fillOrderRequest: () => set((state) => {
    state.transaction = {
      transactionType: 'Fill Order',
      isPending: true,
      isSuccessful: false
    }
  }),

  fillOrderSuccess: (order, event) => set((state) => {
    // Prevent duplicate orders
    const index = state.filledOrders.data.findIndex(
      existingOrder => existingOrder.id.toString() === order.id.toString()
    )
    
    if (index === -1) {
      state.filledOrders.data.push(order)
    }

    // Set loaded flag to ensure chart updates
    state.filledOrders.loaded = true

    state.transaction = {
      transactionType: 'Fill Order',
      isPending: false,
      isSuccessful: true
    }
    state.events.unshift(event)
  }),

  fillOrderFail: () => set((state) => {
    state.transaction = {
      transactionType: 'Fill Order',
      isPending: false,
      isSuccessful: false,
      isError: true
    }
  }),

  // Transfer cases
  transferRequest: () => set((state) => {
    state.transaction = {
      transactionType: 'Transfer',
      isPending: true,
      isSuccessful: false
    }
    state.transferInProgress = true
  }),

  transferSuccess: (event) => set((state) => {
    state.transaction = {
      transactionType: 'Transfer',
      isPending: false,
      isSuccessful: true
    }
    state.transferInProgress = false
    state.events.unshift(event)
  }),

  transferFail: () => set((state) => {
    state.transaction = {
      transactionType: 'Transfer',
      isPending: false,
      isSuccessful: false,
      isError: true
    }
    state.transferInProgress = false
  }),

  // New orders
  newOrderRequest: () => set((state) => {
    state.transaction = {
      transactionType: 'New Order',
      isPending: true,
      isSuccessful: false
    }
  }),

  newOrderSuccess: (order, event) => set((state) => {
    // Prevent duplicate orders
    const index = state.allOrders.data.findIndex(
      existingOrder => existingOrder.id.toString() === order.id.toString()
    )
    
    if (index === -1) {
      state.allOrders.data.push(order)
    }

    state.transaction = {
      transactionType: 'New Order',
      isPending: false,
      isSuccessful: true
    }
    state.events.unshift(event)
  }),

  newOrderFail: () => set((state) => {
    state.transaction = {
      transactionType: 'New Order',
      isPending: false,
      isSuccessful: false,
      isError: true
    }
    state.transferInProgress = false
  }),

  // Selectors
  getOpenOrders: () => {
    const state = get()
    const cancelledIds = new Set(state.cancelledOrders.data.map(order => order.id.toString()))
    const filledIds = new Set(state.filledOrders.data.map(order => order.id.toString()))
    
    return state.allOrders.data.filter(order => 
      !cancelledIds.has(order.id.toString()) && 
      !filledIds.has(order.id.toString())
    )
  },

  getOrdersByType: (orderType) => {
    const openOrders = get().getOpenOrders()
    // Add logic to filter by buy/sell based on your order structure
    return openOrders
  },

  // Bulk operations for better performance
  bulkUpdateOrders: (orders) => set((state) => {
    state.allOrders.data = orders.all
    state.cancelledOrders.data = orders.cancelled
    state.filledOrders.data = orders.filled
  }),

  // Reset store
  reset: () => set((state) => {
    state.loaded = false
    state.contract = {}
    state.balances = []
    state.transaction = { isSuccessful: false }
    state.allOrders = { loaded: false, data: [] }
    state.cancelledOrders = { data: [] }
    state.filledOrders = { data: [] }
    state.events = []
    state.transferInProgress = false
  })
    }))
  )
)

export default useExchangeStore