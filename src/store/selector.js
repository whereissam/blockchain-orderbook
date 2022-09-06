import { createSelector } from "reselect"
import { get, groupBy, reject, maxBy, minBy } from 'lodash'
import moment from "moment"
import { ethers } from 'ethers'

const GREEN = '#25CE8F'
const RED = '#F45353'

const tokens = state => get(state, 'tokens.contracts')
const account = state => get(state, 'provider.account')
const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

const openOrders = state => {
  const all = allOrders(state)
  const filled = filledOrders(state)
  // console.log(filled)
  const cancelled = cancelledOrders(state)
  // console.log(filled, cancelled)

  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
    // console.log(orderFilled)
    const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
    // console.log(orderCancelled)
    // console.log(orderFilled || orderCancelled)
    return (orderFilled || orderCancelled)
  })

  return openOrders
}


//--------------------------------------------------------------------------------------------
// My Open Order

export const myOpenOrdersSelector = createSelector(
  account,
  tokens,
  openOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) { return }

    //Filter orders created by current account
    orders = orders.filter((o) => o.user === account)

    //Filter order by selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    //Decorate orders - add display attributes
    orders = decorateMyOpenOrders(orders, tokens)

    //Sort orders by date descending
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)

    console.log(orders)

    return orders

  }
)

const decorateMyOpenOrders = (orders, tokens) => {
  return (
    orders.map((order) => {
      order = decorateOrder(order, tokens)
      order = decorateMyOpenOrder(order, tokens)
      return (order)
    })
  )
}

const decorateMyOpenOrder = (order, tokens) => {
  const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

  return ({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
  })
}

const decorateOrder = (order, tokens) => {
  let token0Amount, token1Amount

  // SSS should be considered token0, mETH is considered token1
  if (order.tokenGive === tokens[1].address) {
    token0Amount = order.amountGive //The amount of SSS we are giving
    token1Amount = order.amountGet //The amount of mETH we want
  } else {
    token0Amount = order.amountGet //The amount of SSS we want
    token1Amount = order.amountGive //The amount of mETH we are giving
  }

  //Calculate token price to 5 decimal places
  const precision = 100000
  let tokenPrice = (token1Amount / token0Amount)
  tokenPrice = Math.round(tokenPrice * precision) / precision

  return ({
    ...order,
    token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
    token1Amount: ethers.utils.formatUnits(token1Amount, 'ether'),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
  })
}

//---------------------------------------------------------------------------------------
// All Filled Orders

export const filledOrdersSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) { return }
    //Filter order by selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    //Sort orders by date ascending for price comparison
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)

    //Decorate the orders
    orders = decorateFilledOrders(orders, tokens)


    //Sort orders by date descending for display
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)
    // console.log(orders)

    return orders

  }
)

const decorateFilledOrders = (orders, tokens) => {

  //Track previous order to compare history
  let previousOrder = orders[0]
  // console.log(previousOrder)

  return (
    orders.map((order) => {
      //decorate each individual order
      order = decorateOrder(order, tokens)
      order = decorateFilledOrder(order, previousOrder)
      previousOrder = order //Update the previous order once it's decorated
      // console.log(order)
      return order
    })
  )

}

const decorateFilledOrder = (order, previousOrder) => {
  //decorate each individual order
  return ({
    ...order,
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
  })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
  //Show green price if only one order exists
  if (previousOrder.id === orderId) {
    return GREEN
  }

  //Show green price if order price higher than previous order
  //Show red price if order price lower than previous order
  if (previousOrder.tokenPrice <= tokenPrice) {
    return GREEN //success
  } else {
    return RED //danger
  }

}

//---------------------------------------------------------------------------------------
//My Fill Orders

export const myFilledOrdersSelector = createSelector(
  account,
  tokens,
  filledOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) { return }

    //Find our orders
    orders = orders.filter((o) => o.user === account || o.creator === account)
    //Filter orders for current trading pair
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    //Sort by date descending
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)

    //Decorate orders - add display attribute
    orders = decorateMyFillOrders(orders, account, tokens)

    return orders

  }
)

const decorateMyFillOrders = (orders, account, tokens) => {
  return (
    orders.map((order) => {
      order = decorateOrder(order, tokens)
      order = decorateMyFillOrder(order, account, tokens)
      return (order)
    })
  )
}

const decorateMyFillOrder = (order, account, tokens) => {
  const myOrder = order.creator === account

  let orderType
  if (myOrder) orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
  else orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'

  return ({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderSign: (orderType === 'buy' ? '+' : '-')
  })
}

//---------------------------------------------------------------------------------------
//Order book

export const orderBookSelector = createSelector(openOrders, tokens, (orders, tokens) => {
  // console.log(openOrders)
  // console.log('orderBookSelector', orders, tokens)
  if (!tokens[0] || !tokens[1]) { return }

  //Filter order by selected tokens
  orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
  orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

  // console.log(orders)
  //Decorate orders
  orders = decorateOrderBookOrders(orders, tokens)

  //Group orders by 'orderType'
  orders = groupBy(orders, 'orderType')
  // console.log(orders)

  //Fetch buy orders
  const buyOrders = get(orders, 'buy', [])
  // console.log(buyOrders)

  //Sort buy orders by token price
  orders = {
    ...orders,
    buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
  }

  //Fetch sell orders
  const sellOrders = get(orders, 'sell', [])

  //Sort sell orders by token price   
  orders = {
    ...orders,
    sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
  }

  // console.log(orders)
  return orders
})

const decorateOrderBookOrders = (orders, tokens) => {
  return (
    orders.map((order) => {
      order = decorateOrder(order, tokens)
      order = decorateOrderBookOrder(order, tokens)
      return (order)
    })
  )
}

const decorateOrderBookOrder = (order, tokens) => {

  const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

  return ({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
  })
}

//-------------------------------------------------------------------------------
//Price Chart

export const priceChartSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) { return }

    //Filter orders by selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    //Sort orders by date ascending to compare history
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)

    //Decorate orders - add display attributes
    orders = orders.map((o) => decorateOrder(o, tokens))

    // Get last 2 order for final price & price change
    let secondLastOrder, lastOrder
    [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)

    // Get last order price
    const lastPrice = get(lastOrder, 'tokenPrice', 0)

    // Get second last order price
    const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

    return ({
      lastPrice,
      lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
      series: [{
        data: buildGraphData(orders)
      }]
    })
  }
)

const buildGraphData = (orders) => {
  orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())

  // console.log(orders)

  const hours = Object.keys(orders)
  // console.log(hours)

  const graphData = hours.map((hour) => {
    //Fetch all orders from current hour
    const group = orders[hour]
    // console.log(group)

    //Calculate price values: open, high, low, close
    const open = group[0]
    const high = maxBy(group, 'tokenPrice')
    const low = minBy(group, 'tokenPrice')
    const close = group[group.length - 1]

    // console.log(open, high, low, close)

    return ({
      x: new Date(hour),
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
    })
  })

  return graphData
}