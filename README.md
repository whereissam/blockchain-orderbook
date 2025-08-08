# 🚀 Blockchain Order Book Exchange

A decentralized exchange (DEX) with a complete order book system built on Ethereum. Features token trading, order management, and real-time price charts.

## ✨ Features

- **Complete Order Book** - Create, fill, and cancel buy/sell orders
- **Token Trading** - Trade ERC-20 tokens with automated market making
- **Real-time Interface** - Live updates of orders, trades, and balances  
- **Fee System** - Configurable trading fees with automatic distribution
- **Multi-network Support** - Works on Ethereum, Base, and local testnets

## 🏗️ Architecture

### Smart Contracts
- **Exchange Contract** - Core trading logic and order management
- **Token Contracts** - ERC-20 tokens for testing (SSS, mETH, mDAI)
- **Libraries** - Reusable exchange utilities

### Frontend
- **React + Vite** - Modern web interface
- **Web3 Integration** - MetaMask wallet connection
- **Real-time Updates** - Live trading data via WebSocket-like events
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Local Development

1. **Start local blockchain:**
   ```bash
   npm run node:local
   ```

2. **Deploy contracts:**
   ```bash
   npm run deploy:local
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```

4. **Setup MetaMask:**
   - Click "ℹ️ Local Setup" button in the frontend
   - Follow the interactive setup guide

### Production Deployment

See [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## 🧪 Testing

```bash
# Smart contract tests
npm run test:contracts

# Frontend tests  
npm run test

# End-to-end tests
npm run test:e2e

# Complete integration test
npm run test:full
```

## 📁 Project Structure

```
├── contracts/           # Smart contracts
├── src/                # Frontend React app
├── scripts/            # Deployment and utility scripts
├── test/               # Smart contract tests
├── docs/               # Documentation
├── screenshots/        # UI screenshots
├── archive/            # Legacy files and old tests
└── deployments/        # Deployment artifacts
```

## 📖 Documentation

- **[Local Setup Guide](docs/LOCALNET_SETUP.md)** - Complete local development setup
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Testing Guide](docs/TESTING_GUIDE.md)** - How to run and write tests
- **[Contract Structure](docs/CONTRACTS_STRUCTURE.md)** - Smart contract architecture
- **[UI Color Guide](docs/COLOR_GUIDE.md)** - Frontend styling reference

## 🔧 Key Commands

```bash
# Development
npm run dev              # Start frontend
npm run node:local       # Start Anvil (local blockchain)
npm run deploy:local     # Deploy to local network

# Testing
npm run test:contracts   # Run Forge tests
npm run test            # Run frontend tests
npm run test:e2e        # End-to-end tests

# Build
npm run build           # Build for production
npm run compile         # Compile smart contracts

# Deployment
npm run deploy:base-sepolia     # Deploy to Base Sepolia
npm run deploy:ethereum-sepolia # Deploy to Ethereum Sepolia
```

## 🌐 Live Demo

- **Base Sepolia**: [View contracts on BaseScan](https://sepolia.basescan.org/)
- **Ethereum Sepolia**: [View contracts on Etherscan](https://sepolia.etherscan.io/)

## 🔒 Security Features

- **Reentrancy Protection** - Guards against common attack vectors
- **Access Controls** - Proper permission management
- **Input Validation** - Comprehensive parameter checking
- **Test Coverage** - 100% test coverage on core functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚨 Disclaimer

This is educational/demonstration software. Use at your own risk. Not audited for production use.

---

**Need help?** Check the [docs/](docs/) directory or open an issue!