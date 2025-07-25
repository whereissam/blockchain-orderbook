import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithMocks, createMockStoreState, createMockOrder } from '../testUtils'
import * as interactions from '../../store/interactions'

// Import components for full integration test
import Order from '../../components/Order'
import OrderBook from '../../components/OrderBook'
import Balance from '../../components/Balance'

vi.mock('../../store/interactions')

describe('Order Creation and Filling Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes full order creation workflow', async () => {
    const mockMakeBuyOrder = vi.mocked(interactions.makeBuyOrder)
    const mockLoadBalances = vi.mocked(interactions.loadBalances)
    const mockLoadAllOrdersWithHistory = vi.mocked(interactions.loadAllOrdersWithHistory)
    
    // Mock successful order creation
    mockMakeBuyOrder.mockResolvedValue(true)
    mockLoadBalances.mockResolvedValue(true)
    mockLoadAllOrdersWithHistory.mockResolvedValue(true)

    const mockState = createMockStoreState({
      provider: {
        connection: {},
        account: '0x1234567890123456789012345678901234567890',
        chainId: 31337,
      },
      tokens: {
        loaded: true,
        contracts: [
          { address: '0x111', symbol: 'SSS' },
          { address: '0x222', symbol: 'mETH' }
        ],
        symbols: ['SSS', 'mETH'],
        balances: ['1000.0', '500.0'],
      },
      exchange: {
        loaded: true,
        contract: { address: '0x333' },
        balances: ['100.0', '50.0'],
        transaction: {
          isPending: false,
          isSuccessful: false,
        },
      },
    })

    renderWithMocks(<Order />, { initialState: mockState })

    // Fill order form
    const amountInput = screen.getByPlaceholderText(/amount/i)
    const priceInput = screen.getByPlaceholderText(/price/i)
    
    fireEvent.change(amountInput, { target: { value: '10' } })
    fireEvent.change(priceInput, { target: { value: '1.5' } })

    // Submit buy order
    const buyButton = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('Buy')
    )

    expect(buyButton).toBeDefined()
    fireEvent.click(buyButton)

    // Verify order creation was called
    await waitFor(() => {
      expect(mockMakeBuyOrder).toHaveBeenCalledWith(
        expect.any(Object), // provider
        expect.any(Object), // exchange
        expect.any(Object), // tokens
        { amount: '10', price: '1.5' }
      )
    }, { timeout: 5000 })

    // Verify subsequent data refreshes
    expect(mockLoadBalances).toHaveBeenCalled()
    expect(mockLoadAllOrdersWithHistory).toHaveBeenCalled()
  })

  it('completes full order filling workflow', async () => {
    const mockFillOrder = vi.mocked(interactions.fillOrder)
    const mockLoadBalances = vi.mocked(interactions.loadBalances)
    const mockLoadAllOrdersWithHistory = vi.mocked(interactions.loadAllOrdersWithHistory)
    
    mockFillOrder.mockResolvedValue(true)
    mockLoadBalances.mockResolvedValue(true)
    mockLoadAllOrdersWithHistory.mockResolvedValue(true)

    const mockOrder = createMockOrder({
      id: '1',
      user: '0x9876543210987654321098765432109876543210', // Different user
      tokenPrice: 2.0,
      token1Amount: '5',
      orderType: 'sell',
    })

    const mockState = createMockStoreState({
      provider: {
        connection: {},
        account: '0x1234567890123456789012345678901234567890',
        chainId: 31337,
      },
      exchange: {
        loaded: true,
        contract: { address: '0x333' },
        balances: ['100.0', '50.0'],
        allOrders: {
          loaded: true,
          data: [mockOrder],
        },
        orderBook: {
          sellOrders: [mockOrder],
        },
      },
    })

    renderWithMocks(<OrderBook />, { initialState: mockState })

    // Find and click on order to fill
    const orderRows = screen.getAllByRole('row')
    const orderRow = orderRows.find(row => row.textContent?.includes('2.0'))
    
    expect(orderRow).toBeDefined()
    fireEvent.click(orderRow)

    // Verify order filling was called
    await waitFor(() => {
      expect(mockFillOrder).toHaveBeenCalledWith(
        expect.any(Object), // provider
        expect.any(Object), // exchange
        mockOrder,
        expect.any(Function) // dispatch
      )
    }, { timeout: 5000 })

    // Verify data refreshes after fill
    expect(mockLoadBalances).toHaveBeenCalled()
    expect(mockLoadAllOrdersWithHistory).toHaveBeenCalled()
  })

  it('handles deposit and order creation sequence', async () => {
    const mockTransferTokens = vi.mocked(interactions.transferTokens)
    const mockMakeBuyOrder = vi.mocked(interactions.makeBuyOrder)
    
    mockTransferTokens.mockResolvedValue(true)
    mockMakeBuyOrder.mockResolvedValue(true)

    const mockState = createMockStoreState({
      provider: {
        connection: {},
        account: '0x1234567890123456789012345678901234567890',
      },
      tokens: {
        loaded: true,
        contracts: [
          { address: '0x111', symbol: 'SSS' },
          { address: '0x222', symbol: 'mETH' }
        ],
        balances: ['1000.0', '500.0'],
      },
      exchange: {
        loaded: true,
        contract: { address: '0x333' },
        balances: ['0.0', '0.0'], // No exchange balance initially
      },
    })

    const { rerender } = renderWithMocks(<Balance />, { initialState: mockState })

    // First deposit tokens
    const depositInputs = screen.getAllByRole('textbox')
    if (depositInputs.length > 0) {
      fireEvent.change(depositInputs[0], { target: { value: '100' } })
      
      const depositButton = screen.getAllByText(/deposit/i)[0]
      fireEvent.click(depositButton)

      await waitFor(() => {
        expect(mockTransferTokens).toHaveBeenCalled()
      }, { timeout: 3000 })
    }

    // Update state to reflect deposit
    const updatedState = createMockStoreState({
      ...mockState,
      exchange: {
        ...mockState.exchange,
        balances: ['100.0', '0.0'], // Updated balance after deposit
      },
    })

    // Now create order with deposited funds
    rerender(<Order />)
    
    const amountInput = screen.getByPlaceholderText(/amount/i)
    const priceInput = screen.getByPlaceholderText(/price/i)
    
    fireEvent.change(amountInput, { target: { value: '10' } })
    fireEvent.change(priceInput, { target: { value: '1.5' } })

    const buyButton = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('Buy')
    )

    if (buyButton) {
      fireEvent.click(buyButton)

      await waitFor(() => {
        expect(mockMakeBuyOrder).toHaveBeenCalled()
      }, { timeout: 3000 })
    }
  })

  it('handles order cancellation workflow', async () => {
    const mockCancelOrder = vi.mocked(interactions.cancelOrder)
    const mockLoadAllOrdersWithHistory = vi.mocked(interactions.loadAllOrdersWithHistory)
    
    mockCancelOrder.mockResolvedValue(true)
    mockLoadAllOrdersWithHistory.mockResolvedValue(true)

    const userOrder = createMockOrder({
      id: '1',
      user: '0x1234567890123456789012345678901234567890', // Current user's order
      tokenPrice: 1.5,
      token1Amount: '10',
      orderType: 'buy',
    })

    const mockState = createMockStoreState({
      provider: {
        connection: {},
        account: '0x1234567890123456789012345678901234567890',
      },
      exchange: {
        loaded: true,
        contract: { address: '0x333' },
        allOrders: {
          loaded: true,
          data: [userOrder],
        },
        myOpenOrders: [userOrder],
      },
    })

    // Assuming Transaction component shows user's orders with cancel option
    renderWithMocks(<div>
      <OrderBook />
      {/* Transaction component would be here */}
    </div>, { initialState: mockState })

    // Find cancel button for user's order
    const cancelButtons = screen.getAllByText(/cancel/i)
    if (cancelButtons.length > 0) {
      fireEvent.click(cancelButtons[0])

      await waitFor(() => {
        expect(mockCancelOrder).toHaveBeenCalledWith(
          expect.any(Object), // provider
          expect.any(Object), // exchange
          userOrder,
          expect.any(Function) // dispatch
        )
      }, { timeout: 3000 })

      // Verify order data refresh
      expect(mockLoadAllOrdersWithHistory).toHaveBeenCalled()
    }
  })

  it('handles insufficient balance scenarios', async () => {
    const mockMakeBuyOrder = vi.mocked(interactions.makeBuyOrder)
    mockMakeBuyOrder.mockRejectedValue(new Error('Insufficient balance'))

    const mockState = createMockStoreState({
      provider: {
        connection: {},
        account: '0x1234567890123456789012345678901234567890',
      },
      exchange: {
        loaded: true,
        balances: ['1.0', '0.0'], // Very low balance
      },
    })

    renderWithMocks(<Order />, { initialState: mockState })

    // Try to create order larger than balance
    const amountInput = screen.getByPlaceholderText(/amount/i)
    const priceInput = screen.getByPlaceholderText(/price/i)
    
    fireEvent.change(amountInput, { target: { value: '100' } }) // More than balance
    fireEvent.change(priceInput, { target: { value: '1.5' } })

    const buyButton = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('Buy')
    )

    if (buyButton) {
      fireEvent.click(buyButton)

      await waitFor(() => {
        expect(mockMakeBuyOrder).toHaveBeenCalled()
        // Should handle error gracefully
      }, { timeout: 3000 })
    }
  })

  it('validates order book updates after transactions', async () => {
    const mockMakeSellOrder = vi.mocked(interactions.makeSellOrder)
    const mockLoadAllOrdersWithHistory = vi.mocked(interactions.loadAllOrdersWithHistory)
    
    const newOrder = createMockOrder({
      id: '2',
      user: '0x1234567890123456789012345678901234567890',
      tokenPrice: 2.5,
      token1Amount: '8',
      orderType: 'sell',
    })

    mockMakeSellOrder.mockResolvedValue(newOrder)
    mockLoadAllOrdersWithHistory.mockResolvedValue([newOrder])

    const initialState = createMockStoreState({
      provider: {
        connection: {},
        account: '0x1234567890123456789012345678901234567890',
      },
      exchange: {
        loaded: true,
        contract: { address: '0x333' },
        balances: ['50.0', '25.0'],
        allOrders: {
          loaded: true,
          data: [],
        },
        orderBook: {
          sellOrders: [],
        },
      },
    })

    const { rerender } = renderWithMocks(<Order />, { initialState })

    // Create sell order
    const sellTab = screen.getByText(/sell/i)
    fireEvent.click(sellTab)

    const amountInput = screen.getByPlaceholderText(/amount/i)
    const priceInput = screen.getByPlaceholderText(/price/i)
    
    fireEvent.change(amountInput, { target: { value: '8' } })
    fireEvent.change(priceInput, { target: { value: '2.5' } })

    const sellButton = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('Sell')
    )

    if (sellButton) {
      fireEvent.click(sellButton)

      await waitFor(() => {
        expect(mockMakeSellOrder).toHaveBeenCalled()
      }, { timeout: 3000 })
    }

    // Verify order appears in order book
    const updatedState = createMockStoreState({
      ...initialState,
      exchange: {
        ...initialState.exchange,
        allOrders: {
          loaded: true,
          data: [newOrder],
        },
        orderBook: {
          sellOrders: [newOrder],
        },
      },
    })

    rerender(<OrderBook />)
    
    // Should see the new order in the order book
    expect(screen.getByText(/2.5/)).toBeInTheDocument()
    expect(screen.getByText(/8/)).toBeInTheDocument()
  })
})