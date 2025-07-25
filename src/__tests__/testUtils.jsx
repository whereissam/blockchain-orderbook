// Test utilities and mock data
import { render } from '@testing-library/react'
import { vi } from 'vitest'

// Mock data generators
export const createMockToken = (overrides = {}) => ({
  address: '0x1234567890123456789012345678901234567890',
  symbol: 'TEST',
  name: 'Test Token',
  decimals: 18,
  balanceOf: vi.fn(),
  approve: vi.fn(),
  transfer: vi.fn(),
  ...overrides,
})

export const createMockExchange = (overrides = {}) => ({
  address: '0x0987654321098765432109876543210987654321',
  feeAccount: '0x1111111111111111111111111111111111111111',
  feePercent: 10,
  orderCount: vi.fn(),
  orders: vi.fn(),
  balanceOf: vi.fn(),
  depositToken: vi.fn(),
  withdrawToken: vi.fn(),
  makeOrder: vi.fn(),
  fillOrder: vi.fn(),
  cancelOrder: vi.fn(),
  orderFilled: vi.fn(),
  orderCancelled: vi.fn(),
  queryFilter: vi.fn(),
  on: vi.fn(),
  connect: vi.fn(() => ({
    depositToken: vi.fn(),
    withdrawToken: vi.fn(),
    makeOrder: vi.fn(),
    fillOrder: vi.fn(),
    cancelOrder: vi.fn(),
  })),
  ...overrides,
})

export const createMockProvider = (overrides = {}) => ({
  getNetwork: vi.fn(() => Promise.resolve({ chainId: 31337 })),
  getBlockNumber: vi.fn(() => Promise.resolve(12345)),
  getSigner: vi.fn(() => Promise.resolve({
    getAddress: vi.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890')),
  })),
  getBalance: vi.fn(() => Promise.resolve('1000000000000000000')),
  ...overrides,
})

export const createMockOrder = (overrides = {}) => ({
  id: '1',
  user: '0x1234567890123456789012345678901234567890',
  tokenGet: '0x1111111111111111111111111111111111111111',
  amountGet: '1000000000000000000',
  tokenGive: '0x2222222222222222222222222222222222222222',
  amountGive: '2000000000000000000',
  timestamp: '1640995200',
  token0Amount: '1.0',
  token1Amount: '2.0',
  tokenPrice: 2.0,
  formattedTimestamp: '12:34:56pm Jan 1',
  orderType: 'buy',
  orderTypeClass: 'order-buy',
  ...overrides,
})

export const createMockStoreState = (overrides = {}) => ({
  provider: {
    connection: createMockProvider(),
    account: '0x1234567890123456789012345678901234567890',
    chainId: 31337,
    balance: '1.0',
  },
  tokens: {
    loaded: true,
    contracts: [createMockToken(), createMockToken({ symbol: 'TEST2' })],
    symbols: ['TEST', 'TEST2'],
    balances: ['10.0', '20.0'],
  },
  exchange: {
    loaded: true,
    contract: createMockExchange(),
    balances: ['5.0', '10.0'],
    allOrders: {
      loaded: true,
      data: [createMockOrder()],
    },
    filledOrders: {
      loaded: true,
      data: [createMockOrder({ id: '2' })],
    },
    cancelledOrders: {
      loaded: true,
      data: [],
    },
    transaction: {
      isSuccessful: false,
      isPending: false,
    },
    events: [],
  },
  ...overrides,
})

// Mock Zustand stores
export const mockUseProviderStore = vi.fn()
export const mockUseTokensStore = vi.fn()
export const mockUseExchangeStore = vi.fn()

// Mock the store imports
vi.mock('../store/providerStore', () => ({
  default: mockUseProviderStore,
}))

vi.mock('../store/tokensStore', () => ({
  default: mockUseTokensStore,
}))

vi.mock('../store/exchangeStore', () => ({
  default: mockUseExchangeStore,
}))

// Mock interactions
vi.mock('../store/interactions', () => ({
  loadProvider: vi.fn(),
  loadNetwork: vi.fn(),
  loadAccount: vi.fn(),
  loadToken: vi.fn(),
  loadExchange: vi.fn(),
  loadBalances: vi.fn(),
  loadAllOrdersWithHistory: vi.fn(),
  subscribeToEvents: vi.fn(),
  transferTokens: vi.fn(),
  makeBuyOrder: vi.fn(),
  makeSellOrder: vi.fn(),
  fillOrder: vi.fn(),
  cancelOrder: vi.fn(),
  claimTestTokens: vi.fn(),
}))

// Custom render function with providers
export const renderWithMocks = (ui, options = {}) => {
  const mockState = createMockStoreState(options.initialState)
  
  // Set up store mocks
  mockUseProviderStore.mockImplementation((selector) => {
    if (typeof selector === 'function') {
      return selector(mockState.provider)
    }
    return mockState.provider
  })
  
  mockUseTokensStore.mockImplementation((selector) => {
    if (typeof selector === 'function') {
      return selector(mockState.tokens)
    }
    return mockState.tokens
  })
  
  mockUseExchangeStore.mockImplementation((selector) => {
    if (typeof selector === 'function') {
      return selector(mockState.exchange)
    }
    return mockState.exchange
  })
  
  return render(ui, options)
}

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))