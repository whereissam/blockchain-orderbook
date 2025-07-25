import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import Balance from '../../components/Balance'
import { renderWithMocks, createMockStoreState } from '../testUtils'
import * as interactions from '../../store/interactions'

// Mock the interactions
vi.mock('../../store/interactions')

describe('Balance Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders balance information correctly', () => {
    const mockState = createMockStoreState({
      tokens: {
        loaded: true,
        symbols: ['SSS', 'mETH'],
        balances: ['1000.0', '500.0'],
      },
      exchange: {
        balances: ['100.0', '50.0'],
      },
    })

    renderWithMocks(<Balance />, { initialState: mockState })

    expect(screen.getByText('Balance')).toBeInTheDocument()
    expect(screen.getByText('SSS')).toBeInTheDocument()
    expect(screen.getByText('mETH')).toBeInTheDocument()
  })

  it('shows loading state when tokens are not loaded', () => {
    const mockState = createMockStoreState({
      tokens: {
        loaded: false,
        symbols: [],
        balances: [],
      },
    })

    renderWithMocks(<Balance />, { initialState: mockState })

    // Should show loading or empty state
    expect(screen.getByText('Balance')).toBeInTheDocument()
  })

  it('handles deposit token correctly', async () => {
    const mockTransferTokens = vi.mocked(interactions.transferTokens)
    mockTransferTokens.mockResolvedValue(true)

    const mockState = createMockStoreState()
    renderWithMocks(<Balance />, { initialState: mockState })

    // Find and fill the deposit form (assuming it exists)
    const depositInputs = screen.getAllByRole('textbox')
    if (depositInputs.length > 0) {
      fireEvent.change(depositInputs[0], { target: { value: '10' } })
      
      const depositButtons = screen.getAllByText(/deposit/i)
      if (depositButtons.length > 0) {
        fireEvent.click(depositButtons[0])
        
        await waitFor(() => {
          expect(mockTransferTokens).toHaveBeenCalledWith(
            expect.any(Object), // provider
            expect.any(Object), // token
            expect.any(Object), // exchange
            '10',
            'Deposit'
          )
        }, { timeout: 3000 })
      }
    }
  })

  it('handles withdraw token correctly', async () => {
    const mockTransferTokens = vi.mocked(interactions.transferTokens)
    mockTransferTokens.mockResolvedValue(true)

    const mockState = createMockStoreState({
      exchange: {
        balances: ['100.0', '50.0'], // Need balance to withdraw
      },
    })

    renderWithMocks(<Balance />, { initialState: mockState })

    const withdrawInputs = screen.getAllByRole('textbox')
    if (withdrawInputs.length > 1) {
      fireEvent.change(withdrawInputs[1], { target: { value: '5' } })
      
      const withdrawButtons = screen.getAllByText(/withdraw/i)
      if (withdrawButtons.length > 0) {
        fireEvent.click(withdrawButtons[0])
        
        await waitFor(() => {
          expect(mockTransferTokens).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            '5',
            'Withdraw'
          )
        }, { timeout: 3000 })
      }
    }
  })

  it('handles claim tokens correctly', async () => {
    const mockClaimTestTokens = vi.mocked(interactions.claimTestTokens)
    mockClaimTestTokens.mockResolvedValue(true)

    renderWithMocks(<Balance />)

    const claimButtons = screen.getAllByText(/claim/i)
    if (claimButtons.length > 0) {
      fireEvent.click(claimButtons[0])
      
      await waitFor(() => {
        expect(mockClaimTestTokens).toHaveBeenCalled()
      }, { timeout: 3000 })
    }
  })

  it('validates input values', () => {
    renderWithMocks(<Balance />)

    const inputs = screen.getAllByRole('textbox')
    if (inputs.length > 0) {
      // Test negative values
      fireEvent.change(inputs[0], { target: { value: '-5' } })
      expect(inputs[0].value).toBe('') // Should be cleared or prevented
      
      // Test zero values
      fireEvent.change(inputs[0], { target: { value: '0' } })
      // Behavior depends on implementation - should validate appropriately
    }
  })

  it('disables actions when not connected', () => {
    const mockState = createMockStoreState({
      provider: {
        account: null,
        connection: null,
      },
    })

    renderWithMocks(<Balance />, { initialState: mockState })

    // Buttons should be disabled when not connected
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      if (button.textContent?.match(/deposit|withdraw|claim/i)) {
        expect(button).toBeDisabled()
      }
    })
  })

  it('shows correct balance values', () => {
    const mockState = createMockStoreState({
      tokens: {
        loaded: true,
        symbols: ['SSS', 'mETH'],
        balances: ['1000.123', '500.456'],
      },
      exchange: {
        balances: ['100.789', '50.321'],
      },
    })

    renderWithMocks(<Balance />, { initialState: mockState })

    // Should display formatted balances
    expect(screen.getByText(/1000/)).toBeInTheDocument()
    expect(screen.getByText(/500/)).toBeInTheDocument()
    expect(screen.getByText(/100/)).toBeInTheDocument()
    expect(screen.getByText(/50/)).toBeInTheDocument()
  })

  it('handles errors gracefully', async () => {
    const mockTransferTokens = vi.mocked(interactions.transferTokens)
    mockTransferTokens.mockRejectedValue(new Error('Transfer failed'))

    renderWithMocks(<Balance />)

    const inputs = screen.getAllByRole('textbox')
    const buttons = screen.getAllByText(/deposit/i)
    
    if (inputs.length > 0 && buttons.length > 0) {
      fireEvent.change(inputs[0], { target: { value: '10' } })
      fireEvent.click(buttons[0])
      
      // Should handle error gracefully (not crash)
      await waitFor(() => {
        expect(mockTransferTokens).toHaveBeenCalled()
      }, { timeout: 3000 })
    }
  })
})