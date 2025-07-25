// Import Assets
import sort from '../assets/sort.svg'

// Import Selectors
import { useOrderBookSelector } from '../store/zustandSelectors'

// Import Interactions
import { fillOrder } from '../store/interactions'
import useProviderStore from '../store/providerStore'
import useTokensStore from '../store/tokensStore'
import useExchangeStore from '../store/exchangeStore'
import OrderTable from './OrderTable'

const OrderBook = () => {
  const provider = useProviderStore((state) => state.connection);
  const exchange = useExchangeStore((state) => state.contract);
  const symbols = useTokensStore((state) => state.symbols);
  const orderBook = useOrderBookSelector(); // Fetches order book data

  // Handler for filling an order
  const fillOrderedHandler = (order) => {
    fillOrder(provider, exchange, order);
  };

  return (
    <div className="component exchange__orderbook flex flex-col h-full">
      <div className='component__header flex-between'>
        <h2>Order Book</h2>
      </div>

      <div className="flex flex-row gap-4 flex-1 h-full w-full">
        {/* Sell Orders Table */}
        <div className="flex-1 h-full">
          <OrderTable
            title="📉 Selling Orders"
            orders={orderBook?.sellOrders}
            symbols={symbols}
            fillOrderedHandler={fillOrderedHandler}
            isSellOrder={true}
            colorClass="text-destructive"
            bgColorClass="bg-destructive/5"
            borderColorClass="border-destructive/20"
            headerBgClass="bg-destructive/10"
            headerBorderClass="border-destructive/30"
            hoverBorderClass="hover:border-l-destructive"
          />
        </div>

        {/* Buy Orders Table */}  
        <div className="flex-1 h-full">
          <OrderTable
            title="📈 Buying Orders"
            orders={orderBook?.buyOrders}
            symbols={symbols}
            fillOrderedHandler={fillOrderedHandler}
            isSellOrder={false}
            colorClass="text-green-600 dark:text-green-400"
            bgColorClass="bg-green-500/5"
            borderColorClass="border-green-500/20"
            headerBgClass="bg-green-500/10"
            headerBorderClass="border-green-500/30"
            hoverBorderClass="hover:border-l-green-500"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderBook;

