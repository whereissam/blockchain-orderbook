// Test setup file
import React from 'react'
import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock CSS imports
vi.mock('../App.css', () => ({}))
vi.mock('../styles/color-enhancements.css', () => ({}))

// Mock Tailwind CSS
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

global.localStorage = localStorageMock

// Mock window.ethereum (MetaMask)
global.window.ethereum = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  isMetaMask: true,
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('')),
  },
})

// Mock window.alert
global.alert = vi.fn()

// Mock moment for consistent dates in tests
vi.mock('moment', () => {
  const moment = vi.fn(() => ({
    format: vi.fn(() => '12:34:56pm Jan 1'),
    unix: vi.fn(() => ({
      format: vi.fn(() => '12:34:56pm Jan 1'),
    })),
  }))
  moment.unix = vi.fn(() => ({
    format: vi.fn(() => '12:34:56pm Jan 1'),
  }))
  return { default: moment }
})

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
    BrowserProvider: vi.fn(),
    JsonRpcProvider: vi.fn(),
    Contract: vi.fn(),
    parseEther: vi.fn((value) => value),
    parseUnits: vi.fn((value) => value),
    formatEther: vi.fn((value) => value),
    formatUnits: vi.fn((value) => value),
    getAddress: vi.fn((address) => address),
  },
}))

// Mock Radix UI components  
vi.mock('@radix-ui/react-tabs', () => ({
  Root: vi.fn(({ children }) => children),
  List: vi.fn(({ children }) => children),
  Trigger: vi.fn(({ children }) => children),
  Content: vi.fn(({ children }) => children),
}))

vi.mock('@radix-ui/react-select', () => ({
  Root: vi.fn(({ children }) => children),
  Trigger: vi.fn(({ children }) => children),
  Content: vi.fn(({ children }) => children),
  Item: vi.fn(({ children }) => children),
  Value: vi.fn(({ children }) => children),
}))

// Mock ApexCharts
vi.mock('react-apexcharts', () => ({
  default: vi.fn(() => null),
}))

// Mock GSAP
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn(),
    from: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn(),
      from: vi.fn(),
      play: vi.fn(),
      pause: vi.fn(),
    })),
  },
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}))

// Mock Wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    address: null,
    isConnected: false,
  })),
  useConnect: vi.fn(() => ({
    connect: vi.fn(),
    connectors: [],
  })),
  useDisconnect: vi.fn(() => ({
    disconnect: vi.fn(),
  })),
}))

// Mock Reown AppKit
vi.mock('@reown/appkit-adapter-wagmi', () => ({
  createAppKit: vi.fn(),
}))