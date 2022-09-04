import { useSelector } from "react-redux"
import { filledOrdersSelector } from '../store/selector'
import sort from '../assets/sort.svg'
import Banner from "./Banner"

const Trades = () => {
  const symbols = useSelector(state => state.tokens.symbols)
  console.log(symbols)
  const filledOrders = useSelector(filledOrdersSelector)


  console.log(filledOrders)

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
              console.log(order.tokenPriceClass)
              return (
                <tr key={index}>
                  <td>{order.formattedTimestamp}</td>
                  <td style={{ color: `${order.tokenPriceClass}` }}>{order.token1Amount}</td>
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