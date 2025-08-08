# 🚀 Deployment Guide - Base Sepolia Migration

This guide covers deploying your orderbook smart contracts to Base Sepolia testnet using Foundry.

## ✅ Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed ✓ 
- Private key for deployment wallet
- Base Sepolia ETH for gas fees ([Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- BaseScan API key for contract verification (optional but recommended)

## 🔧 Setup

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Update `.env` with your values:
```bash
# Private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# API keys for contract verification  
BASESCAN_API_KEY=your_basescan_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 2. Get Base Sepolia ETH

Visit the [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet) and get test ETH for your deployment wallet.

## 📋 Network Information

- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532  
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org/
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## 🚀 Deployment Steps

### 1. Compile Contracts

```bash
forge build
```

### 2. Test Contracts (Optional)

```bash
forge test -v
```

### 3. Deploy to Base Sepolia

```bash
# Deploy contracts
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify

# Or using npm script
npm run deploy:base-sepolia
```

The deployment will:
- Deploy SSS Token contract
- Deploy mETH Token contract  
- Deploy mDAI Token contract
- Deploy Exchange contract
- Automatically verify contracts on BaseScan (if API key provided)

### 4. Update Frontend Configuration

After deployment, you'll see output like this:

```
SSS Token: 0x...
mETH Token: 0x...
mDAI Token: 0x...
Exchange: 0x...

To update the frontend config, add these addresses to src/config.json:
  "84532": {
    "exchange": { "address": "0x..." },
    "SSS": { "address": "0x..." },
    "mETH": { "address": "0x..." },
    "mDAI": { "address": "0x..." },
    "explorerURL": "https://sepolia.basescan.org/"
  }
```

Copy the addresses and update `src/config.json` with the deployed contract addresses for chain ID `84532`.

### 5. Seed Exchange (Optional)

To add sample orders and test data:

1. First, update `script/Seed.s.sol` with the deployed contract addresses
2. Run the seeding script:

```bash
forge script script/Seed.s.sol --rpc-url base_sepolia --broadcast

# Or using npm script  
npm run seed:base-sepolia
```

## 🔍 Verification

### Check Deployment

Visit https://sepolia.basescan.org/ and search for your deployed contract addresses to verify they were deployed successfully.

### Test Frontend

1. Start the development server:
```bash
npm run dev
```

2. Configure MetaMask for Base Sepolia:
   - Network Name: Base Sepolia  
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency Symbol: ETH

3. Test the application:
   - Connect your wallet
   - Check token balances
   - Test deposits/withdrawals
   - Create test orders

## 📝 Available Scripts

```bash
# Foundry scripts
npm run compile          # Compile contracts
npm run test:contracts   # Run contract tests
npm run node:local       # Start local Anvil node

# Deployment
npm run deploy:local           # Deploy to local node
npm run deploy:base-sepolia    # Deploy to Base Sepolia  
npm run deploy:ethereum-sepolia # Deploy to Ethereum Sepolia

# Seeding
npm run seed:local           # Seed local deployment
npm run seed:base-sepolia    # Seed Base Sepolia deployment
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Insufficient funds" error
- Ensure your deployment wallet has Base Sepolia ETH
- Get more from the faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

#### 2. "Invalid private key" error  
- Check that your private key in `.env` is correct
- Ensure it doesn't have the `0x` prefix

#### 3. "Contract verification failed"
- Verification requires a BaseScan API key
- Get one at: https://basescan.org/apis
- Add it to your `.env` file as `BASESCAN_API_KEY`

#### 4. Frontend not connecting
- Make sure MetaMask is configured for Base Sepolia (Chain ID: 84532)
- Check that contract addresses in `src/config.json` match deployed addresses
- Clear browser cache and restart development server

#### 5. "Network mismatch" in frontend
- Verify the chain ID in the frontend matches Base Sepolia (84532)
- Check that the RPC URL is correct: https://sepolia.base.org

## 🔗 Useful Links

- [Base Documentation](https://docs.base.org/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [BaseScan (Base Sepolia)](https://sepolia.basescan.org/)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [MetaMask Network Configuration](https://docs.base.org/using-base/)

## 🎯 Next Steps

After successful deployment:

1. **Test thoroughly** on Base Sepolia
2. **Add more trading pairs** if needed
3. **Implement additional features** (stop-loss orders, etc.)
4. **Consider mainnet deployment** when ready

## 📞 Support

If you encounter issues:
- Check the troubleshooting section above
- Review Foundry logs for error details
- Verify your environment configuration
- Test on local network first if deployment fails