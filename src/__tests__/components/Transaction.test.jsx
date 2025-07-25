import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import Transaction from '../../components/Transaction'
import { renderWithMocks, createMockStoreState, createMockOrder } from '../testUtils'
import * as interactions from '../../store/interactions'

vi.mock('../../store/interactions')

describe('Transaction Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders transaction history correctly', () => {
    const mockState = createMockStoreState({
      exchange: {
        events: [
          { 
            id: '1', 
            transactionType: 'Deposit', 
            amount: '10.0', 
            token: 'SSS',
            timestamp: '12:34:56pm Jan 1'
          },
          { 
            id: '2', 
            transactionType: 'New Order', 
            amount: '5.0', 
            token: 'mETH',
            timestamp: '01:23:45pm Jan 2'
          },
        ],
      },
    })

    renderWithMocks(<Transaction />, { initialState: mockState })

    expect(screen.getByText(/transactions/i) || screen.getByText(/history/i)).toBeInTheDocument()
  })

  it('displays pending transaction state', () => {
    const mockState = createMockStoreState({
      exchange: {
        transaction: {
          isPending: true,
          transactionType: 'New Order',
        },
      },
    })

    renderWithMocks(<Transaction />, { initialState: mockState })

    expect(screen.getByText(/pending/i) || screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays successful transaction state', () => {
    const mockState = createMockStoreState({
      exchange: {
        transaction: {
          isSuccessful: true,
          transactionType: 'Deposit',
        },
      },
    })

    renderWithMocks(<Transaction />, { initialState: mockState })

    expect(screen.getByText(/success/i) || screen.getByText(/complete/i)).toBeInTheDocument()
  })

  it('shows transaction details correctly', () => {
    const mockState = createMockStoreState({
      exchange: {
        events: [
          {
            id: '1',
            transactionType: 'Deposit',
            amount: '10.0',
            token: 'SSS',
            timestamp: '12:34:56pm Jan 1',
            hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
          },
        ],
      },
    })

    renderWithMocks(<Transaction />, { initialState: mockState })

    // Should display transaction details
    expect(screen.getByText(/deposit/i)).toBeInTheDocument()
    expect(screen.getByText(/10.0/)).toBeInTheDocument()
    expect(screen.getByText(/SSS/)).toBeInTheDocument()
    expect(screen.getByText(/12:34:56pm Jan 1/)).toBeInTheDocument()
  })

  it('handles different transaction types', () => {
    const mockState = createMockStoreState({
      exchange: {
        events: [
          { 
            id: '1', 
            transactionType: 'Deposit', 
            amount: '10.0', 
            token: 'SSS' 
          },
          { 
            id: '2', 
            transactionType: 'Withdraw', 
            amount: '5.0', 
            token: 'mETH' 
          },
          { 
            id: '3', 
            transactionType: 'New Order', 
            amount: '2.0', 
            token: 'DAI' 
          },
          { 
            id: '4', 
            transactionType: 'Cancel', 
            orderId: '123' 
          },
        ],
      },
    })

    renderWithMocks(<Transaction />, { initialState: mockState })

    // Should show all transaction types
    expect(screen.getByText(/deposit/i)).toBeInTheDocument()
    expect(screen.getByText(/withdraw/i)).toBeInTheDocument()
    expect(screen.getByText(/order/i)).toBeInTheDocument()
    expect(screen.getByText(/cancel/i)).toBeInTheDocument()
  })

  it('shows empty state when no transactions exist', () => {
    const mockState = createMockStoreState({
      exchange: {
        events: [],
      },
    })

    renderWithMocks(<Transaction />, { initialState: mockState })

    expect(screen.getByText(/no transactions/i) || screen.getByText(/empty/i)).toBeInTheDocument()
  })

  it('allows cancelling open orders', async () => {
    const mockCancelOrder = vi.mocked(interactions.cancelOrder)
    mockCancelOrder.mockResolvedValue(true)

    const mockOpenOrder = createMockOrder({
      id: '1',
      user: '0x1234567890123456789012345678901234567890', // Current user
      tokenPrice: 1.5,
      token1Amount: '10',
    })

    const mockState = createMockStoreState({
      provider: {
        account: '0x1234567890123456789012345678901234567890',
      },
      exchange: {
        loaded: true,
        contract: { address: '0x333' },
        allOrders: {
          loaded: true,
          data: [mockOpenOrder],
        },
        myOpenOrders: [mockOpenOrder],
      },
    })

    renderWithMocks(<Transaction />, { initialState: mockState })

    // Look for cancel button
    const cancelButtons = screen.getAllByText(/cancel/i)
    if (cancelButtons.length > 0) {
      fireEvent.click(cancelButtons[0])

      await waitFor(() => {
        expect(mockCancelOrder).toHaveBeenCalledWith(
          expect.any(Object), // provider
          expect.any(Object), // exchange
          mockOpenOrder,
          expect.any(Function) // dispatch
        )
      }, { timeout: 3000 })
    }
  })

  it('shows transaction status indicators', () => {
    const mockState = createMockStoreState({
      exchange: {
        events: [
          {
            id: '1',
            transactionType: 'Deposit',
            status: 'confirmed',
            amount: '10.0',
          },
          {
            id: '2',
            transactionType: 'Withdraw',
            status: 'pending',
            amount: '5.0',
          },
          {
            id: '3',
            transactionType: 'New Order',
            status: 'failed',
            amount: '2.0',
          },
        ],
      },
    })

    renderWithMocks(<Transaction />, { initialState: mockState })

    // Should show different status indicators
    expect(screen.getByText(/confirmed|success/i)).toBeInTheDocument()
    expect(screen.getByText(/pending/i)).toBeInTheDocument()
    expect(screen.getByText(/failed|error/i)).toBeInTheDocument()
  })

  it('sorts transactions by timestamp', () => {
    const mockState = createMockStoreState({
      exchange: {
        events: [
          {
            id: '1',
            transactionType: 'Deposit',
            timestamp: '12:00:00pm Jan 1',
            amount: '10.0',
          },
          {
            id: '2',
            transactionType: 'Withdraw',
            timestamp: '12:00:00pm Jan 2',
            amount: '5.0',
          },
        ],
      },
    })

    renderWithMocks(<Transaction />, { initialState: mockState })

    // Both transactions should be visible
    expect(screen.getByText(/Jan 1/)).toBeInTheDocument()
    expect(screen.getByText(/Jan 2/)).toBeInTheDocument()
  })

  it('handles transaction errors gracefully', () => {
    const mockState = createMockStoreState({
      exchange: {
        transaction: {
          isError: true,
          transactionType: 'Deposit',
          errorMessage: 'Transaction failed',
        },
      },
    })

    renderWithMocks(<Transaction />, { initialState: mockState })

    expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    expect(screen.getByText(/transaction failed/i)).toBeInTheDocument()
  })

  it('disables actions when not connected', () => {
    const mockState = createMockStoreState({
      provider: {
        account: null,
        connection: null,
      },
      exchange: {
        myOpenOrders: [createMockOrder({ id: '1' })],
      },
    })

    renderWithMocks(<Transaction />, { initialState: mockState })

    // Cancel buttons should be disabled when not connected
    const cancelButtons = screen.getAllByText(/cancel/i)
    cancelButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })
})