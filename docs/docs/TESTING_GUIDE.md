# Testing Guide: Wallet Connection & Trading

## Setup Your Wallet

1. **Add Local Network to MetaMask:**
   - Network Name: `Local Testnet`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Test Account:**
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This gives you access to the pre-funded test account

## Test Contract Addresses

- **Token Contract:** `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`
- **OrderBook Contract:** `0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82`

## Testing Checklist

### ☐ Wallet Connection
1. Open http://localhost:3502
2. Connect your MetaMask wallet
3. Verify you see your balance (~999,995 tokens)

### ☐ View Existing Orders
1. Check that 2 seeded orders are visible
2. Verify order details display correctly

### ☐ Place New Orders
1. Try placing a buy order
2. Try placing a sell order
3. Confirm transactions in MetaMask

### ☐ Cancel Orders
1. Cancel one of your orders
2. Verify it disappears from the UI

### ☐ Execute Trades
1. Place matching buy/sell orders
2. Verify trades execute automatically
3. Check balance updates

## Expected Behavior

- All transactions should confirm quickly (~2 seconds)
- UI should update in real-time
- Token balances should reflect trades
- Order book should show live updates

## Troubleshooting

If wallet connection fails:
- Ensure MetaMask is on the Local Testnet network
- Clear MetaMask activity data for this site
- Refresh the page and try again

If transactions fail:
- Check you have enough ETH for gas
- Verify contract addresses match deployed contracts