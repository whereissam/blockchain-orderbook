// Debug script to investigate missing orders for address 0x683C2b9fbaeDc26522F446E42BeC896666390eC4
// Run this in browser console when the app is loaded

const targetAddress = '0x683C2b9fbaeDc26522F446E42BeC896666390eC4';

function debugMain() {
  console.log('🔍 Starting order debug for address:', targetAddress);
  
  // Check if stores are available
  if (typeof useProviderStore === 'undefined' || typeof useExchangeStore === 'undefined') {
    console.log('❌ Stores not available. Make sure app is loaded and run this in browser console.');
    return;
  }
  
  debugStoreStates();
  debugOrderSearch();
  debugFiltering();
  debugNetwork();
}

function debugStoreStates() {
  console.log('\n📊 === STORE STATES ===');
  
  try {
    const providerState = useProviderStore.getState();
    const exchangeState = useExchangeStore.getState();
    const tokensState = useTokensStore.getState();
    
    console.log('Provider State:', {
      account: providerState.account,
      chainId: providerState.chainId,
      isConnected: !!providerState.connection
    });
    
    console.log('Exchange State:', {
      loaded: exchangeState.loaded,
      hasContract: !!exchangeState.contract,
      allOrdersCount: exchangeState.allOrders?.data?.length || 0,
      filledOrdersCount: exchangeState.filledOrders?.data?.length || 0,
      cancelledOrdersCount: exchangeState.cancelledOrders?.data?.length || 0,
      allOrdersLoaded: exchangeState.allOrders?.loaded,
      filledOrdersLoaded: exchangeState.filledOrders?.loaded
    });
    
    console.log('Tokens State:', {
      symbols: tokensState.symbols,
      contractsCount: tokensState.contracts?.length || 0,
      loaded: tokensState.loaded
    });
    
  } catch (error) {
    console.error('❌ Error checking store states:', error);
  }
}

function debugOrderSearch() {
  console.log('\n🔎 === SEARCHING FOR ORDERS ===');
  
  try {
    const exchangeState = useExchangeStore.getState();
    const normalizedTarget = targetAddress.toLowerCase();
    
    // Search in all orders
    const allOrdersFromUser = exchangeState.allOrders?.data?.filter(order => 
      order && order.user && order.user.toLowerCase() === normalizedTarget
    ) || [];
    
    // Search in filled orders
    const filledOrdersFromUser = exchangeState.filledOrders?.data?.filter(order => 
      order && (
        (order.user && order.user.toLowerCase() === normalizedTarget) ||
        (order.creator && order.creator.toLowerCase() === normalizedTarget)
      )
    ) || [];
    
    // Search in cancelled orders
    const cancelledOrdersFromUser = exchangeState.cancelledOrders?.data?.filter(order => 
      order && order.user && order.user.toLowerCase() === normalizedTarget
    ) || [];
    
    console.log('Orders found for address:');
    console.log('📝 All Orders:', allOrdersFromUser.length, allOrdersFromUser);
    console.log('✅ Filled Orders:', filledOrdersFromUser.length, filledOrdersFromUser);
    console.log('❌ Cancelled Orders:', cancelledOrdersFromUser.length, cancelledOrdersFromUser);
    
    // Also search for any orders with similar addresses (case-insensitive)
    const allOrderUsers = exchangeState.allOrders?.data?.map(o => o?.user).filter(Boolean) || [];
    const uniqueUsers = [...new Set(allOrderUsers)];
    console.log('📋 All unique order creators found:', uniqueUsers);
    
  } catch (error) {
    console.error('❌ Error searching orders:', error);
  }
}

function debugFiltering() {
  console.log('\n🔧 === TESTING FILTERING LOGIC ===');
  
  try {
    const providerState = useProviderStore.getState();
    const tokensState = useTokensStore.getState();
    const currentAccount = providerState.account;
    
    console.log('Current connected account:', currentAccount);
    console.log('Target account:', targetAddress);
    console.log('Account match:', currentAccount?.toLowerCase() === targetAddress.toLowerCase());
    
    console.log('Current token pair:', {
      token0: tokensState.contracts?.[0]?.address,
      token1: tokensState.contracts?.[1]?.address,
      symbols: tokensState.symbols
    });
    
    // Test selector logic
    if (typeof useMyOpenOrdersSelector !== 'undefined') {
      const myOpenOrders = useMyOpenOrdersSelector();
      console.log('My Open Orders (from selector):', myOpenOrders.length, myOpenOrders);
    }
    
  } catch (error) {
    console.error('❌ Error testing filtering:', error);
  }
}

function debugNetwork() {
  console.log('\n🌐 === NETWORK DIAGNOSTICS ===');
  
  try {
    const providerState = useProviderStore.getState();
    const exchangeState = useExchangeStore.getState();
    
    console.log('Network Info:', {
      chainId: providerState.chainId,
      hasProvider: !!providerState.connection,
      exchangeAddress: exchangeState.contract?.target || exchangeState.contract?.address
    });
    
    // Check if we can call contract methods
    if (exchangeState.contract && providerState.account) {
      console.log('Testing contract calls...');
      
      // Test getting order count
      exchangeState.contract.orderCount().then(count => {
        console.log('✅ Contract orderCount:', count.toString());
      }).catch(err => {
        console.error('❌ Contract call failed:', err);
      });
      
      // Test getting user balance
      if (useTokensStore.getState().contracts?.[0]) {
        const token = useTokensStore.getState().contracts[0];
        exchangeState.contract.balanceOf(token.address, providerState.account).then(balance => {
          console.log('✅ User exchange balance for token 0:', balance.toString());
        }).catch(err => {
          console.error('❌ Balance check failed:', err);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error in network diagnostics:', error);
  }
}

// Export for manual execution
window.debugOrdersForAddress = debugMain;

console.log('🔍 Debug script loaded. Run debugMain() to investigate orders for', targetAddress);