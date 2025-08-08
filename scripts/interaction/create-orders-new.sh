#!/bin/bash

echo "🎯 Creating Orders for NEW Deployment"
echo "===================================="

# NEW Contract addresses from fresh deployment
TOKEN="0xaA537f482A3142c5149376a2D21c6d27981c3606"
EXCHANGE="0x7964F8a00B49Ce5c6fc51A1b6800196E96376c62"

# Test accounts (from Anvil)
ACCOUNT1="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
ACCOUNT2="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
ACCOUNT3="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"

# Private keys
PK1="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PK2="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
PK3="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

RPC="http://localhost:8545"

echo "💰 Setting up accounts..."

# Transfer tokens to accounts 2 and 3
cast send $TOKEN "transfer(address,uint256)" $ACCOUNT2 "20000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $TOKEN "transfer(address,uint256)" $ACCOUNT3 "20000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null

# Approve exchange
cast send $TOKEN "approve(address,uint256)" $EXCHANGE "100000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $TOKEN "approve(address,uint256)" $EXCHANGE "100000000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null  
cast send $TOKEN "approve(address,uint256)" $EXCHANGE "100000000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null

# Deposit ETH for trading
cast send $EXCHANGE "depositEther()" --value "20000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositEther()" --value "15000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositEther()" --value "10000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null

# Deposit tokens 
cast send $EXCHANGE "depositToken(address,uint256)" $TOKEN "15000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositToken(address,uint256)" $TOKEN "10000000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositToken(address,uint256)" $TOKEN "8000000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null

echo "✅ Accounts setup complete"

echo ""
echo "🟢 Creating BUY orders (ETH → Tokens):"

# Buy orders: makeOrder(tokenGet, amountGet, tokenGive, amountGive)
cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "1000000000000000000000" "0x0000000000000000000000000000000000000000" "990000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
echo "   1. Buy 1000 tokens @ 0.99 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "1500000000000000000000" "0x0000000000000000000000000000000000000000" "1440000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
echo "   2. Buy 1500 tokens @ 0.96 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "800000000000000000000" "0x0000000000000000000000000000000000000000" "736000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null
echo "   3. Buy 800 tokens @ 0.92 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "2000000000000000000000" "0x0000000000000000000000000000000000000000" "1760000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
echo "   4. Buy 2000 tokens @ 0.88 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "600000000000000000000" "0x0000000000000000000000000000000000000000" "510000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
echo "   5. Buy 600 tokens @ 0.85 ETH each"

echo ""
echo "🔴 Creating SELL orders (Tokens → ETH):"

# Sell orders: makeOrder(tokenGet, amountGet, tokenGive, amountGive)  
cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "1010000000000000000000" $TOKEN "1000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
echo "   6. Sell 1000 tokens @ 1.01 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "1560000000000000000000" $TOKEN "1500000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null
echo "   7. Sell 1500 tokens @ 1.04 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "856000000000000000000" $TOKEN "800000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
echo "   8. Sell 800 tokens @ 1.07 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "2200000000000000000000" $TOKEN "2000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
echo "   9. Sell 2000 tokens @ 1.10 ETH each"

cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "678000000000000000000" $TOKEN "600000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null
echo "   10. Sell 600 tokens @ 1.13 ETH each"

echo ""
echo "📊 Final order count:"
ORDER_COUNT=$(cast call $EXCHANGE "orderCount()" --rpc-url $RPC | cast --to-dec)
echo "   Total orders: $ORDER_COUNT"

echo ""
echo "✅ Created $ORDER_COUNT orders successfully!"
echo "🌐 Check your frontend at http://localhost:3502"
echo ""
echo "📋 Contract Addresses Updated:"
echo "   🪙 Token:    $TOKEN"
echo "   📊 Exchange: $EXCHANGE"