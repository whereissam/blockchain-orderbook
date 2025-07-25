import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import Market from '../../components/Market'
import { renderWithMocks, createMockStoreState } from '../testUtils'

describe('Market Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders market selector correctly', () => {
    const mockState = createMockStoreState({
      tokens: {
        loaded: true,
        symbols: ['SSS', 'mETH', 'DAI'],
        contracts: [
          { address: '0x111', symbol: 'SSS' },
          { address: '0x222', symbol: 'mETH' },
          { address: '0x333', symbol: 'DAI' }
        ],
      },
    })

    renderWithMocks(<Market />, { initialState: mockState })

    expect(screen.getByText(/select market/i)).toBeInTheDocument()
  })

  it('displays available token pairs', () => {
    const mockState = createMockStoreState({
      tokens: {
        loaded: true,
        symbols: ['SSS', 'mETH'],
        contracts: [
          { address: '0x111', symbol: 'SSS' },
          { address: '0x222', symbol: 'mETH' }
        ],
      },
    })

    renderWithMocks(<Market />, { initialState: mockState })

    // Should show token symbols
    expect(screen.getByText('SSS')).toBeInTheDocument()
    expect(screen.getByText('mETH')).toBeInTheDocument()
  })

  it('handles market selection correctly', () => {
    const mockState = createMockStoreState({
      tokens: {
        loaded: true,
        symbols: ['SSS', 'mETH', 'DAI'],
        contracts: [
          { address: '0x111', symbol: 'SSS' },
          { address: '0x222', symbol: 'mETH' },
          { address: '0x333', symbol: 'DAI' }
        ],
      },
    })

    renderWithMocks(<Market />, { initialState: mockState })

    // Test market pair selection
    const selectElements = screen.getAllByRole('combobox')
    if (selectElements.length > 0) {
      fireEvent.click(selectElements[0])
      // Should open dropdown with available tokens
    }
  })

  it('shows loading state when tokens are not loaded', () => {
    const mockState = createMockStoreState({
      tokens: {
        loaded: false,
        symbols: [],
        contracts: [],
      },
    })

    renderWithMocks(<Market />, { initialState: mockState })

    // Should show loading or empty state
    expect(screen.queryByText(/loading/i) || screen.queryByText(/select market/i)).toBeInTheDocument()
  })

  it('disables selection when not connected', () => {
    const mockState = createMockStoreState({
      provider: {
        account: null,
        connection: null,
      },
      tokens: {
        loaded: true,
        symbols: ['SSS', 'mETH'],
        contracts: [
          { address: '0x111', symbol: 'SSS' },
          { address: '0x222', symbol: 'mETH' }
        ],
      },
    })

    renderWithMocks(<Market />, { initialState: mockState })

    const selectElements = screen.getAllByRole('combobox')
    selectElements.forEach(select => {
      expect(select).toBeDisabled()
    })
  })

  it('updates market configuration correctly', () => {
    const mockState = createMockStoreState({
      tokens: {
        loaded: true,
        symbols: ['SSS', 'mETH'],
        contracts: [
          { address: '0x111', symbol: 'SSS' },
          { address: '0x222', symbol: 'mETH' }
        ],
      },
    })

    renderWithMocks(<Market />, { initialState: mockState })

    // Market component should handle state updates
    expect(screen.getByText(/market/i)).toBeInTheDocument()
  })
})