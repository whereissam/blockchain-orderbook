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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[250px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 border-b border-border text-foreground font-medium">
                  Time 
                  <img src={sort} alt="Sort" className="inline ml-1 w-3 h-3 opacity-70" />
                </th>
                <th className="text-left p-3 border-b border-border text-foreground font-medium">
                  {symbols && symbols[0]}
                  <img src={sort} alt="Sort" className="inline ml-1 w-3 h-3 opacity-70" />
                </th>
                <th className="text-left p-3 border-b border-border text-foreground font-medium">
                  {symbols && symbols[0]}/{symbols && symbols[1]}
                  <img src={sort} alt="Sort" className="inline ml-1 w-3 h-3 opacity-70" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filledOrders && filledOrders.map((order, index) => {
                return (
                  <tr key={index} className="hover:bg-accent cursor-pointer transition-colors">
                    <td className="p-3 border-b border-border/30 text-sm text-muted-foreground">
                      {order.formattedTimestamp}
                    </td>
                    <td className={`p-3 border-b border-border/30 text-sm font-medium ${order.tokenPriceClass}`}>
                      {order.token1Amount}
                    </td>
                    <td className="p-3 border-b border-border/30 text-sm font-bold">
                      {order.tokenPrice}
                    </td>
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

export default Trades