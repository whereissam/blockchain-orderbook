#!/bin/bash

echo "🎯 Creating Sample Orders with Cast"
echo "==================================="

# Contract addresses
SSS_TOKEN="0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9"
METH_TOKEN="0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8"
MDAI_TOKEN="0x851356ae760d987E095750cCeb3bC6014560891C"
EXCHANGE="0xf5059a5D33d5853360D16C683c16e67980206f36"

# Test accounts (from Anvil)
ACCOUNT1="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
ACCOUNT2="0x70997970C51812dc3A010C7d01b50e0d17dc79C8" 
ACCOUNT3="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"

# Private keys (for signing)
PK1="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PK2="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
PK3="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

RPC="http://localhost:8545"

echo ""
echo "💰 Transferring tokens to test accounts..."

# Transfer tokens to accounts 2 and 3
cast send $SSS_TOKEN "transfer(address,uint256)" $ACCOUNT2 "10000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $SSS_TOKEN "transfer(address,uint256)" $ACCOUNT3 "10000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $METH_TOKEN "transfer(address,uint256)" $ACCOUNT2 "5000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $METH_TOKEN "transfer(address,uint256)" $ACCOUNT3 "5000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null

echo "✅ Tokens transferred"

echo ""
echo "🔓 Approving Exchange to spend tokens..."

# Approve exchange to spend tokens
cast send $SSS_TOKEN "approve(address,uint256)" $EXCHANGE "50000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $SSS_TOKEN "approve(address,uint256)" $EXCHANGE "50000000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null  
cast send $SSS_TOKEN "approve(address,uint256)" $EXCHANGE "50000000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null
cast send $METH_TOKEN "approve(address,uint256)" $EXCHANGE "50000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $METH_TOKEN "approve(address,uint256)" $EXCHANGE "50000000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null  
cast send $METH_TOKEN "approve(address,uint256)" $EXCHANGE "50000000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null

echo "✅ Approvals completed"

echo ""
echo "📝 Creating sample orders..."

# Create deposit ETH for trading
echo "💎 Depositing ETH for trading..."
cast send $EXCHANGE "depositEther()" --value "5000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositEther()" --value "3000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositEther()" --value "4000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null

# Deposit tokens 
echo "🪙 Depositing tokens for trading..."
cast send $EXCHANGE "depositToken(address,uint256)" $TOKEN "5000000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositToken(address,uint256)" $TOKEN "3000000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
cast send $EXCHANGE "depositToken(address,uint256)" $TOKEN "4000000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null

echo ""
echo "🟢 Creating BUY orders (offering ETH for tokens):"

# Buy orders: makeOrder(tokenGet, amountGet, tokenGive, amountGive)
# Buy 1000 tokens for 0.95 ETH each (1000 * 0.95 = 950 ETH total)
cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "1000000000000000000000" "0x0000000000000000000000000000000000000000" "950000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
echo "   Buy 1000 tokens @ 0.95 ETH each"

# Buy 2500 tokens for 0.92 ETH each  
cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "2500000000000000000000" "0x0000000000000000000000000000000000000000" "2300000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
echo "   Buy 2500 tokens @ 0.92 ETH each"

# Buy 500 tokens for 0.90 ETH each
cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" $TOKEN "500000000000000000000" "0x0000000000000000000000000000000000000000" "450000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null
echo "   Buy 500 tokens @ 0.90 ETH each"

echo ""
echo "🔴 Creating SELL orders (offering tokens for ETH):"

# Sell orders: makeOrder(tokenGet, amountGet, tokenGive, amountGive)  
# Sell 800 tokens for 1.05 ETH each
cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "840000000000000000000" $TOKEN "800000000000000000000" --private-key $PK1 --rpc-url $RPC > /dev/null
echo "   Sell 800 tokens @ 1.05 ETH each"

# Sell 1200 tokens for 1.08 ETH each
cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "1296000000000000000000" $TOKEN "1200000000000000000000" --private-key $PK2 --rpc-url $RPC > /dev/null
echo "   Sell 1200 tokens @ 1.08 ETH each"

# Sell 2000 tokens for 1.10 ETH each
cast send $EXCHANGE "makeOrder(address,uint256,address,uint256)" "0x0000000000000000000000000000000000000000" "2200000000000000000000" $TOKEN "2000000000000000000000" --private-key $PK3 --rpc-url $RPC > /dev/null
echo "   Sell 2000 tokens @ 1.10 ETH each"

echo ""
echo "📊 Current order count:"
cast call $EXCHANGE "orderCount()" --rpc-url $RPC | cast --to-dec

echo ""
echo "✅ Sample orders created successfully!"
echo "🌐 Check your frontend at http://localhost:3502 to see the orderbook"