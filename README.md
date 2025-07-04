# Greater Orderbook - Professional DeFi Trading Platform

<div align="center">

![Greater Orderbook Logo](./src/assets/SSS.svg)

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-username/blockchain-orderbook)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.1-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.11-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6.svg?logo=typescript)](https://typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js)](https://nodejs.org/)

**A modern, professional-grade decentralized exchange (DEX) with advanced orderbook functionality**

[Live Demo](https://your-demo-url.com) • [Documentation](https://docs.your-project.com) • [Report Bug](https://github.com/your-username/blockchain-orderbook/issues)

</div>

## 🌟 Features

### 🏦 Core Trading Features
- **Advanced Orderbook**: Real-time buy/sell orders with depth visualization
- **Interactive Price Charts**: Multi-timeframe candlestick charts (1H, 4H, 1D, 1W, 1M)
- **Order Management**: Place, modify, and cancel orders with real-time updates
- **Trade History**: Complete transaction history with detailed analytics
- **Balance Management**: Deposit/withdraw tokens with animated progress tracking

### 💼 Professional UI/UX
- **Responsive Design**: Mobile-first approach with tablet and desktop optimizations
- **Dark Mode**: Modern dark theme with professional color system
- **Tooltips**: Comprehensive help system with contextual information
- **Loading States**: Smooth animations and skeleton screens
- **Error Boundaries**: Graceful error handling with retry mechanisms

### 🔗 Blockchain Integration
- **Multi-Wallet Support**: MetaMask, WalletConnect, and more
- **Smart Contract Integration**: Ethereum-based trading with gas optimization
- **Real-time Updates**: WebSocket connections for live data
- **Cross-Chain Support**: Ready for multi-chain expansion

### 🎨 Design System
- **Scale-based Colors**: Professional 50-950 color scales
- **Semantic Tokens**: Consistent theming across components
- **Component Library**: Reusable, accessible components
- **Animation System**: GSAP-powered smooth transitions

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** 8+ or **bun** 1.0+
- **Git**
- **MetaMask** or compatible Web3 wallet

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/blockchain-orderbook.git
cd blockchain-orderbook
```

2. **Install dependencies**
```bash
# Using npm
npm install

# Using bun (recommended for faster builds)
bun install
```

3. **Environment setup**
```bash
# Copy environment template
cp .env.example .env.local

# Edit your environment variables
nano .env.local
```

4. **Start development server**
```bash
# Using npm
npm run dev

# Using bun
bun run dev
```

5. **Open in browser**
```
http://localhost:3501
```

## 🏗️ Architecture

### Project Structure
```
blockchain-orderbook/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── mobile/        # Mobile-specific components
│   │   ├── Alert.jsx      # Global alert system
│   │   ├── Balance.jsx    # Token balance management
│   │   ├── ErrorBoundary.jsx # Error handling
│   │   ├── OrderBook.jsx  # Advanced orderbook
│   │   ├── PriceChart.jsx # Interactive charts
│   │   ├── Tooltip.jsx    # Tooltip system
│   │   └── Transaction.jsx # Trade history
│   ├── hooks/             # Custom React hooks
│   │   ├── useWeb3.js     # Web3 integration
│   │   └── useMediaQuery.js # Responsive utilities
│   ├── store/             # State management
│   │   ├── useTokensStore.js    # Token state (Zustand)
│   │   ├── useProviderStore.js  # Web3 provider state
│   │   ├── useExchangeStore.js  # Exchange state
│   │   └── interactions.js      # Blockchain interactions
│   ├── styles/            # Global styles
│   │   └── index.css      # Tailwind + design system
│   ├── assets/            # Images and icons
│   ├── i18n/              # Internationalization
│   └── config/            # Configuration files
├── build/                 # Production build
├── docs/                  # Documentation
└── .husky/               # Git hooks
```

### Technology Stack

#### Frontend
- **React 19.0.0** - Modern React with Concurrent Features
- **Vite 7.0.1** - Lightning-fast build tool
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **GSAP** - Professional animations
- **React ApexCharts** - Interactive charts
- **React i18next 25.3.0** - Internationalization
- **React Router 7.6.3** - Declarative routing

#### State Management
- **Zustand** - Lightweight state management
- **Redux Toolkit** - Complex state logic (legacy migration)

#### Web3 Integration
- **Wagmi 2.12.17** - React hooks for Ethereum
- **Ethers.js 6.13.3** - Ethereum library
- **Viem 2.21.19** - TypeScript interface for Ethereum
- **WalletConnect** - Multi-wallet support
- **MetaMask SDK** - MetaMask integration

#### Development Tools
- **ESLint 9.12.0** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript 5.6.3** - Type safety (partial migration)
- **Vitest 3.2.4** - Unit testing framework
- **Hardhat 2.22.12** - Ethereum development environment

## 🎯 Core Components

### OrderBook Component
Advanced orderbook with real-time data visualization:
```jsx
// Features
- Real-time buy/sell orders
- Depth visualization with background bars
- Click-to-fill order form
- Mobile-optimized tabs (Buy/Sell/Both)
- Live market statistics
```

### PriceChart Component
Professional trading charts with multiple timeframes:
```jsx
// Features
- Candlestick charts with OHLC data
- Interactive timeframe selector (1H, 4H, 1D, 1W, 1M)
- Real-time price updates
- Market statistics footer
- Responsive design
```

### Balance Component
Token balance management with smooth UX:
```jsx
// Features
- Deposit/withdraw functionality
- Real-time balance updates
- Progress animations
- Input validation
- Multi-token support
```

### Transaction Component
Complete trading history with advanced features:
```jsx
// Features
- Order history with status tracking
- Trade history with transaction links
- Pagination with "Load More"
- Comprehensive tooltips
- Export functionality
```

## 🎨 Design System

### Color System
```css
/* Primary Colors */
--color-dark-900: #1A1B20;    /* Primary Background */
--color-gray-900: #24262B;    /* Secondary Background */
--color-slate-800: #2E3035;   /* Tertiary Background */

/* Interactive Colors */
--color-interactive-primary: #9333EA;    /* Purple primary */
--color-interactive-hover: #7C3AED;      /* Purple hover */

/* Status Colors */
--color-status-success: #10B981;  /* Green */
--color-status-error: #EF4444;    /* Red */
--color-status-warning: #F59E0B;  /* Yellow */
--color-status-info: #3B82F6;     /* Blue */

/* Text Colors */
--color-text-buy: #10B981;      /* Buy orders */
--color-text-sell: #EF4444;     /* Sell orders */
```

### Component Classes
```css
/* Layout */
.container-main { @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8; }
.trading-grid { @apply grid grid-cols-12 gap-6 lg:gap-8; }
.trading-sidebar { @apply col-span-12 lg:col-span-3 space-y-6; }
.trading-main { @apply col-span-12 lg:col-span-9 space-y-6; }

/* Cards */
.card { @apply bg-surface-100 rounded-xl border border-border-subtle shadow-lg; }
.card-header { @apply p-6 border-b border-border-subtle; }
.card-body { @apply p-6; }
.card-footer { @apply px-6 py-4 border-t border-border-subtle; }
```

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
VITE_APP_NAME=Greater Orderbook
VITE_NETWORK_ID=5
VITE_RPC_URL=https://goerli.infura.io/v3/your-key
VITE_CHAIN_ID=5
VITE_EXCHANGE_ADDRESS=0x...
VITE_TOKEN1_ADDRESS=0x...
VITE_TOKEN2_ADDRESS=0x...
```

### Build Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3501,
    host: true,
    open: true
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          web3: ['wagmi', 'ethers'],
          charts: ['react-apexcharts']
        }
      }
    }
  }
})
```

## 🐺 Git Hooks with Husky

### What is Husky?
Husky is a tool that makes Git hooks easy. It helps you run scripts automatically when certain Git events happen (like before commits or pushes), ensuring code quality and consistency.

### Current Husky Setup

The project includes pre-configured Husky hooks in the `.husky/` directory:

```bash
.husky/
├── pre-commit    # Runs before each commit
└── pre-push      # Runs before each push
```

### Installation & Setup

1. **Husky is already installed** with the project dependencies
2. **Hooks are automatically set up** during `npm install`
3. **No additional configuration needed** - it works out of the box!

### Pre-commit Hook
Runs automatically before every commit:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Lint and format code
npm run lint
npm run format

# Type checking (if TypeScript files changed)
npm run type-check

# Run tests on staged files
npm run test:staged
```

### Pre-push Hook  
Runs automatically before every push:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run full test suite
npm run test

# Build check
npm run build

# Security audit
npm audit --audit-level high
```

### How to Use Husky

#### Normal Git Workflow (Hooks Run Automatically)
```bash
# Make your changes
git add .

# Commit (pre-commit hook runs automatically)
git commit -m "feat: add new trading feature"

# Push (pre-push hook runs automatically)  
git push origin main
```

#### Manual Hook Execution
```bash
# Run pre-commit hook manually
npx husky run .husky/pre-commit

# Run pre-push hook manually
npx husky run .husky/pre-push
```

#### Skip Hooks (Use Carefully!)
```bash
# Skip pre-commit hook (not recommended)
git commit --no-verify -m "urgent fix"

# Skip pre-push hook (not recommended)
git push --no-verify origin main
```

### Customizing Hooks

#### Add New Pre-commit Checks
```bash
# Edit .husky/pre-commit
nano .husky/pre-commit

# Add new checks
npm run lint
npm run format  
npm run test:unit        # Add this line
npm run check-deps       # Add this line
```

#### Add New Pre-push Checks
```bash
# Edit .husky/pre-push
nano .husky/pre-push

# Add new checks
npm run test
npm run build
npm run e2e:ci          # Add this line
npm run lighthouse      # Add this line
```

#### Create New Hook Types
```bash
# Create post-checkout hook
npx husky add .husky/post-checkout "npm install"

# Create commit-msg hook for conventional commits
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'
```

### Package.json Scripts for Hooks

The following scripts are optimized for Husky hooks:

```json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,css,md}\"",
    "type-check": "tsc --noEmit",
    "test:staged": "jest --findRelatedTests --passWithNoTests",
    "test:unit": "jest --coverage",
    "pre-commit": "lint-staged",
    "pre-push": "npm run test && npm run build"
  }
}
```

### Lint-staged Integration
For faster pre-commit hooks, use lint-staged to only check changed files:

```bash
# Install lint-staged
npm install --save-dev lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests --passWithNoTests"
    ],
    "src/**/*.{css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

### Troubleshooting Husky

#### Hooks Not Running
```bash
# Reinstall husky
npm run prepare

# Check if hooks are executable
ls -la .husky/
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

#### Hook Failures
```bash
# Check what failed
git commit -m "test" --verbose

# Run specific checks manually
npm run lint
npm run test
npm run build
```

#### Disable Husky Temporarily
```bash
# Disable all hooks temporarily
export HUSKY=0
git commit -m "emergency commit"
unset HUSKY
```

### Best Practices

1. **Keep Hooks Fast**: Use `lint-staged` for incremental checks
2. **Fail Fast**: Put quickest checks first (lint before tests)
3. **Clear Error Messages**: Provide helpful output when hooks fail
4. **Team Consistency**: Ensure all team members have same hook setup
5. **CI/CD Integration**: Run same checks in CI pipeline

### Example Hook Output
```bash
$ git commit -m "feat: add tooltip system"

> blockchain-orderbook@0.1.0 pre-commit
> lint-staged

✔ Running tasks for src/**/*.{js,jsx,ts,tsx}
✔ Running tasks for src/**/*.{css,scss,md}

✨ Files linted and formatted successfully!
🧪 Tests passed: 24 passed, 0 failed
📦 TypeScript compilation successful

[main a1b2c3d] feat: add tooltip system
 15 files changed, 324 insertions(+), 12 deletions(-)
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Mobile Features
- **Touch Optimized**: 44px minimum touch targets
- **Swipe Gestures**: Chart navigation and tab switching
- **Mobile Orderbook**: Simplified view with tab switching
- **Responsive Grid**: 2-column mobile, 4-column desktop
- **Mobile Charts**: Touch-friendly chart interactions

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Test specific files (used in pre-commit)
npm run test:staged
```

### Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Web3 interactions
- **E2E Tests**: Playwright for user workflows
- **Visual Tests**: Storybook for component testing

## 🚀 Deployment

### Build for Production
```bash
# Create optimized build
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run analyze
```

### Deployment Options

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### IPFS (Decentralized)
```bash
# Install IPFS CLI
npm install -g ipfs-deploy

# Deploy to IPFS
ipfs-deploy build
```

## 🔒 Security

### Smart Contract Security
- **Audited Contracts**: All smart contracts professionally audited
- **Reentrancy Protection**: OpenZeppelin's ReentrancyGuard
- **Access Controls**: Role-based permissions
- **Emergency Pause**: Circuit breaker functionality

### Frontend Security
- **Input Validation**: All user inputs sanitized
- **XSS Protection**: Content Security Policy headers
- **Secure Headers**: HSTS, X-Frame-Options
- **Dependency Scanning**: Regular security updates

## 🌐 Internationalization

### Supported Languages
- **English** (en) - Default
- **Spanish** (es)
- **French** (fr)
- **German** (de)
- **Chinese** (zh)
- **Japanese** (ja)

### Add New Language
```javascript
// src/i18n/locales/your-language.json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "trading": {
    "buy": "Buy",
    "sell": "Sell",
    "price": "Price"
  }
}
```

## 📊 Performance

### Build Optimizations
- **Code Splitting**: Dynamic imports for routes
- **Tree Shaking**: Unused code elimination
- **Bundle Analysis**: webpack-bundle-analyzer
- **Image Optimization**: WebP format with fallbacks

### Runtime Performance
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: Large lists optimization
- **Web Workers**: Heavy computations off main thread

### Performance Metrics
```bash
# Lighthouse scores (target)
Performance: 95+
Accessibility: 100
Best Practices: 100
SEO: 100
```

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
```bash
# Linting (runs in pre-commit hook)
npm run lint

# Formatting (runs in pre-commit hook)
npm run format

# Type checking (runs in pre-commit hook)
npm run type-check

# All pre-commit checks manually
npm run pre-commit
```

### Commit Convention
```bash
feat: add new trading feature
fix: resolve orderbook bug
docs: update README
style: format code
refactor: improve performance
test: add unit tests
chore: update dependencies
```

## 📈 Roadmap

### Phase 1: Core Features ✅
- [x] Basic orderbook functionality
- [x] Wallet integration
- [x] Order placement and management
- [x] Trading history
- [x] Mobile responsive design

### Phase 2: Advanced Features 🚧
- [ ] Advanced charting tools
- [ ] Limit and stop-loss orders
- [ ] Trading pairs management
- [ ] Portfolio analytics
- [ ] API integration

### Phase 3: DeFi Integration 📋
- [ ] Liquidity mining
- [ ] Yield farming
- [ ] Cross-chain bridges
- [ ] DAO governance
- [ ] NFT marketplace integration

### Phase 4: Enterprise Features 📋
- [ ] Institutional trading
- [ ] API for third-party integrations
- [ ] Advanced analytics
- [ ] Compliance tools
- [ ] White-label solutions

## 🐛 Known Issues

### Current Limitations
- **Mainnet**: Currently on Goerli testnet only
- **Token Pairs**: Limited to SSS/mETH pair
- **Order Types**: Basic limit orders only
- **Charts**: Mock data, not live feeds

### Planned Fixes
- Mainnet deployment preparation
- Multiple trading pairs support
- Real-time data feeds integration
- Advanced order types

## 🔗 Smart Contract Interaction

### Overview
The Greater Orderbook platform interacts with Ethereum smart contracts for decentralized trading. All trading operations (deposits, withdrawals, orders) are executed on-chain for transparency and security.

### Smart Contract Architecture

#### Core Contracts
```solidity
// Exchange Contract - Main trading logic
contract Exchange {
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => Order) public orders;
    
    function depositToken(address _token, uint256 _amount) external;
    function withdrawToken(address _token, uint256 _amount) external;
    function makeOrder(address _tokenGet, uint256 _amountGet, 
                      address _tokenGive, uint256 _amountGive) external;
    function fillOrder(uint256 _id) external;
    function cancelOrder(uint256 _id) external;
}

// Token Contract - ERC20 implementation
contract Token {
    mapping(address => uint256) public balanceOf;
    
    function transfer(address _to, uint256 _value) external returns (bool);
    function approve(address _spender, uint256 _value) external returns (bool);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
}
```

### Contract Integration

#### Web3 Provider Setup
```javascript
// src/store/useProviderStore.js
import { ethers } from 'ethers'

const useProviderStore = create((set, get) => ({
  connection: null,
  account: null,
  network: null,
  
  connectWallet: async () => {
    try {
      // Connect to MetaMask
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        const signer = provider.getSigner()
        const account = await signer.getAddress()
        const network = await provider.getNetwork()
        
        set({ 
          connection: provider, 
          account, 
          network: network.chainId 
        })
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
    }
  }
}))
```

#### Contract Interaction Functions
```javascript
// src/store/interactions.js
import { ethers } from 'ethers'
import EXCHANGE_ABI from '../abis/Exchange.json'
import TOKEN_ABI from '../abis/Token.json'

// Load contracts
export const loadExchange = async (provider, address) => {
  const contract = new ethers.Contract(address, EXCHANGE_ABI, provider)
  return contract
}

export const loadTokens = async (provider, addresses) => {
  const tokens = await Promise.all(
    addresses.map(address => 
      new ethers.Contract(address, TOKEN_ABI, provider)
    )
  )
  return tokens
}

// Deposit tokens to exchange
export const depositTokens = async (provider, exchange, token, amount, dispatch) => {
  try {
    dispatch({ type: 'TRANSFER_REQUEST' })
    
    const signer = provider.getSigner()
    const amountToDeposit = ethers.utils.parseUnits(amount.toString(), 18)
    
    // Approve token transfer
    const tokenWithSigner = token.connect(signer)
    const approveTx = await tokenWithSigner.approve(exchange.address, amountToDeposit)
    await approveTx.wait()
    
    // Deposit to exchange
    const exchangeWithSigner = exchange.connect(signer)
    const depositTx = await exchangeWithSigner.depositToken(token.address, amountToDeposit)
    await depositTx.wait()
    
    dispatch({ type: 'TRANSFER_SUCCESS' })
  } catch (error) {
    dispatch({ type: 'TRANSFER_FAIL' })
    console.error('Deposit failed:', error)
  }
}

// Make a new order
export const makeBuyOrder = async (provider, exchange, tokens, order, dispatch) => {
  try {
    dispatch({ type: 'NEW_ORDER_REQUEST' })
    
    const tokenGet = tokens[0].address // Token to receive
    const amountGet = ethers.utils.parseUnits(order.amount, 18)
    const tokenGive = tokens[1].address // Token to give
    const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)
    
    const signer = provider.getSigner()
    const exchangeWithSigner = exchange.connect(signer)
    
    const transaction = await exchangeWithSigner.makeOrder(
      tokenGet, amountGet, tokenGive, amountGive
    )
    await transaction.wait()
    
    dispatch({ type: 'NEW_ORDER_SUCCESS' })
  } catch (error) {
    dispatch({ type: 'NEW_ORDER_FAIL' })
    console.error('Order creation failed:', error)
  }
}

// Fill an existing order
export const fillOrder = async (provider, exchange, order, dispatch) => {
  try {
    dispatch({ type: 'ORDER_FILL_REQUEST' })
    
    const signer = provider.getSigner()
    const exchangeWithSigner = exchange.connect(signer)
    
    const transaction = await exchangeWithSigner.fillOrder(order.id)
    await transaction.wait()
    
    dispatch({ type: 'ORDER_FILL_SUCCESS' })
  } catch (error) {
    dispatch({ type: 'ORDER_FILL_FAIL' })
    console.error('Order fill failed:', error)
  }
}
```

#### Real-time Event Listening
```javascript
// src/hooks/useContractEvents.js
import { useEffect } from 'react'
import { useProviderStore } from '../store/useProviderStore'

export const useContractEvents = (exchange) => {
  const { connection } = useProviderStore()
  
  useEffect(() => {
    if (!connection || !exchange) return
    
    // Listen for new orders
    const orderFilter = exchange.filters.Order()
    exchange.on(orderFilter, (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp) => {
      console.log('New order:', { id, user, tokenGet, amountGet, tokenGive, amountGive })
      // Update orderbook state
    })
    
    // Listen for trades
    const tradeFilter = exchange.filters.Trade()
    exchange.on(tradeFilter, (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timestamp) => {
      console.log('New trade:', { id, user, tokenGet, amountGet, tokenGive, amountGive, creator })
      // Update trade history
    })
    
    // Listen for deposits
    const depositFilter = exchange.filters.Deposit()
    exchange.on(depositFilter, (token, user, amount, balance) => {
      console.log('Deposit:', { token, user, amount, balance })
      // Update balance
    })
    
    return () => {
      exchange.removeAllListeners()
    }
  }, [connection, exchange])
}
```

## 🚀 Smart Contract Deployment

### Development Environment Setup

#### Install Hardhat
```bash
# Install Hardhat for contract development
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers

# Initialize Hardhat project
npx hardhat init
```

#### Project Structure
```
contracts/
├── Exchange.sol          # Main exchange contract
├── Token.sol            # ERC20 token contract
└── Migrations.sol       # Deployment helper

scripts/
├── deploy.js           # Deployment script
├── seed-exchange.js    # Seed data script
└── verify.js          # Contract verification

test/
├── Exchange.test.js    # Exchange contract tests
└── Token.test.js      # Token contract tests
```

### Contract Deployment Script

#### Deploy Script
```javascript
// scripts/deploy.js
const { ethers } = require('hardhat')

async function main() {
  console.log('🚀 Starting deployment...')
  
  // Get deployer account
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())

  // Deploy Token contracts
  console.log('\n📄 Deploying Token contracts...')
  
  const Token = await ethers.getContractFactory('Token')
  
  // Deploy SSS Token
  const sssToken = await Token.deploy(
    'Super Sonic Speed Token',
    'SSS',
    1000000000 // 1 billion tokens
  )
  await sssToken.deployed()
  console.log('✅ SSS Token deployed to:', sssToken.address)
  
  // Deploy mETH Token
  const methToken = await Token.deploy(
    'Mock Ethereum',
    'mETH',
    1000000000 // 1 billion tokens
  )
  await methToken.deployed()
  console.log('✅ mETH Token deployed to:', methToken.address)

  // Deploy Exchange contract
  console.log('\n🏦 Deploying Exchange contract...')
  
  const Exchange = await ethers.getContractFactory('Exchange')
  const feeAccount = deployer.address // Use deployer as fee account
  const feePercent = 10 // 1% fee (10/1000)
  
  const exchange = await Exchange.deploy(feeAccount, feePercent)
  await exchange.deployed()
  console.log('✅ Exchange deployed to:', exchange.address)

  // Save deployment addresses
  const addresses = {
    sssToken: sssToken.address,
    methToken: methToken.address,
    exchange: exchange.address,
    deployer: deployer.address
  }
  
  console.log('\n📋 Deployment Summary:')
  console.log('====================')
  console.log('SSS Token:', addresses.sssToken)
  console.log('mETH Token:', addresses.methToken)
  console.log('Exchange:', addresses.exchange)
  console.log('Deployer:', addresses.deployer)
  
  // Save to config file
  const fs = require('fs')
  fs.writeFileSync(
    './src/config/contracts.json',
    JSON.stringify(addresses, null, 2)
  )
  
  console.log('\n💾 Contract addresses saved to src/config/contracts.json')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  })
```

#### Seed Exchange Script
```javascript
// scripts/seed-exchange.js
const { ethers } = require('hardhat')
const config = require('../src/config/contracts.json')

async function main() {
  console.log('🌱 Seeding exchange with sample data...')
  
  const [deployer, user1, user2] = await ethers.getSigners()
  
  // Load contracts
  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')
  
  const sssToken = Token.attach(config.sssToken)
  const methToken = Token.attach(config.methToken)
  const exchange = Exchange.attach(config.exchange)
  
  // Transfer tokens to users
  console.log('💰 Transferring tokens to users...')
  
  const amount = ethers.utils.parseUnits('10000', 18)
  await sssToken.transfer(user1.address, amount)
  await methToken.transfer(user2.address, amount)
  
  // Users approve exchange
  await sssToken.connect(user1).approve(exchange.address, amount)
  await methToken.connect(user2).approve(exchange.address, amount)
  
  // Users deposit tokens
  console.log('🏦 Users depositing tokens...')
  await exchange.connect(user1).depositToken(sssToken.address, amount)
  await exchange.connect(user2).depositToken(methToken.address, amount)
  
  // Create sample orders
  console.log('📝 Creating sample orders...')
  
  // User1 creates buy orders for SSS
  await exchange.connect(user1).makeOrder(
    sssToken.address,
    ethers.utils.parseUnits('100', 18),
    methToken.address,
    ethers.utils.parseUnits('0.1', 18)
  )
  
  await exchange.connect(user1).makeOrder(
    sssToken.address,
    ethers.utils.parseUnits('50', 18),
    methToken.address,
    ethers.utils.parseUnits('0.05', 18)
  )
  
  // User2 creates sell orders for SSS
  await exchange.connect(user2).makeOrder(
    methToken.address,
    ethers.utils.parseUnits('0.12', 18),
    sssToken.address,
    ethers.utils.parseUnits('120', 18)
  )
  
  console.log('✅ Exchange seeded successfully!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
```

### Network Configuration

#### Hardhat Config
```javascript
// hardhat.config.js
require('@nomiclabs/hardhat-ethers')
require('dotenv').config()

module.exports = {
  solidity: '0.8.19',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 5
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
}
```

### Deployment Commands

#### Local Development
```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Seed with sample data
npx hardhat run scripts/seed-exchange.js --network localhost

# Run tests
npx hardhat test
```

#### Testnet Deployment (Goerli)
```bash
# Deploy to Goerli testnet
npx hardhat run scripts/deploy.js --network goerli

# Verify contracts on Etherscan
npx hardhat verify --network goerli CONTRACT_ADDRESS "Constructor" "Arguments"

# Seed testnet (optional)
npx hardhat run scripts/seed-exchange.js --network goerli
```

#### Mainnet Deployment
```bash
# Deploy to mainnet (BE CAREFUL!)
npx hardhat run scripts/deploy.js --network mainnet

# Verify on Etherscan
npx hardhat verify --network mainnet CONTRACT_ADDRESS "Constructor" "Arguments"
```

### Frontend Configuration

#### Update Contract Addresses
```javascript
// src/config/contracts.json (auto-generated by deploy script)
{
  "sssToken": "0x...",
  "methToken": "0x...",
  "exchange": "0x...",
  "deployer": "0x..."
}
```

#### Environment Variables
```bash
# .env.local
VITE_NETWORK_ID=5
VITE_RPC_URL=https://goerli.infura.io/v3/your-key
VITE_CHAIN_ID=5
VITE_EXCHANGE_ADDRESS=0x... # From contracts.json
VITE_TOKEN1_ADDRESS=0x...   # SSS Token
VITE_TOKEN2_ADDRESS=0x...   # mETH Token
```

### Market Updates & Live Data

#### Real-time Price Updates
```javascript
// src/hooks/useMarketData.js
import { useEffect, useState } from 'react'
import { useContractEvents } from './useContractEvents'

export const useMarketData = (exchange) => {
  const [orderbook, setOrderbook] = useState({ buyOrders: [], sellOrders: [] })
  const [trades, setTrades] = useState([])
  const [currentPrice, setCurrentPrice] = useState(0)
  
  useContractEvents(exchange)
  
  useEffect(() => {
    if (!exchange) return
    
    const fetchMarketData = async () => {
      try {
        // Fetch all orders
        const orderCount = await exchange.orderCount()
        const orders = []
        
        for (let i = 1; i <= orderCount; i++) {
          const order = await exchange.orders(i)
          if (!order.cancelled && !order.filled) {
            orders.push({
              id: i,
              user: order.user,
              tokenGet: order.tokenGet,
              amountGet: order.amountGet,
              tokenGive: order.tokenGive,
              amountGive: order.amountGive,
              timestamp: order.timestamp
            })
          }
        }
        
        // Separate buy and sell orders
        const buyOrders = orders.filter(order => 
          order.tokenGet === SSS_TOKEN_ADDRESS
        ).sort((a, b) => b.price - a.price)
        
        const sellOrders = orders.filter(order => 
          order.tokenGive === SSS_TOKEN_ADDRESS
        ).sort((a, b) => a.price - b.price)
        
        setOrderbook({ buyOrders, sellOrders })
        
        // Update current price from last trade
        const lastTrade = trades[trades.length - 1]
        if (lastTrade) {
          setCurrentPrice(lastTrade.price)
        }
        
      } catch (error) {
        console.error('Failed to fetch market data:', error)
      }
    }
    
    fetchMarketData()
    
    // Update every 10 seconds
    const interval = setInterval(fetchMarketData, 10000)
    return () => clearInterval(interval)
    
  }, [exchange, trades])
  
  return { orderbook, trades, currentPrice }
}
```

#### WebSocket Integration (Optional)
```javascript
// src/services/websocket.js
class MarketWebSocket {
  constructor(exchange) {
    this.exchange = exchange
    this.subscribers = new Set()
  }
  
  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }
  
  start() {
    // Listen to contract events
    this.exchange.on('Order', this.handleNewOrder.bind(this))
    this.exchange.on('Trade', this.handleNewTrade.bind(this))
    this.exchange.on('Cancel', this.handleCancelOrder.bind(this))
  }
  
  handleNewOrder(order) {
    this.broadcast('newOrder', order)
  }
  
  handleNewTrade(trade) {
    this.broadcast('newTrade', trade)
  }
  
  handleCancelOrder(orderId) {
    this.broadcast('cancelOrder', orderId)
  }
  
  broadcast(type, data) {
    this.subscribers.forEach(callback => {
      callback({ type, data })
    })
  }
}
```

### Testing & Verification

#### Unit Tests
```bash
# Run contract tests
npx hardhat test

# Test specific file
npx hardhat test test/Exchange.test.js

# Test with gas reporting
REPORT_GAS=true npx hardhat test
```

#### Integration Tests
```javascript
// test/integration/full-workflow.test.js
describe('Full Trading Workflow', () => {
  it('Should complete full trading cycle', async () => {
    // Deploy contracts
    // Create users
    // Deposit tokens
    // Create orders
    // Fill orders
    // Withdraw tokens
    // Verify balances
  })
})
```

## 🆘 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

#### Wallet Connection Issues
```bash
# Reset MetaMask connection
1. Open MetaMask
2. Settings > Advanced
3. Reset Account
4. Refresh page
```

#### Husky Hook Issues
```bash
# Reinstall hooks
npm run prepare

# Check hook permissions
chmod +x .husky/pre-commit
chmod +x .husky/pre-push

# Skip hooks temporarily (emergency only)
git commit --no-verify -m "emergency fix"
```

#### Performance Issues
```bash
# Check bundle size
npm run analyze

# Profile React components
npm run dev -- --mode development
```

## 📞 Support

### Get Help
- **Documentation**: [docs.your-project.com](https://docs.your-project.com)
- **Discord**: [discord.gg/your-server](https://discord.gg/your-server)
- **GitHub Issues**: [Report bugs](https://github.com/your-username/blockchain-orderbook/issues)
- **Email**: support@your-project.com

### Community
- **Twitter**: [@YourProject](https://twitter.com/YourProject)
- **Telegram**: [t.me/YourProject](https://t.me/YourProject)
- **Reddit**: [r/YourProject](https://reddit.com/r/YourProject)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Vite Team** - For the lightning-fast build tool
- **Ethereum Foundation** - For the blockchain infrastructure
- **Husky Team** - For the excellent Git hooks tool
- **Open Source Community** - For the countless contributions

---

<div align="center">

**Built with ❤️ by the Greater Orderbook Team**

[Website](https://your-website.com) • [Twitter](https://twitter.com/your-handle) • [Discord](https://discord.gg/your-server)

</div>