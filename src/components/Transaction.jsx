import { useState } from 'react';
import { useMyOpenOrdersSelector, useMyFilledOrdersSelector } from '../store/zustandSelectors';
import sort from '../assets/sort.svg';
import Banner from './Banner';
import { cancelOrder } from '../store/interactions';
import useProviderStore from '../store/providerStore';
import useTokensStore from '../store/tokensStore';
import useExchangeStore from '../store/exchangeStore';

// Optional: A reusable TabButton component
const TabButton = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`tab ${isActive ? 'tab--active' : ''}`}
  >
    {children}
  </button>
);

const Transactions = () => {
  const [showMyOrders, setShowMyOrders] = useState(true);

  const provider = useProviderStore((state) => state.connection);
  const exchange = useExchangeStore((state) => state.contract);
  const symbols = useTokensStore((state) => state.symbols);
  const myOpenOrders = useMyOpenOrdersSelector();
  const myFilledOrders = useMyFilledOrdersSelector();

  const cancelHandler = (order) => {
    cancelOrder(provider, exchange, order);
  };

  // Define common table headers for open orders
  const openOrdersHeaders = [
    { label: symbols && symbols[0], sortable: true },
    { label: symbols ? `${symbols[0]}/${symbols[1]}` : '', sortable: true },
    { label: '', sortable: false }, // For the Cancel button
  ];

  // Define common table headers for filled orders
  const filledOrdersHeaders = [
    { label: 'Time', sortable: true },
    { label: symbols && symbols[0], sortable: true },
    { label: symbols ? `${symbols[0]}/${symbols[1]}` : '', sortable: true },
  ];

  // Determine which data and headers to display
  const ordersToDisplay = showMyOrders ? myOpenOrders : myFilledOrders;
  const currentHeaders = showMyOrders ? openOrdersHeaders : filledOrdersHeaders;
  const noOrdersText = showMyOrders ? 'No Open Orders' : 'No Transactions';
  const tableTitle = showMyOrders ? 'My Orders' : 'My Transactions';

  return (
    <div className="component exchange__transactions flex flex-col h-full">
      <div className='component__header flex-between'>
        <h2>{tableTitle}</h2>
        <div className='tabs'>
          <TabButton isActive={showMyOrders} onClick={() => setShowMyOrders(true)}>
            Orders
          </TabButton>
          <TabButton isActive={!showMyOrders} onClick={() => setShowMyOrders(false)}>
            Trades
          </TabButton>
        </div>
      </div>

      <div className="flex flex-col flex-1 h-full w-full">
        {!ordersToDisplay || ordersToDisplay.length === 0 ? (
          <div className="flex justify-center items-center flex-1 text-muted-foreground text-center w-full">
            <div>
              <div className="text-lg font-medium">{noOrdersText}</div>
              <div className="text-sm text-muted-foreground mt-2">
                {showMyOrders ? 'Create orders to see them here' : 'Complete trades to see history'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 w-full">
            {/* Column Headers - Sticky */}
            <div className="bg-muted border-b border-border flex-shrink-0 sticky top-0 z-10 w-full">
              <div className="grid gap-0 w-full" style={{gridTemplateColumns: showMyOrders ? '2fr 1fr 1fr' : '1fr 2fr 1fr'}}>
                {currentHeaders.map((header, index) => (
                  <div key={index} className="p-3 text-left text-foreground font-semibold text-xs uppercase tracking-wide border-r last:border-r-0 border-border w-full">
                    <div className="flex items-center justify-between w-full">
                      <span>{header.label}</span>
                      {header.sortable && <img src={sort} alt="Sort" className="w-3 h-3 opacity-60" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain w-full">
              <div className="min-h-full w-full">
                {ordersToDisplay.map((order, index) => (
                  <div
                    key={index}
                    className="grid gap-0 border-b border-border/20 hover:bg-accent cursor-pointer transition-all duration-150 group w-full"
                    style={{gridTemplateColumns: showMyOrders ? '2fr 1fr 1fr' : '1fr 2fr 1fr'}}
                  >
                    {showMyOrders ? (
                      <>
                        <div className={`p-3 text-sm font-medium border-r border-border/10 group-hover:border-border/30 w-full ${order.orderTypeClass}`}>
                          {order.token0Amount}
                        </div>
                        <div className="p-3 text-sm font-bold text-center border-r border-border/10 group-hover:border-border/30 w-full">
                          {order.tokenPrice}
                        </div>
                        <div className="p-3 text-sm text-center w-full">
                          <button 
                            className='button--sm hover:bg-destructive hover:text-destructive-foreground' 
                            onClick={() => cancelHandler(order)}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 text-sm text-muted-foreground border-r border-border/10 group-hover:border-border/30 w-full">
                          {order.formattedTimestamp}
                        </div>
                        <div className={`p-3 text-sm font-medium border-r border-border/10 group-hover:border-border/30 w-full ${order.orderTypeClass}`}>
                          {order.orderSign}{order.token0Amount}
                        </div>
                        <div className="p-3 text-sm font-bold text-right w-full">
                          {order.tokenPrice}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                
                {/* Fill remaining space if content is shorter than container */}
                <div className="flex-1 min-h-0 w-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;