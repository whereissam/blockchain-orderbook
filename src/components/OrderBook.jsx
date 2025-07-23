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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">

        <div className="overflow-x-auto">
          {!orderBook || orderBook.sellOrders.length === 0 ? (
            <p className='flex-center min-h-[100px]'>No Sell Orders</p>
          ) : (
            <table className='exchange__orderbook--sell w-full min-w-[250px]'>
              <caption className="text-left font-semibold mb-2">Selling</caption>
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">{symbols && symbols[0]}<img src={sort} alt="Sort" className="inline ml-1 w-3 h-3" /></th>
                  <th className="text-left p-2 border-b">{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" className="inline ml-1 w-3 h-3" /></th>
                  <th className="text-left p-2 border-b">{symbols && symbols[1]}<img src={sort} alt="Sort" className="inline ml-1 w-3 h-3" /></th>
                </tr>
              </thead>
              <tbody>
                {orderBook && orderBook.sellOrders.map((order, index) => {
                  return (
                    <tr key={index} onClick={() => fillOrderedHandler(order)} className="hover:bg-accent/50 cursor-pointer">
                      <td className="p-2 border-b text-sm">{((order.token0Amount) * 1).toFixed(1)}</td>
                      <td className={`p-2 border-b text-sm ${order.orderTypeClass}`}>{order.tokenPrice}</td>
                      <td className="p-2 border-b text-sm">{((order.token1Amount) * 1).toFixed(1)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="overflow-x-auto">
          {!orderBook || orderBook.buyOrders.length === 0 ? (
            <p className='flex-center min-h-[100px]'>No Buy Orders</p>
          ) : (
            <table className='exchange__orderbook--buy w-full min-w-[250px]'>
              <caption className="text-left font-semibold mb-2">Buying</caption>
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">{symbols && symbols[0]}<img src={sort} alt="Sort" className="inline ml-1 w-3 h-3" /></th>
                  <th className="text-left p-2 border-b">{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" className="inline ml-1 w-3 h-3" /></th>
                  <th className="text-left p-2 border-b">{symbols && symbols[1]}<img src={sort} alt="Sort" className="inline ml-1 w-3 h-3" /></th>
                </tr>
              </thead>
              <tbody>
                {orderBook && orderBook.buyOrders.map((order, index) => {
                  return (
                    <tr key={index} onClick={() => fillOrderedHandler(order)} className="hover:bg-accent/50 cursor-pointer">
                      <td className="p-2 border-b text-sm">{((order.token1Amount) * 1).toFixed(1)}</td>
                      <td className={`p-2 border-b text-sm ${order.orderTypeClass}`}>{order.tokenPrice}</td>
                      <td className="p-2 border-b text-sm">{((order.token0Amount) * 1).toFixed(1)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderBook