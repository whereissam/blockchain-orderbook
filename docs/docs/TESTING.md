# Testing Guide

This project includes comprehensive testing for both frontend components and blockchain integration.

## Test Structure

```
src/__tests__/
├── components/           # Component unit tests
│   ├── Balance.test.jsx
│   ├── Order.test.jsx
│   ├── OrderBook.test.jsx
│   ├── Market.test.jsx
│   ├── Trade.test.jsx
│   └── Transaction.test.jsx
├── integration/          # Integration tests
│   └── orderFlow.test.jsx
├── blockchain/           # Blockchain integration tests
│   └── localBlockchain.test.js
├── setup.js             # Test setup and mocks
└── testUtils.jsx        # Testing utilities and helpers
```

## Prerequisites

1. **Node.js** (>= 18.0.0)
2. **npm** (>= 8.0.0)
3. **Foundry** (for contract tests) - Install from [https://getfoundry.sh/](https://getfoundry.sh/)

## Quick Start

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Component tests only
npm run test:components

# Integration tests only  
npm run test:integration

# Blockchain tests only
npm run test:blockchain
```

### Test with Coverage
```bash
npm run test:coverage
```

### Interactive Test UI
```bash
npm run test:ui
```

## Local Blockchain Testing

### Manual Setup
1. Start local blockchain:
   ```bash
   # Using Anvil (recommended)
   npm run node:local
   
   # Or using Hardhat
   npm run hardhat:node
   ```

2. Deploy contracts:
   ```bash
   npm run deploy:local
   ```

3. Seed test data:
   ```bash
   npm run seed:local
   ```

4. Run blockchain tests:
   ```bash
   npm run test:blockchain
   ```

### Automated Setup
Use the automated setup script for a complete testing environment:

```bash
# Set up everything automatically
npm run test:setup

# Run full test suite with setup/cleanup
npm run test:full

# Clean up when done
npm run test:cleanup
```

## Test Types

### 1. Component Tests (`src/__tests__/components/`)

Unit tests for React components testing:
- Rendering and display logic
- User interactions (clicks, form inputs)
- State management integration
- Error handling
- Loading states

**Example:**
```javascript
import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithMocks } from '../testUtils'
import Balance from '../../components/Balance'

describe('Balance Component', () => {
  it('renders balance information correctly', () => {
    renderWithMocks(<Balance />)
    expect(screen.getByText('Balance')).toBeInTheDocument()
  })
})
```

### 2. Integration Tests (`src/__tests__/integration/`)

End-to-end workflow tests covering:
- Complete order creation and filling flows
- Multi-component interactions
- State synchronization across components
- Error handling in complex scenarios

**Example:**
```javascript
it('completes full order creation workflow', async () => {
  // Test creates order, verifies state updates, checks UI changes
})
```

### 3. Blockchain Tests (`src/__tests__/blockchain/`)

Direct blockchain interaction tests:
- Contract deployment and interaction
- Token operations (transfer, approve, etc.)
- Exchange operations (deposit, withdraw, orders)
- Event listening and handling
- Network condition simulation

**Example:**
```javascript
it('can deploy and interact with Token contract', async () => {
  const tokenContract = new ethers.Contract(address, abi, signer)
  const name = await tokenContract.name()
  expect(name).toBeDefined()
})
```

## Test Configuration

### Vitest Configuration (`vite.config.js`)
- 30-second timeout for blockchain operations
- jsdom environment for React component testing
- Coverage reporting with v8 provider
- Custom setup files for mocking

### Mock Setup (`src/__tests__/setup.js`)
Provides mocks for:
- `localStorage`
- `window.ethereum` (MetaMask)
- `console` methods
- `navigator.clipboard`
- `ethers` library
- `moment` for consistent dates

### Test Utilities (`src/__tests__/testUtils.jsx`)
Helper functions:
- `createMockToken()` - Creates mock token contracts
- `createMockExchange()` - Creates mock exchange contracts
- `createMockOrder()` - Creates mock order objects
- `createMockStoreState()` - Creates complete mock state
- `renderWithMocks()` - Renders components with mocked stores

## Writing Tests

### Component Test Template
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithMocks, createMockStoreState } from '../testUtils'
import YourComponent from '../../components/YourComponent'
import * as interactions from '../../store/interactions'

vi.mock('../../store/interactions')

describe('YourComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something', () => {
    const mockState = createMockStoreState({
      // Custom state overrides
    })
    
    renderWithMocks(<YourComponent />, { initialState: mockState })
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Integration Test Template
```javascript
it('completes workflow end-to-end', async () => {
  const mockInteraction = vi.mocked(interactions.someFunction)
  mockInteraction.mockResolvedValue(true)
  
  renderWithMocks(<ComponentA />)
  
  // Simulate user actions
  fireEvent.click(screen.getByText('Button'))
  
  // Verify interactions
  await waitFor(() => {
    expect(mockInteraction).toHaveBeenCalledWith(expectedArgs)
  })
})
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Mocking**: Mock external dependencies (blockchain, APIs) for unit tests
3. **Real Integration**: Use real blockchain for integration tests when possible
4. **Descriptive Names**: Test names should clearly describe what they're testing
5. **Setup/Teardown**: Clean up after tests, especially blockchain state
6. **Error Testing**: Include tests for error conditions and edge cases
7. **Async Handling**: Properly handle async operations with `waitFor`

## Troubleshooting

### Common Issues

**Tests timing out:**
- Increase `testTimeout` in vite.config.js
- Check if local blockchain is running
- Verify mock implementations

**Blockchain tests failing:**
- Ensure Anvil or Hardhat node is running on port 8545
- Check if contracts are deployed (`npm run deploy:local`)
- Verify test accounts have sufficient ETH balance

**Component tests failing:**
- Check if all required mocks are set up
- Verify store state matches component expectations
- Ensure DOM elements exist before interacting

**Coverage issues:**
- Add test files to coverage exclusions if needed
- Check that tests are actually running (not being skipped)

### Debug Mode
```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run specific test file
npm test -- Balance.test.jsx

# Run tests in watch mode
npm test -- --watch
```

## CI/CD Integration

For automated testing in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run Tests
  run: |
    npm ci
    npm run test:setup
    npm run test:coverage
    npm run test:cleanup
```

## Performance Considerations

- Component tests: ~50ms per test
- Integration tests: ~500ms per test  
- Blockchain tests: ~2-5s per test (depending on network)

Large test suites can be split using:
```bash
npm run test:components  # Fast feedback
npm run test:integration # Medium speed
npm run test:blockchain  # Slower, run less frequently
```