import { useRef, useState } from 'react'
import { useMyOpenOrdersSelector, useMyFilledOrdersSelector } from '../store/zustandSelectors'
import sort from '../assets/sort.svg'
import Banner from "./Banner"
import { cancelOrder } from '../store/interactions'
import useProviderStore from '../store/providerStore'
import useTokensStore from '../store/tokensStore'
import useExchangeStore from '../store/exchangeStore'

const Transactions = () => {
  const [showMyOrders, setShowMyOrders] = useState(true)

  const provider = useProviderStore((state) => state.connection)
  const exchange = useExchangeStore((state) => state.contract)
  const symbols = useTokensStore((state) => state.symbols)
  const myOpenOrders = useMyOpenOrdersSelector()
  const myFilledOrders = useMyFilledOrdersSelector()

  const tradeRef = useRef(null)
  const orderRef = useRef(null)

  // Fixed tab handler - the issue was inefficient DOM manipulation
  const tabHandler = (e) => {
    const isOrdersTab = e.target === orderRef.current
    
    if (isOrdersTab) {
      // Switching to Orders tab
      orderRef.current.className = 'tab tab--active'
      tradeRef.current.className = 'tab'
      setShowMyOrders(true)
    } else {
      // Switching to Trades tab  
      tradeRef.current.className = 'tab tab--active'
      orderRef.current.className = 'tab'
      setShowMyOrders(false)
    }
  }

  const cancelHandler = (order) => {
    cancelOrder(provider, exchange, order)
  }

  return (
    <div className="component exchange__transactions">
      {showMyOrders ? (
        <div>
          <div className='component__header flex-between'>
            <h2>My Orders</h2>

            <div className='tabs'>
              <button onClick={tabHandler} ref={orderRef} className='tab tab--active'>Orders</button>
              <button onClick={tabHandler} ref={tradeRef} className='tab'>Trades</button>
            </div>
          </div>

          {!myOpenOrders || myOpenOrders.length === 0 ? (
            <Banner text='No Open Orders' />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
                  <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>

                {myOpenOrders && myOpenOrders.map((order, index) => {
                  return (
                    <tr key={index}>
                      <td className={order.orderTypeClass}>{order.token0Amount}</td>
                      <td>{order.tokenPrice}</td>
                      <td><button className='button--sm'
                        onClick={() => cancelHandler(order)}>Cancel</button></td>
                    </tr>
                  )
                })}

              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div>
          <div className='component__header flex-between'>
            <h2>My Transactions</h2>

            <div className='tabs'>
              <button onClick={tabHandler} ref={orderRef} className='tab'>Orders</button>
              <button onClick={tabHandler} ref={tradeRef} className='tab tab--active'>Trades</button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Time<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
              </tr>
            </thead>
            <tbody>

              {myFilledOrders && myFilledOrders.map((order, index) => {
                return (
                  <tr key={index}>
                    <td>{order.formattedTimestamp}</td>
                    <td className={order.orderTypeClass}>{order.orderSign}{order.token0Amount}</td>
                    <td>{order.tokenPrice}</td>
                  </tr>
                )
              })}

            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Transactions