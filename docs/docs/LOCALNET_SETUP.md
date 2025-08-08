# 🚀 Local Testnet Setup Guide

## Quick Start (Recommended)

Use the automated setup script for the fastest experience:

```bash
npm run setup:local
```

This will:
- Start Anvil (local blockchain)
- Deploy all contracts
- Seed with sample data
- Update frontend configuration
- Provide connection instructions

## Manual Setup

If you prefer to set up step by step:

### 1. Start Local Blockchain

```bash
# Terminal 1: Start Anvil
npm run node:local
# or directly: anvil --host 0.0.0.0 --port 8545
```

### 2. Deploy Contracts

```bash
# Terminal 2: Deploy contracts
npm run deploy:local
```

### 3. Seed Test Data (Optional)

```bash
npm run seed:local
```

### 4. Start Frontend

```bash
npm run dev
```

## MetaMask Configuration

### Add Local Network

1. Open MetaMask
2. Go to Settings → Networks → Add a network manually
3. Enter these details:
   - **Network Name**: `Localhost 8545`
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`

### Import Test Account

Import the main test account with abundant tokens:

- **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

> ⚠️ **Security Note**: This is a well-known test key. NEVER use it on mainnet or with real funds!

## Testing Trading Functionality

### Current Deployment Addresses
```
SSS Token:  0x4b6aB5F819A515382B0dEB6935D793817bB4af28
mETH Token: 0xCace1b78160AE76398F486c8a18044da0d66d86D  
mDAI Token: 0xD5ac451B0c50B9476107823Af206eD814a2e2580
Exchange:   0xF8e31cb472bc70500f08Cd84917E5A1912Ec8397
```

### Test Scenarios

**All order filling scenarios are tested and working:**

✅ **Sell Orders**: Create order "I want mETH, I give SSS" → Someone provides mETH, receives SSS  
✅ **Buy Orders**: Create order "I want SSS, I give mETH" → Someone provides SSS, receives mETH  
✅ **Fee Calculation**: 1% fee deducted from what the order filler provides  
✅ **Balance Updates**: All token transfers work correctly  
✅ **Order Management**: Create, fill, cancel orders  

### Frontend Features to Test

1. **Local Setup Helper** - Click the "ℹ️ Local Setup" button in the bottom-right corner for interactive setup guide
2. **Connect Wallet** - Connect MetaMask to localhost network
3. **Token Balances** - View SSS, mETH, mDAI balances  
4. **Deposit/Withdraw** - Move tokens between wallet and exchange
5. **Create Orders** - Make buy/sell orders
6. **Fill Orders** - Take existing orders
7. **Order History** - View past trades
8. **Real-time Updates** - See balance changes immediately

### Built-in Setup Assistant

The frontend now includes an interactive local setup guide:
- **Automatic network configuration** - One-click to add localhost network to MetaMask
- **Test account details** - Copy-paste ready private keys and addresses
- **Current contract addresses** - All deployed contract addresses with copy buttons
- **Step-by-step instructions** - Complete setup walkthrough
- **Feature verification** - List of all tested trading features

## Verification Commands

```bash
# Check if everything is running
npm run test:e2e

# Verify contract functionality
npm run test:contracts

# Check frontend connectivity  
npm run check:frontend
```

## Troubleshooting

### Common Issues

**"No contract deployed at address"** 
→ Run `npm run deploy:local` to redeploy contracts

**"Nonce too low" errors**  
→ Restart Anvil: `pkill anvil && npm run node:local`

**MetaMask connection issues**  
→ Reset account in MetaMask settings or clear activity tab data

**Frontend shows 0 balances**  
→ Make sure you're connected to the correct network (Chain ID 31337)

### Reset Everything

```bash
# Kill all processes and start fresh
pkill anvil
npm run setup:local
```

## Development Notes

- **Order Filling Logic**: Fixed critical token transfer bug in Exchange.sol
- **Fee Structure**: 1% fee paid by order filler, sent to fee account
- **Test Coverage**: All scenarios covered by Forge tests
- **Gas Optimization**: Contracts optimized for local testing

## Ready for Production

The order filling logic has been thoroughly tested and debugged:

- ✅ Token transfers work correctly for both sides of trades
- ✅ Fees are calculated and distributed properly  
- ✅ All edge cases are handled (insufficient balance, cancelled orders, etc.)
- ✅ Smart contracts pass comprehensive test suite
- ✅ Frontend can interact with all contract functions

Happy trading! 🎉