import { useFilledOrdersSelector } from '../store/zustandSelectors'
import sort from '../assets/sort.svg'
import Banner from "./Banner"
import useTokensStore from '../store/tokensStore'

const Trades = () => {
  const symbols = useTokensStore((state) => state.symbols)
  // console.log(symbols)
  const filledOrders = useFilledOrdersSelector()


  // console.log(filledOrders)

  return (
    <div className="component exchange__trades">
      <div className='component__header flex-between'>
        <h2>Trades</h2>
      </div>

      {!filledOrders || filledOrders.length === 0 ? (
        <Banner text='No Transactions'></Banner>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Time <img src={sort} alt="Sort"></img></th>
              <th>{symbols && symbols[0]}<img src={sort} alt="Sort"></img></th>
              <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort"></img></th>
            </tr>
          </thead>
          <tbody>

            {filledOrders && filledOrders.map((order, index) => {
              return (
                <tr key={index}>
                  <td>{order.formattedTimestamp}</td>
                  <td className={order.tokenPriceClass}>{order.token1Amount}</td>
                  <td>{order.tokenPrice}</td>
                </tr>
              )
            })}


          </tbody>
        </table>
      )}

    </div>
  )
}

export default Trades