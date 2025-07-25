import sort from '../assets/sort.svg'

const OrderTable = ({
    title,
    orders,
    symbols,
    fillOrderedHandler,
    isSellOrder = false, // Differentiates between sell and buy order logic
    colorClass, // e.g., 'text-destructive', 'text-green-600 dark:text-green-400'
    bgColorClass, // e.g., 'bg-destructive/5', 'bg-green-500/5'
    borderColorClass, // e.g., 'border-destructive/20', 'border-green-500/20'
    headerBgClass, // e.g., 'bg-destructive/10', 'bg-green-500/10'
    headerBorderClass, // e.g., 'border-destructive/30', 'border-green-500/30'
    hoverBorderClass, // e.g., 'hover:border-l-destructive', 'hover:border-l-green-500'
  }) => {
    // Define table headers dynamically
    const headers = [
      { label: symbols ? symbols[0] : '', sortable: true },
      { label: symbols ? `Price (${symbols[1]})` : '', sortable: true },
      { label: symbols ? `Total ${symbols[1]}` : '', sortable: true },
    ];
  
    const noOrdersText = isSellOrder ? 'No Sell Orders' : 'No Buy Orders';
  
    return (
      <div className={`${bgColorClass} ${borderColorClass} rounded border h-full w-full flex flex-col relative`}>
        {/* Title Header - Always Visible */}
        <div className={`${bgColorClass} border-b ${headerBorderClass} p-4 flex-shrink-0 w-full`}>
          <h3 className={`font-bold text-base ${colorClass} m-0`}>{title}</h3>
        </div>

        {/* Display 'No Orders' banner if no orders are present */}
        {!orders || orders.length === 0 ? (
          <div className={`flex justify-center items-center flex-1 ${colorClass} text-center w-full`}>
            <div>
              <div className="text-lg font-medium">{noOrdersText}</div>
              <div className="text-sm text-muted-foreground mt-2">Waiting for orders to appear</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 w-full">
            {/* Column Headers - Sticky */}
            <div className={`${headerBgClass} border-b ${headerBorderClass} flex-shrink-0 sticky top-0 z-10 w-full`}>
              <div className="grid gap-0 w-full" style={{gridTemplateColumns: '2fr 1fr 1fr'}}>
                {headers.map((header, index) => (
                  <div key={index} className={`p-3 text-left ${colorClass} font-semibold text-xs uppercase tracking-wide border-r last:border-r-0 ${headerBorderClass} w-full`}>
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
                {orders.map((order, index) => (
                  <div
                    key={index}
                    onClick={() => fillOrderedHandler(order)}
                    className={`grid gap-0 border-b border-border/20 hover:${bgColorClass} cursor-pointer transition-all duration-150 border-l-2 border-l-transparent ${hoverBorderClass} group w-full`}
                    style={{gridTemplateColumns: '2fr 1fr 1fr'}}
                  >
                    <div className="p-3 text-sm font-medium border-r border-border/10 group-hover:border-border/30 w-full">
                      {isSellOrder ? ((order.token0Amount) * 1).toFixed(1) : ((order.token1Amount) * 1).toFixed(1)}
                    </div>
                    <div className={`p-3 text-sm font-bold ${colorClass} border-r border-border/10 group-hover:border-border/30 text-center w-full`}>
                      {order.tokenPrice}
                    </div>
                    <div className="p-3 text-sm text-muted-foreground text-right w-full">
                      {isSellOrder ? ((order.token1Amount) * 1).toFixed(1) : ((order.token0Amount) * 1).toFixed(1)}
                    </div>
                  </div>
                ))}
                
                {/* Fill remaining space if content is shorter than container */}
                <div className="flex-1 min-h-0 w-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default OrderTable;