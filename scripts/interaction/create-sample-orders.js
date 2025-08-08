import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
    console.log('🎯 Creating Sample Orders for Frontend Display');
    console.log('=============================================');

    const [owner, user1, user2, user3] = await ethers.getSigners();
    
    // Get deployed contract addresses
    const tokenAddress = '0x610178dA211FEF7D417bC0e6FeD39F05609AD788';
    const orderBookAddress = '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82';
    
    const Token = await ethers.getContractFactory('SuperSonicSpeedToken');
    const OrderBook = await ethers.getContractFactory('OrderBook');
    
    const token = Token.attach(tokenAddress);
    const orderBook = OrderBook.attach(orderBookAddress);
    
    console.log('📊 Current order count:', await orderBook.orderCount());
    
    // Transfer tokens to users for testing
    console.log('\n💰 Distributing tokens to test users...');
    const transferAmount = ethers.parseEther('10000');
    
    await token.transfer(user1.address, transferAmount);
    await token.transfer(user2.address, transferAmount);
    await token.transfer(user3.address, transferAmount);
    
    console.log(`✅ Transferred ${ethers.formatEther(transferAmount)} tokens to each test user`);
    
    // Approve orderbook to spend tokens for all users
    const approveAmount = ethers.parseEther('50000');
    await token.connect(user1).approve(orderBookAddress, approveAmount);
    await token.connect(user2).approve(orderBookAddress, approveAmount);
    await token.connect(user3).approve(orderBookAddress, approveAmount);
    
    console.log('\n📝 Creating diverse sample orders...');
    
    // Create various buy orders (different prices and amounts)
    const buyOrders = [
        { price: ethers.parseEther('0.95'), amount: ethers.parseEther('1000'), user: user1 },
        { price: ethers.parseEther('0.92'), amount: ethers.parseEther('2500'), user: user2 },
        { price: ethers.parseEther('0.90'), amount: ethers.parseEther('500'), user: user3 },
        { price: ethers.parseEther('0.88'), amount: ethers.parseEther('1500'), user: user1 },
        { price: ethers.parseEther('0.85'), amount: ethers.parseEther('3000'), user: user2 },
    ];
    
    // Create various sell orders (different prices and amounts)
    const sellOrders = [
        { price: ethers.parseEther('1.05'), amount: ethers.parseEther('800'), user: user2 },
        { price: ethers.parseEther('1.08'), amount: ethers.parseEther('1200'), user: user3 },
        { price: ethers.parseEther('1.10'), amount: ethers.parseEther('2000'), user: user1 },
        { price: ethers.parseEther('1.12'), amount: ethers.parseEther('1800'), user: user2 },
        { price: ethers.parseEther('1.15'), amount: ethers.parseEther('2500'), user: user3 },
    ];
    
    // Place buy orders
    console.log('\n🟢 Placing BUY orders:');
    for (let i = 0; i < buyOrders.length; i++) {
        const order = buyOrders[i];
        const tx = await orderBook.connect(order.user).placeBuyOrder(
            order.price,
            order.amount
        );
        await tx.wait();
        console.log(`   Buy ${ethers.formatEther(order.amount)} tokens @ ${ethers.formatEther(order.price)} ETH each`);
    }
    
    // Place sell orders
    console.log('\n🔴 Placing SELL orders:');
    for (let i = 0; i < sellOrders.length; i++) {
        const order = sellOrders[i];
        const tx = await orderBook.connect(order.user).placeSellOrder(
            order.price,
            order.amount
        );
        await tx.wait();
        console.log(`   Sell ${ethers.formatEther(order.amount)} tokens @ ${ethers.formatEther(order.price)} ETH each`);
    }
    
    console.log('\n📊 Final order count:', await orderBook.orderCount());
    console.log('\n✅ Sample orders created successfully!');
    console.log('🌐 Check your frontend at http://localhost:3502 to see the orderbook');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });