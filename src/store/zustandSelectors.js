import { get, groupBy, reject, maxBy, minBy } from 'lodash'
import moment from "moment"
import { ethers } from 'ethers'
import useProviderStore from './providerStore'
import useTokensStore from './tokensStore'
import useExchangeStore from './exchangeStore'

// Using CSS classes instead of hex colors for better theming
const BUY_CLASS = 'order-buy'
const SELL_CLASS = 'order-sell'
const PRICE_UP_CLASS = 'price-up'
const PRICE_DOWN_CLASS = 'price-down'

// Legacy color constants (still used in some places)
const GREEN = '#25CE8F'
const RED = '#F45353'

// Helper functions for calculations
const decorateOrder = (order, tokens) => {
  if (!order || !tokens || tokens.length < 2 || !tokens[0] || !tokens[1]) {
    console.warn('decorateOrder: Invalid order or tokens data')
    return null
  }

  let token0Amount, token1Amount

  // Get token addresses - handle both .address and .target properties
  const token0Address = tokens[0]?.address || tokens[0]?.target
  const token1Address = tokens[1]?.address || tokens[1]?.target
  
  if (!token0Address || !token1Address) {
    console.warn('decorateOrder: Missing token addresses', { token0Address, token1Address })
    return null
  }

  // SSS should be considered token0, mETH is considered token1
  if (order.tokenGive === token1Address) {
    token0Amount = order.amountGive //The amount of SSS we are giving
    token1Amount = order.amountGet //The amount of mETH we want
  } else {
    token0Amount = order.amountGet //The amount of SSS we want
    token1Amount = order.amountGive //The amount of mETH we are giving
  }

  //Calculate token price to 5 decimal places
  const precision = 100000
  
  // Convert BigInt to numbers for calculation, handling potential BigInt values
  const token0AmountNum = typeof token0Amount === 'bigint' ? Number(token0Amount) : Number(token0Amount || 0)
  const token1AmountNum = typeof token1Amount === 'bigint' ? Number(token1Amount) : Number(token1Amount || 0)
  
  let tokenPrice = token0AmountNum > 0 ? (token1AmountNum / token0AmountNum) : 0
  tokenPrice = Math.round(tokenPrice * precision) / precision
  
  // Validate reasonable price range (1 to 200) to filter out bad data
  if (tokenPrice < 1 || tokenPrice > 200) {
    console.warn('Filtering out order with unrealistic price:', tokenPrice, 'Order:', order.id?.toString())
    return null
  }

  const result = {
    // Explicitly preserve essential properties
    id: order.id,
    user: order.user,
    tokenGet: order.tokenGet,
    amountGet: order.amountGet,
    tokenGive: order.tokenGive,
    amountGive: order.amountGive,
    timestamp: order.timestamp,
    // Add spread for any additional properties
    ...order,
    // Add decorated properties
    token0Amount: ethers.formatUnits(token0Amount, "ether"),
    token1Amount: ethers.formatUnits(token1Amount, 'ether'),
    tokenPrice,
    formattedTimestamp: order.timestamp ? moment.unix(Number(order.timestamp)).format('h:mm:ssa d MMM D') : 'Invalid Date'
  }
  
  return result
}

//--------------------------------------------------------------------------------------------
// My Events - Custom Hook

export const useMyEventsSelector = () => {
  const account = useProviderStore(state => state.account)
  const events = useExchangeStore(state => state.events)
  
  if (!account || !events) return []
  
  return events.filter((e) => e && e.args && e.args.user === account)
}

// For backward compatibility
export const myEventsSelector = () => {
  const account = useProviderStore.getState().account
  const events = useExchangeStore.getState().events
  
  if (!account || !events) return []
  
  return events.filter((e) => e && e.args && e.args.user === account)
}

//--------------------------------------------------------------------------------------------
// My Open Orders - Custom Hook

export const useMyOpenOrdersSelector = () => {
  const account = useProviderStore(state => state.account)
  const tokens = useTokensStore(state => state.contracts)
  const allOrders = useExchangeStore(state => state.allOrders.data)
  const filledOrders = useExchangeStore(state => state.filledOrders.data)
  const cancelledOrders = useExchangeStore(state => state.cancelledOrders.data)

  // Debug logging
  console.log('🔍 useMyOpenOrdersSelector Debug:', {
    account,
    tokensCount: tokens?.length || 0,
    token0Address: tokens?.[0]?.address || 'undefined',
    token1Address: tokens?.[1]?.address || 'undefined',
    allOrdersCount: allOrders?.length || 0,
    filledOrdersCount: filledOrders?.length || 0,
    cancelledOrdersCount: cancelledOrders?.length || 0
  })
  
  // Sample some orders to see their token addresses
  if (allOrders && allOrders.length > 0) {
    console.log('📊 Sample orders from store:', allOrders.slice(0, 3).map(o => ({
      id: o.id?.toString(),
      user: o.user,
      tokenGet: o.tokenGet,
      tokenGive: o.tokenGive
    })))
  }

  if (!tokens || tokens.length < 2 || !account || !allOrders) {
    console.log('❌ Missing requirements for orders:', { 
      hasTokens: tokens?.length >= 2, 
      hasAccount: !!account, 
      hasAllOrders: !!allOrders 
    })
    return []
  }

  // Calculate open orders
  const openOrders = reject(allOrders, (order) => {
    const orderFilled = filledOrders?.some((o) => o.id.toString() === order.id.toString()) || false
    const orderCancelled = cancelledOrders?.some((o) => o.id.toString() === order.id.toString()) || false
    return (orderFilled || orderCancelled)
  })

  console.log('📊 Open orders (after filtering filled/cancelled):', openOrders.length)
  
  //Filter orders created by current account
  let filteredOrders = openOrders.filter((o) => o && o.user === account)
  console.log('📊 Orders by current account:', filteredOrders.length, `(account: ${account})`)
  
  if (filteredOrders.length > 0) {
    console.log('📊 Sample order from current account:', filteredOrders[0])
  }

  //Filter order by selected tokens - handle both address and target properties
  const token0Address = tokens[0]?.address || tokens[0]?.target
  const token1Address = tokens[1]?.address || tokens[1]?.target
  
  if (!token0Address || !token1Address) {
    console.log('❌ Missing token addresses for filtering:', { token0Address, token1Address })
    return []
  }
  
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGet === token0Address || o.tokenGet === token1Address))
  console.log('📊 Orders after tokenGet filter:', filteredOrders.length)
  
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGive === token0Address || o.tokenGive === token1Address))
  console.log('📊 Orders after tokenGive filter:', filteredOrders.length)

  //Decorate orders - add display attributes
  filteredOrders = filteredOrders.map((order) => {
    order = decorateOrder(order, tokens)
    if (!order) return null
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
    return {
      ...order,
      orderType,
      orderTypeClass: (orderType === 'buy' ? BUY_CLASS : SELL_CLASS),
    }
  }).filter(order => order !== null)

  //Sort orders by date descending
  filteredOrders = filteredOrders.sort((a, b) => b.timestamp - a.timestamp)

  return filteredOrders
}

// For backward compatibility
export const myOpenOrdersSelector = () => {
  const account = useProviderStore.getState().account
  const tokens = useTokensStore.getState().contracts
  const allOrders = useExchangeStore.getState().allOrders.data || []
  const filledOrders = useExchangeStore.getState().filledOrders.data || []
  const cancelledOrders = useExchangeStore.getState().cancelledOrders.data || []

  if (!tokens || tokens.length < 2 || !account || !allOrders) return []

  // Calculate open orders
  const openOrders = reject(allOrders, (order) => {
    const orderFilled = filledOrders.some((o) => o.id.toString() === order.id.toString())
    const orderCancelled = cancelledOrders.some((o) => o.id.toString() === order.id.toString())
    return (orderFilled || orderCancelled)
  })

  //Filter orders created by current account
  let filteredOrders = openOrders.filter((o) => o && o.user === account)

  //Filter order by selected tokens
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address))
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address))

  //Decorate orders - add display attributes
  filteredOrders = filteredOrders.map((order) => {
    order = decorateOrder(order, tokens)
    if (!order) return null
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
    return {
      ...order,
      orderType,
      orderTypeClass: (orderType === 'buy' ? BUY_CLASS : SELL_CLASS),
    }
  }).filter(order => order !== null)

  //Sort orders by date descending
  filteredOrders = filteredOrders.sort((a, b) => b.timestamp - a.timestamp)

  return filteredOrders
}

//---------------------------------------------------------------------------------------
// All Filled Orders - Custom Hook

export const useFilledOrdersSelector = () => {
  const orders = useExchangeStore(state => state.filledOrders.data)
  const tokens = useTokensStore(state => state.contracts)

  if (!tokens || tokens.length < 2 || !orders || orders.length === 0) return []

  //Filter order by selected tokens
  let filteredOrders = orders.filter((o) => o && (o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address))
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address))

  //Sort orders by date ascending for price comparison
  filteredOrders = filteredOrders.sort((a, b) => Number(a.timestamp) - Number(b.timestamp))

  //Decorate the orders
  let previousOrder = filteredOrders[0]
  filteredOrders = filteredOrders.map((order) => {
    order = decorateOrder(order, tokens)
    
    // Skip if decorateOrder returned null (unrealistic price)
    if (!order) return null
    
    const tokenPriceClass = previousOrder?.id === order.id 
      ? PRICE_UP_CLASS 
      : (previousOrder?.tokenPrice <= order.tokenPrice ? PRICE_UP_CLASS : PRICE_DOWN_CLASS)
    
    order = {
      ...order,
      tokenPriceClass
    }
    previousOrder = order
    return order
  }).filter(order => order !== null)

  //Sort orders by date descending for display
  filteredOrders = filteredOrders.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

  return filteredOrders
}

// For backward compatibility
export const filledOrdersSelector = () => {
  const orders = useExchangeStore.getState().filledOrders.data || []
  const tokens = useTokensStore.getState().contracts || []

  if (!tokens || tokens.length < 2 || !orders) return []

  //Filter order by selected tokens
  let filteredOrders = orders.filter((o) => o && (o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address))
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address))

  //Sort orders by date ascending for price comparison
  filteredOrders = filteredOrders.sort((a, b) => Number(a.timestamp) - Number(b.timestamp))

  //Decorate the orders
  let previousOrder = filteredOrders[0]
  filteredOrders = filteredOrders.map((order) => {
    order = decorateOrder(order, tokens)
    
    // Skip if decorateOrder returned null (unrealistic price)
    if (!order) return null
    
    const tokenPriceClass = previousOrder?.id === order.id 
      ? PRICE_UP_CLASS 
      : (previousOrder?.tokenPrice <= order.tokenPrice ? PRICE_UP_CLASS : PRICE_DOWN_CLASS)
    
    order = {
      ...order,
      tokenPriceClass
    }
    previousOrder = order
    return order
  }).filter(order => order !== null)

  //Sort orders by date descending for display
  filteredOrders = filteredOrders.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

  return filteredOrders
}

//---------------------------------------------------------------------------------------
//My Fill Orders - Custom Hook

export const useMyFilledOrdersSelector = () => {
  const account = useProviderStore(state => state.account)
  const tokens = useTokensStore(state => state.contracts)
  const orders = useExchangeStore(state => state.filledOrders.data)

  if (!tokens || tokens.length < 2 || !account || !orders || orders.length === 0) return []

  //Find our orders
  let filteredOrders = orders.filter((o) => o && (o.user === account || o.creator === account))
  //Filter orders for current trading pair
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address))
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address))

  //Sort by date descending
  filteredOrders = filteredOrders.sort((a, b) => b.timestamp - a.timestamp)

  //Decorate orders - add display attribute
  filteredOrders = filteredOrders.map((order) => {
    order = decorateOrder(order, tokens)
    
    const myOrder = order.creator === account
    let orderType
    if (myOrder) orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
    else orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'

    return {
      ...order,
      orderType,
      orderTypeClass: (orderType === 'buy' ? BUY_CLASS : SELL_CLASS),
      orderSign: (orderType === 'buy' ? '+' : '-')
    }
  })

  return filteredOrders
}

// For backward compatibility
export const myFilledOrdersSelector = () => {
  const account = useProviderStore.getState().account
  const tokens = useTokensStore.getState().contracts || []
  const orders = useExchangeStore.getState().filledOrders.data || []

  if (!tokens || tokens.length < 2 || !account || !orders) return []

  //Find our orders
  let filteredOrders = orders.filter((o) => o && (o.user === account || o.creator === account))
  //Filter orders for current trading pair
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address))
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address))

  //Sort by date descending
  filteredOrders = filteredOrders.sort((a, b) => b.timestamp - a.timestamp)

  //Decorate orders - add display attribute
  filteredOrders = filteredOrders.map((order) => {
    order = decorateOrder(order, tokens)
    
    const myOrder = order.creator === account
    let orderType
    if (myOrder) orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
    else orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'

    return {
      ...order,
      orderType,
      orderTypeClass: (orderType === 'buy' ? BUY_CLASS : SELL_CLASS),
      orderSign: (orderType === 'buy' ? '+' : '-')
    }
  })

  return filteredOrders
}

//---------------------------------------------------------------------------------------
//Order book - Custom Hook

export const useOrderBookSelector = () => {
  const tokens = useTokensStore(state => state.contracts)
  const allOrders = useExchangeStore(state => state.allOrders.data)
  const filledOrders = useExchangeStore(state => state.filledOrders.data)
  const cancelledOrders = useExchangeStore(state => state.cancelledOrders.data)
  
  // Debug what we're getting from the store
  const exchangeState = useExchangeStore(state => state.allOrders)
  console.log('📊 Exchange allOrders state:', {
    loaded: exchangeState.loaded,
    dataLength: exchangeState.data?.length,
    dataType: typeof exchangeState.data,
    isArray: Array.isArray(exchangeState.data)
  })

  // Get token addresses - handle both address and target properties
  const token0Address = tokens?.[0]?.address || tokens?.[0]?.target
  const token1Address = tokens?.[1]?.address || tokens?.[1]?.target
  
  console.log('🔍 OrderBook Debug:', {
    tokensLength: tokens?.length,
    hasAllOrders: !!allOrders,
    allOrdersLength: allOrders?.length,
    token0: tokens?.[0] ? { address: tokens[0].address, target: tokens[0].target } : null,
    token1: tokens?.[1] ? { address: tokens[1].address, target: tokens[1].target } : null,
    token0Address,
    token1Address
  })
  
  if (!tokens || tokens.length < 2 || !allOrders || !token0Address || !token1Address) {
    console.log('📊 OrderBook: Missing requirements', { 
      tokensLength: tokens?.length, 
      hasAllOrders: !!allOrders, 
      token0Address, 
      token1Address 
    })
    return { buyOrders: [], sellOrders: [] }
  }

  // Calculate open orders
  const openOrders = reject(allOrders, (order) => {
    const orderFilled = filledOrders?.some((o) => o.id.toString() === order.id.toString()) || false
    const orderCancelled = cancelledOrders?.some((o) => o.id.toString() === order.id.toString()) || false
    return (orderFilled || orderCancelled)
  })

  console.log('📊 OrderBook: Open orders count:', openOrders.length)

  //Filter order by selected tokens - use proper addresses
  let filteredOrders = openOrders.filter((o) => o && (o.tokenGet === token0Address || o.tokenGet === token1Address))
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGive === token0Address || o.tokenGive === token1Address))

  console.log('📊 OrderBook: Filtered orders count:', filteredOrders.length)

  //Decorate orders
  filteredOrders = filteredOrders.map((order) => {
    order = decorateOrder(order, tokens)
    if (!order) return null
    const orderType = order.tokenGive === token1Address ? 'buy' : 'sell'
    return {
      ...order,
      orderType,
      orderTypeClass: (orderType === 'buy' ? BUY_CLASS : SELL_CLASS),
      orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    }
  }).filter(order => order !== null)

  console.log('📊 OrderBook: Decorated orders count:', filteredOrders.length)

  //Group orders by 'orderType'
  const groupedOrders = groupBy(filteredOrders, 'orderType')

  //Fetch buy orders
  const buyOrders = get(groupedOrders, 'buy', [])

  //Sort buy orders by token price
  const result = {
    ...groupedOrders,
    buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
  }

  //Fetch sell orders
  const sellOrders = get(groupedOrders, 'sell', [])

  //Sort sell orders by token price   
  result.sellOrders = sellOrders.sort((a, b) => a.tokenPrice - b.tokenPrice) // Fixed: sell orders should be ascending

  console.log('📊 OrderBook: Final result', { buyCount: result.buyOrders.length, sellCount: result.sellOrders.length })

  return result
}

// For backward compatibility
export const orderBookSelector = () => {
  const tokens = useTokensStore.getState().contracts || []
  const allOrders = useExchangeStore.getState().allOrders.data || []
  const filledOrders = useExchangeStore.getState().filledOrders.data || []
  const cancelledOrders = useExchangeStore.getState().cancelledOrders.data || []

  if (!tokens || tokens.length < 2 || !allOrders) return { buyOrders: [], sellOrders: [] }

  // Calculate open orders
  const openOrders = reject(allOrders, (order) => {
    const orderFilled = filledOrders.some((o) => o.id.toString() === order.id.toString())
    const orderCancelled = cancelledOrders.some((o) => o.id.toString() === order.id.toString())
    return (orderFilled || orderCancelled)
  })

  //Filter order by selected tokens
  let filteredOrders = openOrders.filter((o) => o && (o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address))
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address))

  //Decorate orders
  filteredOrders = filteredOrders.map((order) => {
    order = decorateOrder(order, tokens)
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
    return {
      ...order,
      orderType,
      orderTypeClass: (orderType === 'buy' ? BUY_CLASS : SELL_CLASS),
      orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    }
  })

  //Group orders by 'orderType'
  const groupedOrders = groupBy(filteredOrders, 'orderType')

  //Fetch buy orders
  const buyOrders = get(groupedOrders, 'buy', [])

  //Sort buy orders by token price
  const result = {
    ...groupedOrders,
    buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
  }

  //Fetch sell orders
  const sellOrders = get(groupedOrders, 'sell', [])

  //Sort sell orders by token price   
  result.sellOrders = sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)

  return result
}

//-------------------------------------------------------------------------------
//Price Chart - Custom Hook

export const usePriceChartSelector = (timeRange = '5m') => {
  const orders = useExchangeStore(state => state.filledOrders.data)
  const tokens = useTokensStore(state => state.contracts)

  if (!tokens || tokens.length < 2 || !orders || orders.length === 0) return {}

  //Filter orders by selected tokens
  let filteredOrders = orders.filter((o) => o && (o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address))
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address))

  //Sort orders by date ascending to compare history
  filteredOrders = filteredOrders.sort((a, b) => {
    const aTime = typeof a.timestamp === 'bigint' ? Number(a.timestamp) : a.timestamp
    const bTime = typeof b.timestamp === 'bigint' ? Number(b.timestamp) : b.timestamp
    return aTime - bTime
  })

  //Decorate orders - add display attributes
  filteredOrders = filteredOrders.map((o) => decorateOrder(o, tokens)).filter(o => o !== null)

  // Get last 2 order for final price & price change
  let secondLastOrder, lastOrder
  ;[secondLastOrder, lastOrder] = filteredOrders.slice(filteredOrders.length - 2, filteredOrders.length)

  // Get last order price
  const lastPrice = get(lastOrder, 'tokenPrice', 0)

  // Get second last order price
  const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

  // Build graph data - group by selected time range
  const getGroupingKey = (timestamp, range) => {
    const time = moment.unix(timestamp)
    switch (range) {
      case '5m':
        return time.startOf('minute').subtract(time.minute() % 5, 'minutes').format()
      case '1h':
        return time.startOf('hour').format()
      case '4h':
        return time.startOf('hour').subtract(time.hour() % 4, 'hours').format()
      case '1d':
        return time.startOf('day').format()
      default:
        return time.startOf('minute').subtract(time.minute() % 5, 'minutes').format()
    }
  }
  
  const groupedOrders = groupBy(filteredOrders, (o) => {
    const timestamp = typeof o.timestamp === 'bigint' ? Number(o.timestamp) : o.timestamp
    return getGroupingKey(timestamp, timeRange)
  })
  const periods = Object.keys(groupedOrders)

  const graphData = periods.map((period) => {
    //Fetch all orders from current time period
    const group = groupedOrders[period]

    //Calculate price values: open, high, low, close
    const open = group[0]
    const high = maxBy(group, 'tokenPrice')
    const low = minBy(group, 'tokenPrice')
    const close = group[group.length - 1]

    // For single trades, ensure proper OHLC format
    const openPrice = open.tokenPrice
    const highPrice = high.tokenPrice
    const lowPrice = low.tokenPrice
    const closePrice = close.tokenPrice

    return ({
      x: new Date(period),
      y: [openPrice, highPrice, lowPrice, closePrice]
    })
  })

  return ({
    lastPrice,
    lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
    series: [{
      data: graphData
    }]
  })
}

// For backward compatibility
export const priceChartSelector = () => {
  const orders = useExchangeStore.getState().filledOrders.data || []
  const tokens = useTokensStore.getState().contracts || []

  if (!tokens || tokens.length < 2 || !orders) return {}

  //Filter orders by selected tokens
  let filteredOrders = orders.filter((o) => o && (o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address))
  filteredOrders = filteredOrders.filter((o) => o && (o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address))

  //Sort orders by date ascending to compare history
  filteredOrders = filteredOrders.sort((a, b) => a.timestamp - b.timestamp)

  //Decorate orders - add display attributes
  filteredOrders = filteredOrders.map((o) => decorateOrder(o, tokens)).filter(o => o !== null)

  // Get last 2 order for final price & price change
  let secondLastOrder, lastOrder
  ;[secondLastOrder, lastOrder] = filteredOrders.slice(filteredOrders.length - 2, filteredOrders.length)

  // Get last order price
  const lastPrice = get(lastOrder, 'tokenPrice', 0)

  // Get second last order price
  const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

  // Build graph data
  const groupedOrders = groupBy(filteredOrders, (o) => {
    const timestamp = typeof o.timestamp === 'bigint' ? Number(o.timestamp) : o.timestamp
    return moment.unix(timestamp).startOf('hour').format()
  })
  const hours = Object.keys(groupedOrders)

  const graphData = hours.map((hour) => {
    //Fetch all orders from current hour
    const group = groupedOrders[hour]

    //Calculate price values: open, high, low, close
    const open = group[0]
    const high = maxBy(group, 'tokenPrice')
    const low = minBy(group, 'tokenPrice')
    const close = group[group.length - 1]

    return ({
      x: new Date(hour),
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
    })
  })

  return ({
    lastPrice,
    lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
    series: [{
      data: graphData
    }]
  })
}