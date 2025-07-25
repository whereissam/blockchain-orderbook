# 🧪 Testing & Local Development Guide

This guide provides everything you need to test the blockchain orderbook application locally.

## 🚀 Quick Start (One Command)

```bash
npm run setup:local
```

This single command will:
- ✅ Start Anvil blockchain
- ✅ Deploy all contracts
- ✅ Seed test data
- ✅ Run verification tests
- ✅ Show setup instructions

## 📋 Manual Setup

If you prefer step-by-step control:

### 1. Start Blockchain
```bash
npm run node:local
```

### 2. Deploy Contracts
```bash
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 ETHERSCAN_API_KEY=dummy forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --skip-simulation
```

### 3. Seed Test Data
```bash
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 ETHERSCAN_API_KEY=dummy forge script script/Seed.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --skip-simulation
```

### 4. Start Frontend
```bash
npm run dev
```

## 🧪 Testing Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:components` | Unit tests for UI components |
| `npm run test:integration` | End-to-end workflow tests |
| `npm run test:blockchain` | Blockchain connectivity tests |
| `npm run test:coverage` | Test coverage report |
| `npm run test:ui` | Interactive test runner |

## 🔧 Diagnostic Tools

| Command | Description |
|---------|-------------|
| `npm run check:frontend` | Diagnose connection issues |
| `npm run setup:local` | One-command local setup |
| `npm run test:cleanup` | Clean up test environment |

## 🌐 MetaMask Configuration

1. **Add Custom Network:**
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Test Account:**
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

## 📊 Expected Frontend Data

After connecting to the local network, you should see:

### 💰 Balance Component
- **Wallet Balances:** 1B tokens each (SSS, mETH, mDAI)
- **Exchange Balances:** 5,000 tokens each (from seeding)

### 📈 Market Component
- Available pairs: SSS/mETH, SSS/mDAI, mETH/mDAI

### 📋 Order Book Component
- **Sample Orders:** 2 sell orders created during seeding
- **Buy Orders:** Create your own via Order component

### 📖 Order Component
- Functional buy/sell tabs
- Input validation
- Balance checking

### 📊 Trade History
- Shows completed trades
- Updates in real-time

## 🛠️ Troubleshooting

### "Setup Required" Screen
- ✅ Check MetaMask network (should be localhost:8545)
- ✅ Import test account
- ✅ Refresh page after changes

### Zero Balances
- ✅ Verify contract deployment
- ✅ Check network in MetaMask
- ✅ Try account switching

### Transaction Failures
- ✅ Ensure sufficient ETH for gas
- ✅ Check Anvil is running
- ✅ Reset MetaMask account if needed

## 📁 Test Files Structure

```
src/__tests__/
├── components/           # Component unit tests (6 files)
│   ├── Balance.test.jsx
│   ├── Order.test.jsx
│   ├── OrderBook.test.jsx
│   ├── Market.test.jsx
│   ├── Trade.test.jsx
│   └── Transaction.test.jsx
├── integration/          # Integration tests
│   └── orderFlow.test.jsx
├── blockchain/           # Blockchain tests
│   ├── localBlockchain.test.js
│   └── simpleBlockchain.test.js
├── setup.jsx            # Test configuration
├── testUtils.jsx        # Testing utilities
└── fileMock.js          # Asset mocks
```

## 🔄 Development Workflow

1. **Start Development:**
   ```bash
   npm run setup:local
   npm run dev
   ```

2. **Make Changes & Test:**
   ```bash
   npm test                    # Run all tests
   npm run test:components     # Test specific components
   ```

3. **Check Connection:**
   ```bash
   npm run check:frontend      # Diagnose issues
   ```

4. **Deploy to Testnet:**
   ```bash
   npm run deploy:base-sepolia # Or ethereum-sepolia
   ```

## 🏗️ Contract Addresses (Local)

When running locally, contracts are deployed to:

- **SSS Token:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **mETH Token:** `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **mDAI Token:** `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- **Exchange:** `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`

## 📚 Additional Resources

- **[LOCAL_TESTNET_GUIDE.md](LOCAL_TESTNET_GUIDE.md)** - Comprehensive setup guide
- **[TESTING.md](TESTING.md)** - Detailed testing documentation
- **[scripts/](scripts/)** - Setup and diagnostic scripts

## 💡 Pro Tips

1. **Keep Anvil Running:** Don't restart unless needed
2. **Use Browser Dev Tools:** Monitor console for Web3 errors
3. **Test Multiple Accounts:** Import several accounts for realistic testing
4. **Reset MetaMask:** If transactions fail, try resetting account
5. **Check Logs:** Use `tail -f anvil.log` to monitor blockchain activity

---

🎉 **Happy Testing!** Your local blockchain orderbook is ready for development and testing.