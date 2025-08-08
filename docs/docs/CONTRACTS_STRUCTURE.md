# Smart Contract Structure

This project follows the widely adopted smart contract development standards used by popular frameworks like Hardhat and Foundry.

## Directory Structure

```
blockchain-orderbook/
├── contracts/
│   ├── core/           # Main contracts that define the project's core logic
│   │   ├── Exchange.sol
│   │   └── Token.sol
│   ├── interfaces/     # Contract interfaces for better interoperability
│   │   ├── IExchange.sol
│   │   └── IToken.sol
│   ├── libraries/      # Reusable code and logic in the form of libraries
│   │   └── ExchangeLib.sol
│   ├── mocks/          # Mock contracts used exclusively for testing
│   │   ├── MockToken.sol
│   │   └── TestExchangeLib.sol
│   └── utils/          # Helper or utility contracts (currently empty)
├── scripts/
│   ├── foundry/        # Foundry scripts (.sol files)
│   │   ├── Deploy.s.sol
│   │   └── Seed.s.sol
│   ├── hardhat/        # Hardhat scripts (.js/.cjs files)
│   │   ├── deploy.cjs
│   │   └── seed-exchange.cjs
│   ├── deployment/     # Deployment automation scripts
│   │   └── quick-local-setup.sh
│   └── interaction/    # Scripts for interacting with deployed contracts
│       ├── check-frontend-connection.js
│       ├── setup-test-env.js
│       ├── test-complete-setup.js
│       └── test-contracts.js
├── test/
│   ├── foundry/        # Foundry tests (.t.sol files)
│   │   ├── Core.t.sol
│   │   ├── Exchange.t.sol
│   │   └── Token.t.sol
│   ├── hardhat/        # Hardhat tests (.js files)
│   │   ├── Exchange.test.js
│   │   ├── Lock.test.js
│   │   └── Token.test.js
│   ├── unit/           # Unit tests for specific functionality
│   │   └── ExchangeLib.test.js
│   └── integration/    # Integration tests (currently empty)
├── foundry.toml        # Foundry configuration
├── hardhat.config.cjs  # Hardhat configuration
└── package.json        # Node.js project configuration with updated scripts
```

## Key Benefits of This Structure

### 📁 **Organized Contracts**
- **`core/`**: Main business logic contracts (Exchange, Token)
- **`interfaces/`**: Defines contract APIs for better interoperability
- **`libraries/`**: Reusable functions (gas optimization and code reuse)
- **`mocks/`**: Test-only contracts that simulate real behavior
- **`utils/`**: Helper contracts for common operations

### 🔧 **Structured Scripts**
- **`foundry/`**: Solidity-based deployment and seeding scripts
- **`hardhat/`**: JavaScript-based deployment and interaction scripts
- **`deployment/`**: Shell scripts for complex deployment processes
- **`interaction/`**: Scripts to interact with deployed contracts

### 🧪 **Comprehensive Testing**
- **`foundry/`**: Fast Solidity-based tests using Forge
- **`hardhat/`**: JavaScript tests with full environment simulation
- **`unit/`**: Isolated testing of specific functions
- **`integration/`**: End-to-end testing across multiple contracts

## Updated Configuration

### Foundry Remappings
The `foundry.toml` now includes convenient import remappings:
```toml
remappings = [
    "@core/=contracts/core/",
    "@interfaces/=contracts/interfaces/",
    "@libraries/=contracts/libraries/",
    "@mocks/=contracts/mocks/",
    "@utils/=contracts/utils/"
]
```

### Package.json Scripts
All scripts have been updated to use the new directory structure:
- `npm run deploy:local` - Deploy using Foundry
- `npm run hardhat:deploy:local` - Deploy using Hardhat
- `npm run test:contracts` - Run Foundry tests
- `npm run hardhat:test` - Run Hardhat tests

## Development Workflow

1. **Core Development**: Add main contracts to `contracts/core/`
2. **Interface Definition**: Define interfaces in `contracts/interfaces/`
3. **Library Development**: Create reusable libraries in `contracts/libraries/`
4. **Testing**: Add comprehensive tests in appropriate test directories
5. **Deployment**: Use scripts in `scripts/foundry/` or `scripts/hardhat/`

## Import Patterns

### In Solidity Files
```solidity
import "@core/Exchange.sol";
import "@interfaces/IToken.sol";
import "@libraries/ExchangeLib.sol";
import "@mocks/MockToken.sol";
```

### In Test Files
```solidity
import "forge-std/Test.sol";
import "@core/Token.sol";
import "@core/Exchange.sol";
import "@mocks/MockToken.sol";
```

This structure provides:
- **Scalability**: Easy to add new contracts in appropriate directories
- **Maintainability**: Clear separation of concerns
- **Testability**: Comprehensive testing strategies
- **Industry Standards**: Follows best practices from leading DeFi projects