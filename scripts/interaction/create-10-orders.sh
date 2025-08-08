#!/bin/bash

echo "🎯 Creating 10+ Sample Orders for Frontend"
echo "=========================================="

# Contract addresses
TOKEN="0x610178dA211FEF7D417bC0e6FeD39F05609AD788"
EXCHANGE="0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82"

# Test accounts (from Anvil)
ACCOUNT1="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
ACCOUNT2="0x70997970C51812dc3A010C7d01b50e0d17dc79C8" 
ACCOUNT3="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
ACCOUNT4="0x90F79bf6EB2c4f870365E785982E1f101E93b906"

# Private keys
PK1="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PK2="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
PK3="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
PK4="0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"

RPC="http://localhost:8545"

echo "💰 Setting up accounts with tokens and ETH..."

# Transfer tokens to all accounts
cast send $TOKEN "transfer(address,uint256)" $ACCOUNT2 "15000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $TOKEN "transfer(address,uint256)" $ACCOUNT3 "15000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $TOKEN "transfer(address,uint256)" $ACCOUNT4 "15000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null

# Approve exchange
cast send $TOKEN "approve(address,uint256)" $EXCHANGE "100000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $TOKEN "approve(address,uint256)" $EXCHANGE "100000000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null  
cast send $TOKEN "approve(address,uint256)" $EXCHANGE "100000000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null
cast send $TOKEN "approve(address,uint256)" $EXCHANGE "100000000000000000000000" --private-key $PK4 --rpc-url $RPC > /dev/null

# Deposit ETH
cast send $EXCHANGE "depositEther()" --value "10000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositEther()" --value "8000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositEther()" --value "6000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositEther()" --value "7000000000000000000" --private-key $PK4 --rpc-url $RPC > /dev/null

# Deposit tokens 
cast send $EXCHANGE "depositToken(address,uint256)" $TOKEN "8000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositToken(address,uint256)" $TOKEN "6000000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositToken(address,uint256)" $TOKEN "7000000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositToken(address,uint256)" $TOKEN "5000000000000000000000" --private-key $PK4 --rpc-url $RPC > /dev/null

echo "✅ Accounts setup complete"

echo ""
echo "🟢 Creating BUY orders (ETH → Tokens):"

# Buy orders at various price levels
cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "1000000000000000000000" "0x0000000000000000000000000000000000000000" "980000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
echo "   1. Buy 1000 tokens @ 0.98 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "1500000000000000000000" "0x0000000000000000000000000000000000000000" "1425000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
echo "   2. Buy 1500 tokens @ 0.95 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "800000000000000000000" "0x0000000000000000000000000000000000000000" "736000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null
echo "   3. Buy 800 tokens @ 0.92 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "2000000000000000000000" "0x0000000000000000000000000000000000000000" "1800000000000000000000" --private-key $PK4 --rpc-url $RPC > /dev/null
echo "   4. Buy 2000 tokens @ 0.90 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "600000000000000000000" "0x0000000000000000000000000000000000000000" "522000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
echo "   5. Buy 600 tokens @ 0.87 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "1200000000000000000000" "0x0000000000000000000000000000000000000000" "1020000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
echo "   6. Buy 1200 tokens @ 0.85 ETH each"

echo ""
echo "🔴 Creating SELL orders (Tokens → ETH):"

# Sell orders at various price levels  
cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "1020000000000000000000" $TOKEN "1000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
echo "   7. Sell 1000 tokens @ 1.02 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "1575000000000000000000" $TOKEN "1500000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null
echo "   8. Sell 1500 tokens @ 1.05 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "864000000000000000000" $TOKEN "800000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
echo "   9. Sell 800 tokens @ 1.08 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "2200000000000000000000" $TOKEN "2000000000000000000000" --private-key $PK4 --rpc-url $RPC > /dev/null
echo "   10. Sell 2000 tokens @ 1.10 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "678000000000000000000" $TOKEN "600000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
echo "   11. Sell 600 tokens @ 1.13 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "1380000000000000000000" $TOKEN "1200000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null
echo "   12. Sell 1200 tokens @ 1.15 ETH each"

echo ""
echo "📊 Final order count:"
ORDER_COUNT=$(cast call $EXCHANGE "orderCount()" --rpc-url $RPC | cast --to-dec)
echo "   Total orders: $ORDER_COUNT"

echo ""
echo "✅ Created $ORDER_COUNT orders successfully!"
echo "🌐 Check your frontend at http://localhost:3502 to see the full orderbook"
echo ""
echo "📋 Order Summary:"
echo "   🟢 Buy orders:  6 orders (0.85 - 0.98 ETH per token)"
echo "   🔴 Sell orders: 6 orders (1.02 - 1.15 ETH per token)"
echo "   💰 Spread: ~4% between best bid (0.98) and best ask (1.02)"