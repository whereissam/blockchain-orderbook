# 📄 Smart Contracts Documentation

## 🏗️ Contract Architecture

This project implements a decentralized exchange (DEX) for ERC-20 token trading with an on-chain orderbook system.

### Core Contracts

#### 1. **Token.sol** - ERC-20 Token Implementation
- **Purpose**: Standard ERC-20 token contract for creating tradeable tokens
- **Location**: `contracts/core/Token.sol`
- **Features**:
  - Full ERC-20 compatibility (transfer, approve, balanceOf, etc.)
  - Configurable name, symbol, and initial supply
  - 18 decimal precision

**Constructor Parameters:**
```solidity
constructor(string memory _name, string memory _symbol, uint256 _initialSupply)
```

#### 2. **Exchange.sol** - DEX Trading Engine
- **Purpose**: Core decentralized exchange with orderbook functionality  
- **Location**: `contracts/core/Exchange.sol`
- **Features**:
  - On-chain orderbook system
  - Token deposits and withdrawals
  - Order creation, filling, and cancellation
  - Fee collection mechanism (10% default)
  - Event emission for off-chain indexing

**Constructor Parameters:**
```solidity
constructor(address _feeAccount, uint256 _feePercent)
```

## 🔧 Key Functions

### Exchange Contract Functions

#### Token Management
- `depositToken(address _token, uint256 _amount)` - Deposit tokens to exchange
- `withdrawToken(address _token, uint256 _amount)` - Withdraw tokens from exchange
- `balanceOf(address _token, address _user)` - Check user's token balance on exchange

#### Order Management
- `makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive)` - Create new order
- `fillOrder(uint256 _id)` - Fill an existing order
- `cancelOrder(uint256 _id)` - Cancel your own order

#### State Queries
- `orders(uint256 _id)` - Get order details
- `orderCount()` - Total number of orders created
- `orderFilled(uint256 _id)` - Check if order is filled
- `orderCancelled(uint256 _id)` - Check if order is cancelled

## 💡 Trading Logic

### Order Structure
```solidity
struct Order {
    uint256 id;
    address user;           // Order creator
    address tokenGet;       // Token they want to receive
    uint256 amountGet;      // Amount they want to receive
    address tokenGive;      // Token they're offering
    uint256 amountGive;     // Amount they're offering  
    uint256 timestamp;      // Order creation time
}
```

### Fee Mechanism ✨ **IMPROVED**
The exchange implements an improved fee structure that's more user-friendly:

- **Fee Rate**: 10% of the trade amount (configurable)
- **Fee Payer**: User who fills the order (not the order creator)
- **Fee Deduction**: ✅ **Deducted from the token being provided (tokenGive)**
- **Fee Collection**: Fees are collected to the designated fee account

**Before (Old Logic - User Unfriendly):**
- Fee deducted from token being received (tokenGet)
- Required buyers to already own the token they were buying
- Poor UX for first-time token purchases

**After (New Logic - User Friendly):** ✅
- Fee deducted from token being provided (tokenGive)  
- Buyers can purchase tokens without already owning them
- Much better UX for new users entering the ecosystem

### Trade Flow Example
1. **Alice** wants to sell 100 SSS tokens for 10 mETH
   - Creates order: `makeOrder(mETH, 10, SSS, 100)`
   - Must have 100 SSS deposited in exchange

2. **Bob** wants to buy 100 SSS tokens
   - Calls `fillOrder(orderId)`
   - Must have 10 mETH deposited in exchange
   - Pays 1 mETH as fee (10% of 10 mETH)
   - Alice receives 9 mETH (10 - 1 fee)
   - Bob receives 100 SSS tokens
   - Fee account receives 1 mETH

## 🎯 Deployed Contracts (Local Testnet)

**Network**: Anvil/Hardhat Local (Chain ID: 31337)
**RPC**: http://127.0.0.1:8545

| Contract | Address | Purpose |
|----------|---------|---------|
| SSS Token | `0x922D6956C99E12DFeB3224DEA977D0939758A1Fe` | Super Sonic Speed Token |
| mETH Token | `0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f` | Mock Ethereum |
| mDAI Token | `0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d` | Mock DAI |
| Exchange | `0xdbC43Ba45381e02825b14322cDdd15eC4B3164E6` | Trading Engine |

## 📋 Events

The contracts emit the following events for off-chain tracking:

### Token Events
- `Transfer(address indexed from, address indexed to, uint256 value)`
- `Approval(address indexed owner, address indexed spender, uint256 value)`

### Exchange Events
- `Deposit(address token, address user, uint256 amount, uint256 balance)`
- `Withdraw(address token, address user, uint256 amount, uint256 balance)`
- `Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp)`
- `Trade(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address creator, uint256 timestamp)`
- `Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp)`

## 🧪 Testing & Development

### Local Development Setup
1. **Start Anvil**: `anvil --host 127.0.0.1 --port 8545`
2. **Deploy Contracts**: `npm run setup:local`
3. **Test Trading**: Use the provided shell scripts in the root directory

### Useful Scripts
- `test-improved-fee-logic.sh` - Test the improved fee mechanism
- `debug-orders.sh` - Debug order and balance information
- `corrected-test.sh` - Test with proper order parameters

### Test Accounts (Anvil Default)
- **Account 1**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
  - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
  - Role: Token deployer, fee account
  
- **Account 2**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
  - Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
  - Role: Test trader

## 🔍 Important Notes

### Security Considerations
- ✅ Reentrancy protection through proper state updates
- ✅ Integer overflow protection (Solidity 0.8.9+)
- ✅ Access control on sensitive functions
- ✅ Event emission for transparency

### Known Limitations
- No partial order fills (orders are all-or-nothing)
- No order expiration mechanism
- Fixed fee structure (not dynamic)
- No slippage protection

### Future Improvements
- [ ] Implement partial order filling
- [ ] Add order expiration timestamps  
- [ ] Dynamic fee structures based on trading volume
- [ ] Integration with price oracles
- [ ] Advanced order types (limit, stop-loss, etc.)

## 🚀 Integration Guide

To integrate with the exchange:

1. **Deploy tokens** using the Token contract
2. **Approve exchange** to spend your tokens
3. **Deposit tokens** to the exchange
4. **Create orders** with proper tokenGet/tokenGive parameters
5. **Fill orders** to execute trades
6. **Withdraw tokens** when needed

**Remember**: Always deposit tokens before creating orders, and ensure proper token approvals!

---

*This documentation covers the improved fee mechanism that makes the exchange more user-friendly for first-time token buyers.*