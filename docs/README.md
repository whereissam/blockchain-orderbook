# SSS Token Exchange 

A decentralized exchange (DEX) built with React, Solidity, and Foundry for trading SSS tokens on Base Sepolia testnet.

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) package manager
- [MetaMask](https://metamask.io/) browser extension
- [Foundry](https://book.getfoundry.sh/getting-started/installation) toolkit

### 1. Clone & Install
```bash
git clone <repository-url>
cd blockchain-orderbook
bun install
```

### 2. Setup Environment
```bash
# Copy environment file
cp .env.example .env

# Add your private key to .env (without 0x prefix)
# PRIVATE_KEY=your_private_key_here
```

### 3. Switch to Base Sepolia Network

#### Option A: Use the App (Recommended)
1. Start the development server: `bun run dev`
2. Open http://localhost:5173
3. Connect your MetaMask wallet
4. Click the network dropdown in the navbar
5. Select **"Base Sepolia"**

#### Option B: Add Base Sepolia Manually
Add Base Sepolia network to MetaMask:
- **Network Name**: Base Sepolia
- **RPC URL**: https://sepolia.base.org
- **Chain ID**: 84532
- **Symbol**: ETH
- **Block Explorer**: https://sepolia.basescan.org/

### 4. Get Test Tokens

#### Get Base Sepolia ETH
Visit the [Coinbase Base Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet) to get Base Sepolia ETH for gas fees.

#### Get SSS Test Tokens
Contracts are already deployed on Base Sepolia. Get test tokens:
```bash
bun run seed:base-sepolia
```

This will send SSS and mETH tokens directly to your wallet address.

### 5. Add SSS Token to MetaMask
1. Open MetaMask
2. Click "Import Tokens"
3. **Contract Address**: `0x4cC9e56C00a7b94424D94231bF5B603a32a0BF6D`
4. **Symbol**: SSS
5. **Decimals**: 18

### 6. Start Trading!
1. Visit the Balance tab in the app
2. Deposit your SSS tokens to the exchange
3. Start placing buy/sell orders

## 📋 Available Commands

### Development
```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build
```

### Smart Contracts
```bash
# Compile contracts
bun run compile

# Test contracts  
bun run test:contracts

# Deploy to networks
bun run deploy:base-sepolia
bun run deploy:ethereum-sepolia
bun run deploy:local

# Seed test data
bun run seed:base-sepolia
bun run seed:ethereum-sepolia
bun run seed:local
```

### Code Quality
```bash
bun run lint         # Lint and fix code
bun run format       # Format code
bun run type-check   # TypeScript type checking
```

## 🌐 Supported Networks

### Base Sepolia (Recommended)
- **Chain ID**: 84532
- **Status**: ✅ Contracts deployed and ready
- **Tokens**: SSS, mETH, mDAI
- **Exchange**: Fully functional

### Ethereum Sepolia
- **Chain ID**: 11155111
- **Status**: Requires manual deployment
- **Setup**: Run `bun run deploy:ethereum-sepolia`

### Localhost Development
- **Chain ID**: 31337
- **Status**: Requires local setup
- **Setup**: 
  1. `bun run node:local` 
  2. `bun run deploy:local`
  3. `bun run seed:local`

## 📦 Contract Addresses (Base Sepolia)

- **SSS Token**: `0x4cC9e56C00a7b94424D94231bF5B603a32a0BF6D`
- **mETH Token**: `0xe6f9D40767Db3D90ac878228ABf407C675de1ba5`  
- **mDAI Token**: `0xAD2A615a5121A79124e9704C259e7772721386a7`
- **Exchange**: `0x43d827e34D3e98F987075a469C513f8b8bA28a26`

## 🎯 Features

- **Token Trading**: Trade SSS tokens against mETH/mDAI
- **Order Book**: View live buy/sell orders
- **Balance Management**: Deposit/withdraw tokens
- **Price Charts**: Real-time price visualization
- **Multi-Network**: Support for multiple testnets
- **Responsive UI**: Works on desktop and mobile

## 🔧 Troubleshooting

### "Transaction Will Fail" Error
This usually means:
1. **No tokens in wallet** → Get tokens using `bun run seed:base-sepolia`
2. **Wrong network** → Switch to Base Sepolia
3. **Insufficient balance** → Check your SSS token balance

### Network Issues
- Make sure you're on Base Sepolia (Chain ID: 84532)
- Add Base Sepolia network to MetaMask if it's not showing
- Get Base Sepolia ETH from the faucet for gas fees

### Missing Tokens
- Import SSS token using contract address: `0x4cC9e56C00a7b94424D94231bF5B603a32a0BF6D`
- Run seed script: `bun run seed:base-sepolia`

## 🏗️ Architecture

### Frontend
- **React 19** with functional components
- **Vite** for fast development
- **Zustand** for state management
- **ethers.js** for blockchain interaction
- **ApexCharts** for price visualization

### Smart Contracts (Following Industry Standards)
- **Solidity 0.8.9** with structured organization
- **Foundry + Hardhat** dual framework support
- **Interface-driven design** for better interoperability
- **Modular architecture** following DeFi best practices

```
contracts/
├── core/           # Main business logic contracts
├── interfaces/     # Contract interfaces (IExchange, IToken)
├── libraries/      # Reusable code libraries
├── mocks/          # Testing contracts
└── utils/          # Helper contracts
```

### Development Tools
- **Foundry** for smart contract development and testing
- **Hardhat** for additional tooling and JavaScript tests
- **ESLint + Prettier** for code quality
- **Husky** for git hooks
- **Vitest** for frontend testing

### Project Structure
This project follows widely adopted smart contract development standards:

- **`contracts/`**: Organized by function (core, interfaces, libraries, mocks)
- **`scripts/`**: Separated by framework (foundry/, hardhat/, deployment/, interaction/)
- **`test/`**: Multiple testing strategies (foundry/, hardhat/, unit/, integration/)

See [CONTRACTS_STRUCTURE.md](CONTRACTS_STRUCTURE.md) for detailed documentation.

## 📚 Documentation

- [Foundry Book](https://book.getfoundry.sh/) - Smart contract development
- [Base Docs](https://docs.base.org/) - Base blockchain documentation
- [ethers.js](https://docs.ethers.org/) - Ethereum library documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.