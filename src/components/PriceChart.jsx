import Chart from 'react-apexcharts'

import arrowDown from '../assets/down-arrow.svg'
import arrowUp from '../assets/up-arrow.svg'

import { options, defaultSeries } from "./PriceChart.config"

import { usePriceChartSelector } from "../store/zustandSelectors"

import Banner from "./Banner"
import useProviderStore from '../store/providerStore'
import useTokensStore from '../store/tokensStore'
import useExchangeStore from '../store/exchangeStore'

const PriceChart = () => {
  const account = useProviderStore((state) => state.account)
  const symbols = useTokensStore((state) => state.symbols)
  const filledOrders = useExchangeStore((state) => state.filledOrders)
  const priceChart = usePriceChartSelector()
  
  // Debug: Check filled orders
  console.log('📊 PriceChart Debug:', {
    hasAccount: !!account,
    symbols: symbols,
    filledOrdersLoaded: filledOrders?.loaded,
    filledOrdersCount: filledOrders?.data?.length || 0,
    priceChartData: !!priceChart,
    priceChartKeys: priceChart ? Object.keys(priceChart) : 'none'
  })

  return (
    <div className="component exchange__chart">
      <div className='component__header flex-between'>
        <div className='flex'>

          <h2>{symbols && `${symbols[0]}/${symbols[1]}`}</h2>

          {priceChart && (
            <div className='flex'>

              {priceChart.lastPriceChange === '+' ? (
                <img src={arrowUp} alt="Arrow up" />
              ) : (
                <img src={arrowDown} alt="Arrow down" />
              )}

              <span className='up'>{priceChart.lastPrice}</span>
            </div>
          )}

        </div>
      </div>

      {/* Price chart goes here */}

      {!account ? (
        <Banner text={'Please connect to metamask'} />
      ) : filledOrders?.data?.length === 0 ? (
        <Banner text={'No trades yet. Make some orders to see the chart!'} />
      ) : (
        <Chart
          type="candlestick"
          options={options}
          series={priceChart && priceChart.series && Array.isArray(priceChart.series) ? priceChart.series : defaultSeries}
          width="100%"
          height="100%"
        />
      )}

    </div>
  )
}

export default PriceChart