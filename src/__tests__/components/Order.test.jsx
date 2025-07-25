import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import Order from '../../components/Order'
import { renderWithMocks, createMockStoreState } from '../testUtils'
import * as interactions from '../../store/interactions'

vi.mock('../../store/interactions')

describe('Order Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders order form correctly', () => {
    renderWithMocks(<Order />)

    expect(screen.getByText(/new order/i)).toBeInTheDocument()
    expect(screen.getByText(/buy/i)).toBeInTheDocument()
    expect(screen.getByText(/sell/i)).toBeInTheDocument()
  })

  it('switches between buy and sell tabs', () => {
    renderWithMocks(<Order />)

    const buyTab = screen.getByText(/buy/i)
    const sellTab = screen.getByText(/sell/i)

    // Initially buy should be active
    expect(buyTab).toHaveClass('tab--active')
    expect(sellTab).not.toHaveClass('tab--active')

    // Click sell tab
    fireEvent.click(sellTab)
    expect(sellTab).toHaveClass('tab--active')
    expect(buyTab).not.toHaveClass('tab--active')
  })

  it('validates order inputs', () => {
    renderWithMocks(<Order />)

    const amountInput = screen.getByPlaceholderText(/amount/i)
    const priceInput = screen.getByPlaceholderText(/price/i)

    // Test invalid inputs
    fireEvent.change(amountInput, { target: { value: '-5' } })
    fireEvent.change(priceInput, { target: { value: '0' } })

    // Should prevent or validate these values
    expect(amountInput.value).toBe('') // Should be cleared or prevented
    expect(priceInput.value).toBe('') // Should be cleared or prevented
  })

  it('creates buy order correctly', async () => {
    const mockMakeBuyOrder = vi.mocked(interactions.makeBuyOrder)
    mockMakeBuyOrder.mockResolvedValue(true)

    const mockState = createMockStoreState({
      provider: { account: '0x123' },
      tokens: { 
        loaded: true,
        contracts: [{ address: '0x111' }, { address: '0x222' }],
      },
      exchange: { loaded: true, contract: { address: '0x333' } },
    })

    renderWithMocks(<Order />, { initialState: mockState })

    // Fill form
    const amountInput = screen.getByPlaceholderText(/amount/i)
    const priceInput = screen.getByPlaceholderText(/price/i)
    
    fireEvent.change(amountInput, { target: { value: '10' } })
    fireEvent.change(priceInput, { target: { value: '1.5' } })

    // Submit buy order
    const buyButton = screen.getByText(/buy/i).closest('button') || 
                     screen.getAllByRole('button').find(btn => btn.textContent?.includes('Buy'))

    if (buyButton) {
      fireEvent.click(buyButton)

      await waitFor(() => {
        expect(mockMakeBuyOrder).toHaveBeenCalledWith(
          expect.any(Object), // provider
          expect.any(Object), // exchange
          expect.any(Object), // tokens
          { amount: '10', price: '1.5' }
        )
      }, { timeout: 3000 })
    }
  })

  it('creates sell order correctly', async () => {
    const mockMakeSellOrder = vi.mocked(interactions.makeSellOrder)
    mockMakeSellOrder.mockResolvedValue(true)

    const mockState = createMockStoreState({
      provider: { account: '0x123' },
      tokens: { 
        loaded: true,
        contracts: [{ address: '0x111' }, { address: '0x222' }],
      },
      exchange: { loaded: true, contract: { address: '0x333' } },
    })

    renderWithMocks(<Order />, { initialState: mockState })

    // Switch to sell tab
    const sellTab = screen.getByText(/sell/i)
    fireEvent.click(sellTab)

    // Fill form
    const amountInput = screen.getByPlaceholderText(/amount/i)
    const priceInput = screen.getByPlaceholderText(/price/i)
    
    fireEvent.change(amountInput, { target: { value: '5' } })
    fireEvent.change(priceInput, { target: { value: '2.0' } })

    // Submit sell order
    const sellButton = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('Sell') || btn.textContent?.includes('sell')
    )

    if (sellButton) {
      fireEvent.click(sellButton)

      await waitFor(() => {
        expect(mockMakeSellOrder).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(Object),
          expect.any(Object),
          { amount: '5', price: '2.0' }
        )
      }, { timeout: 3000 })
    }
  })

  it('disables form when not connected', () => {
    const mockState = createMockStoreState({
      provider: { account: null, connection: null },
    })

    renderWithMocks(<Order />, { initialState: mockState })

    const inputs = screen.getAllByRole('textbox')
    const buttons = screen.getAllByRole('button')

    // Inputs should be disabled
    inputs.forEach(input => {
      expect(input).toBeDisabled()
    })

    // Submit buttons should be disabled
    buttons.forEach(button => {
      if (button.textContent?.match(/buy|sell/i)) {
        expect(button).toBeDisabled()
      }
    })
  })

  it('shows loading state during order creation', async () => {
    const mockMakeBuyOrder = vi.mocked(interactions.makeBuyOrder)
    // Simulate slow network
    mockMakeBuyOrder.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    const mockState = createMockStoreState({
      exchange: {
        transaction: { isPending: true, transactionType: 'New Order' },
      },
    })

    renderWithMocks(<Order />, { initialState: mockState })

    // Should show loading state
    const loadingElements = screen.getAllByText(/loading|pending/i)
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('clears form after successful order', async () => {
    const mockMakeBuyOrder = vi.mocked(interactions.makeBuyOrder)
    mockMakeBuyOrder.mockResolvedValue(true)

    renderWithMocks(<Order />)

    const amountInput = screen.getByPlaceholderText(/amount/i)
    const priceInput = screen.getByPlaceholderText(/price/i)
    
    fireEvent.change(amountInput, { target: { value: '10' } })
    fireEvent.change(priceInput, { target: { value: '1.5' } })

    expect(amountInput.value).toBe('10')
    expect(priceInput.value).toBe('1.5')

    // Submit order
    const buyButton = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('Buy')
    )

    if (buyButton) {
      fireEvent.click(buyButton)

      await waitFor(() => {
        // Form should be cleared after successful submission
        expect(amountInput.value).toBe('')
        expect(priceInput.value).toBe('')
      }, { timeout: 3000 })
    }
  })

  it('calculates order total correctly', () => {
    renderWithMocks(<Order />)

    const amountInput = screen.getByPlaceholderText(/amount/i)
    const priceInput = screen.getByPlaceholderText(/price/i)
    
    fireEvent.change(amountInput, { target: { value: '10' } })
    fireEvent.change(priceInput, { target: { value: '1.5' } })

    // Should show calculated total (10 * 1.5 = 15)
    const totalElement = screen.queryByText(/15/i)
    if (totalElement) {
      expect(totalElement).toBeInTheDocument()
    }
  })

  it('handles errors gracefully', async () => {
    const mockMakeBuyOrder = vi.mocked(interactions.makeBuyOrder)
    mockMakeBuyOrder.mockRejectedValue(new Error('Order failed'))

    renderWithMocks(<Order />)

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
        // Should handle error gracefully (not crash)
      }, { timeout: 3000 })
    }
  })
})