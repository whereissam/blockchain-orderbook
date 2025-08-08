# Local Testnet Setup & Testing Guide

This guide will walk you through setting up and testing the blockchain orderbook application with a local testnet.

## 🚀 Quick Start (Automated)

For a complete automated setup, run:

```bash
npm run test:setup
```

This will automatically:
- Start Anvil blockchain
- Deploy all contracts  
- Seed test data
- Run verification tests

## 📋 Manual Setup (Step by Step)

### Prerequisites

1. **Node.js** (>= 18.0.0)
2. **Foundry** - Install from [https://getfoundry.sh/](https://getfoundry.sh/)
3. **Git** for cloning

### Step 1: Start Local Blockchain

Open a new terminal and start Anvil:

```bash
npm run node:local
```

You should see output like:
```
Available Accounts
==================
(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000.000000000000000000 ETH)
(1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000.000000000000000000 ETH)
...

Listening on 127.0.0.1:8545
```

✅ **Verification**: The blockchain should be running on `http://127.0.0.1:8545` with Chain ID `31337`

### Step 2: Deploy Contracts

In a new terminal (keep Anvil running):

```bash
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 ETHERSCAN_API_KEY=dummy forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --skip-simulation
```

Expected output:
```
SSS Token deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
mETH Token deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512  
mDAI Token deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Exchange deployed to: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

✅ **Verification**: Check that `src/config.json` contains the `31337` network configuration with these addresses.

### Step 3: Seed Test Data

```bash
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 ETHERSCAN_API_KEY=dummy forge script script/Seed.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --skip-simulation
```

Expected output:
```
Seeding exchange with sample data...
Setting up test data...
Creating sample orders...
Exchange seeded successfully!
```

✅ **Verification**: Run blockchain tests to confirm setup:

```bash
npm test -- --run simpleBlockchain.test.js
```

### Step 4: Start Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:3501` (or 3502 if 3501 is busy).

## 🧪 Testing the Setup

### 1. Blockchain Tests

```bash
# Run all blockchain connectivity tests
npm run test:blockchain

# Or run the simple connectivity test
npm test -- --run simpleBlockchain.test.js
```

### 2. Component Tests

```bash
# Test individual UI components
npm run test:components

# Test with coverage
npm run test:coverage
```

### 3. Integration Tests

```bash
# Test complete user workflows
npm run test:integration
```

## 🔧 Frontend Configuration

The application automatically detects the local network when you:

1. **Connect MetaMask** to `http://127.0.0.1:8545`
2. **Add Custom Network** with:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

3. **Import Test Account** using private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

## 📊 Expected Frontend Data

Once connected, the frontend should display:

### Balance Component
- **Wallet Balances**: 
  - SSS: 1,000,000,000 tokens
  - mETH: 1,000,000,000 tokens  
  - mDAI: 1,000,000,000 tokens
- **Exchange Balances**: 
  - SSS: 5,000 tokens (deposited during seeding)
  - mETH: 5,000 tokens
  - mDAI: 5,000 tokens

### Market Component
- Available trading pairs:
  - SSS/mETH
  - SSS/mDAI
  - mETH/mDAI

### Order Book Component
- **Sell Orders**: 2 sample orders created during seeding
  - 100 SSS for 0.1 mETH
  - 50 SSS for 0.05 mETH
- **Buy Orders**: (initially empty, create via Order component)

### Trade History Component
- Initially empty
- Will populate as orders are filled

### Order Component
- **Buy/Sell tabs** functional
- **Input validation** for amounts and prices
- **Balance checks** before order creation

## 🛠️ Troubleshooting

### Frontend Shows "Setup Required"

**Problem**: Frontend displays setup screen instead of trading interface.

**Solutions**:
1. **Check MetaMask Network**: Ensure connected to `localhost:8545` with Chain ID `31337`
2. **Import Account**: Import the test account private key into MetaMask
3. **Refresh Page**: After network/account changes
4. **Check Console**: Look for connection errors in browser dev tools

### "No Orders" in Order Book

**Problem**: Order book appears empty.

**Solutions**:
1. **Verify Seeding**: Re-run the seed script
2. **Check Network**: Ensure frontend is on correct network
3. **Refresh Data**: Click refresh or reload page

### Balance Shows Zero

**Problem**: Token balances show as 0 or undefined.

**Solutions**:
1. **Check Token Addresses**: Verify `src/config.json` has correct addresses
2. **Network Mismatch**: Ensure MetaMask is on localhost network
3. **Contract Deployment**: Verify contracts deployed successfully

### Transaction Failures

**Problem**: Deposits/withdrawals/orders fail.

**Solutions**:
1. **Gas Settings**: Use default gas settings in MetaMask
2. **Account Balance**: Ensure account has sufficient ETH for gas
3. **Contract Approval**: Some operations require token approval first

### Anvil Connection Issues

**Problem**: Cannot connect to blockchain.

**Solutions**:
1. **Port Conflicts**: Check if port 8545 is in use
2. **Firewall**: Ensure localhost connections allowed
3. **Restart Anvil**: Stop and restart the blockchain

## 📈 Testing Workflows

### Complete Order Creation & Filling Test

1. **Connect Wallet** to localhost network
2. **Check Initial Balances** (should show seeded amounts)
3. **Create Buy Order**:
   - Switch to Buy tab in Order component
   - Enter amount: 25 SSS
   - Enter price: 0.02 mETH
   - Click "Buy Order"
4. **Verify Order Appears** in Order Book
5. **Fill Order** (switch to different account or create sell order)
6. **Check Updated Balances** and Trade History

### Deposit/Withdraw Test

1. **Deposit Tokens**:
   - Go to Balance component
   - Enter amount in deposit field
   - Click "Deposit" button
   - Confirm transaction in MetaMask
2. **Verify Exchange Balance Updates**
3. **Withdraw Tokens**:
   - Enter amount in withdraw field
   - Click "Withdraw" button
   - Confirm transaction
4. **Verify Wallet Balance Updates**

## 🔍 Debugging Commands

### Check Blockchain Status
```bash
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://127.0.0.1:8545
```

### Verify Contract Deployment
```bash
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x5FbDB2315678afecb367f032d93F642f64180aa3", "latest"],"id":1}' http://127.0.0.1:8545
```

### Check Account Balance
```bash
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "latest"],"id":1}' http://127.0.0.1:8545
```

## 🧹 Cleanup

When finished testing:

```bash
# Automated cleanup
npm run test:cleanup

# Manual cleanup
# 1. Stop Anvil (Ctrl+C in terminal)
# 2. Stop frontend (Ctrl+C in terminal)  
# 3. Reset MetaMask network to mainnet
```

## 🚀 Production Deployment

For deploying to testnets or mainnet:

1. **Base Sepolia** (recommended for testing):
   ```bash
   npm run deploy:base-sepolia
   npm run seed:base-sepolia
   ```

2. **Ethereum Sepolia**:
   ```bash
   npm run deploy:ethereum-sepolia
   npm run seed:ethereum-sepolia
   ```

Make sure to set proper environment variables in `.env`:
```bash
PRIVATE_KEY=your_actual_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
```

## 💡 Tips for Development

1. **Keep Anvil Running**: Don't restart unless needed - it maintains state
2. **Use Browser Dev Tools**: Monitor console for Web3 connection issues  
3. **Test Multiple Accounts**: Import several test accounts for realistic trading
4. **Monitor Gas Usage**: Track transaction costs during development
5. **Backup Important Data**: Export MetaMask accounts and save deployment addresses

---

🎉 **Happy Testing!** You now have a fully functional local blockchain orderbook for development and testing.