// Import Assets
import sort from '../assets/sort.svg'

// Import Selectors
import { useOrderBookSelector } from '../store/zustandSelectors'

// Import Interactions
import { fillOrder } from '../store/interactions'
import useProviderStore from '../store/providerStore'
import useTokensStore from '../store/tokensStore'
import useExchangeStore from '../store/exchangeStore'

const OrderBook = () => {
  const provider = useProviderStore((state) => state.connection)
  const exchange = useExchangeStore((state) => state.contract)
  const symbols = useTokensStore((state) => state.symbols)
  const orderBook = useOrderBookSelector()

  const fillOrderedHandler = (order) => {
    fillOrder(provider, exchange, order)
  }

  return (
    <div className="component exchange__orderbook">
      <div className='component__header flex-between'>
        <h2>Order Book</h2>
      </div>

      <div className="flex">

        {!orderBook || orderBook.sellOrders.length === 0 ? (
          <p className='flex-center'>No Sell Orders</p>
        ) : (
          <table className='exchange__orderbook--sell'>
            <caption>Selling</caption>
            <thead>
              <tr>
                <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
              </tr>
            </thead>
            <tbody>
              {orderBook && orderBook.sellOrders.map((order, index) => {
                return (
                  <tr key={index} onClick={() => fillOrderedHandler(order)}>
                    <td>{((order.token0Amount) * 1).toFixed(1)}</td>
                    <td style={{ color: `${order.orderTypeClass}` }}>{order.tokenPrice}</td>
                    <td>{((order.token1Amount) * 1).toFixed(1)}</td>
                  </tr>
                )
              })}

            </tbody>
          </table>
        )}


        <div className='divider'></div>
        {!orderBook || orderBook.buyOrders.length === 0 ? (
          <p className='flex-center'>No buy Orders</p>
        ) : (
          <table className='exchange__orderbook--buy'>
            <caption>Buying</caption>
            <thead>
              <tr>
                <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
              </tr>
            </thead>
            <tbody>
              {orderBook && orderBook.buyOrders.map((order, index) => {
                return (
                  <tr key={index} onClick={() => fillOrderedHandler(order)}>
                    <td>{((order.token1Amount) * 1).toFixed(1)}</td>
                    <td style={{ color: `${order.orderTypeClass}` }}>{order.tokenPrice}</td>
                    <td>{((order.token0Amount) * 1).toFixed(1)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default OrderBook