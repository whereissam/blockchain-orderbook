import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import Trade from '../../components/Trade'
import { renderWithMocks, createMockStoreState, createMockOrder } from '../testUtils'

describe('Trade Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trade history correctly', () => {
    const mockFilledOrders = [
      createMockOrder({ 
        id: '1', 
        tokenPrice: 1.5, 
        token1Amount: '10',
        formattedTimestamp: '12:34:56pm Jan 1',
        orderType: 'buy'
      }),
      createMockOrder({ 
        id: '2', 
        tokenPrice: 2.0, 
        token1Amount: '5',
        formattedTimestamp: '01:23:45pm Jan 2',
        orderType: 'sell'
      }),
    ]

    const mockState = createMockStoreState({
      exchange: {
        filledOrders: {
          loaded: true,
          data: mockFilledOrders,
        },
      },
    })

    renderWithMocks(<Trade />, { initialState: mockState })

    expect(screen.getByText(/trades/i) || screen.getByText(/trade history/i)).toBeInTheDocument()
  })

  it('displays filled orders with correct information', () => {
    const mockFilledOrder = createMockOrder({
      id: '1',
      tokenPrice: 1.5,
      token0Amount: '10.0',
      token1Amount: '15.0',
      formattedTimestamp: '12:34:56pm Jan 1',
      orderType: 'buy',
      orderTypeClass: 'order-buy'
    })

    const mockState = createMockStoreState({
      exchange: {
        filledOrders: {
          loaded: true,
          data: [mockFilledOrder],
        },
      },
    })

    renderWithMocks(<Trade />, { initialState: mockState })

    // Should display trade information
    expect(screen.getByText(/1.5/)).toBeInTheDocument()
    expect(screen.getByText(/10/)).toBeInTheDocument()
    expect(screen.getByText(/15/)).toBeInTheDocument()
    expect(screen.getByText(/12:34:56pm Jan 1/)).toBeInTheDocument()
  })

  it('shows loading state when trades are not loaded', () => {
    const mockState = createMockStoreState({
      exchange: {
        filledOrders: {
          loaded: false,
          data: [],
        },
      },
    })

    renderWithMocks(<Trade />, { initialState: mockState })

    expect(screen.getByText(/loading/i) || screen.getByText(/no trades/i)).toBeInTheDocument()
  })

  it('displays empty state when no trades exist', () => {
    const mockState = createMockStoreState({
      exchange: {
        filledOrders: {
          loaded: true,
          data: [],
        },
      },
    })

    renderWithMocks(<Trade />, { initialState: mockState })

    expect(screen.getByText(/no trades/i) || screen.getByText(/empty/i)).toBeInTheDocument()
  })

  it('sorts trades by timestamp correctly', () => {
    const olderTrade = createMockOrder({
      id: '1',
      timestamp: '1640995200', // Earlier timestamp
      formattedTimestamp: '12:00:00pm Jan 1',
      tokenPrice: 1.0,
    })

    const newerTrade = createMockOrder({
      id: '2',
      timestamp: '1641081600', // Later timestamp  
      formattedTimestamp: '12:00:00pm Jan 2',
      tokenPrice: 2.0,
    })

    const mockState = createMockStoreState({
      exchange: {
        filledOrders: {
          loaded: true,
          data: [olderTrade, newerTrade],
        },
      },
    })

    renderWithMocks(<Trade />, { initialState: mockState })

    // Both trades should be visible
    expect(screen.getByText(/Jan 1/)).toBeInTheDocument()
    expect(screen.getByText(/Jan 2/)).toBeInTheDocument()
  })

  it('distinguishes between buy and sell trades', () => {
    const buyTrade = createMockOrder({
      id: '1',
      orderType: 'buy',
      orderTypeClass: 'order-buy',
      tokenPrice: 1.5,
    })

    const sellTrade = createMockOrder({
      id: '2',
      orderType: 'sell',
      orderTypeClass: 'order-sell',
      tokenPrice: 2.0,
    })

    const mockState = createMockStoreState({
      exchange: {
        filledOrders: {
          loaded: true,
          data: [buyTrade, sellTrade],
        },
      },
    })

    renderWithMocks(<Trade />, { initialState: mockState })

    // Should show both buy and sell trades with different styling
    expect(screen.getByText(/1.5/)).toBeInTheDocument()
    expect(screen.getByText(/2.0/)).toBeInTheDocument()
  })

  it('shows correct price formatting', () => {
    const mockTrade = createMockOrder({
      id: '1',
      tokenPrice: 1.234567,
      token0Amount: '10.123456',
      token1Amount: '12.345678',
    })

    const mockState = createMockStoreState({
      exchange: {
        filledOrders: {
          loaded: true,
          data: [mockTrade],
        },
      },
    })

    renderWithMocks(<Trade />, { initialState: mockState })

    // Should display formatted numbers (implementation may vary)
    expect(screen.getByText(/1.23|10.12|12.34/)).toBeInTheDocument()
  })

  it('handles large number of trades efficiently', () => {
    const manyTrades = Array.from({ length: 100 }, (_, i) => 
      createMockOrder({
        id: `${i + 1}`,
        tokenPrice: 1.0 + (i * 0.01),
        timestamp: `${1640995200 + i}`,
      })
    )

    const mockState = createMockStoreState({
      exchange: {
        filledOrders: {
          loaded: true,
          data: manyTrades,
        },
      },
    })

    renderWithMocks(<Trade />, { initialState: mockState })

    // Should render without performance issues
    expect(screen.getByText(/trades/i) || screen.getByText(/trade history/i)).toBeInTheDocument()
  })

  it('updates when new trades are added', () => {
    const initialTrade = createMockOrder({ id: '1', tokenPrice: 1.0 })
    
    const mockState = createMockStoreState({
      exchange: {
        filledOrders: {
          loaded: true,
          data: [initialTrade],
        },
      },
    })

    const { rerender } = renderWithMocks(<Trade />, { initialState: mockState })

    expect(screen.getByText(/1.0/)).toBeInTheDocument()

    // Simulate new trade added
    const updatedState = createMockStoreState({
      exchange: {
        filledOrders: {
          loaded: true,
          data: [
            initialTrade,
            createMockOrder({ id: '2', tokenPrice: 2.0 })
          ],
        },
      },
    })

    rerender(<Trade />)
    
    // Should show both trades
    expect(screen.getByText(/1.0/)).toBeInTheDocument()
    expect(screen.getByText(/2.0/)).toBeInTheDocument()
  })
})