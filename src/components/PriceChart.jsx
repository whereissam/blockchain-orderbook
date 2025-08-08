import { useState } from 'react'
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
  const [timeRange, setTimeRange] = useState('5m')
  const account = useProviderStore((state) => state.account)
  const symbols = useTokensStore((state) => state.symbols)
  const filledOrders = useExchangeStore((state) => state.filledOrders)
  const priceChart = usePriceChartSelector(timeRange)
  
  // Debug: Check filled orders
  console.log('📊 PriceChart Debug:', {
    hasAccount: !!account,
    symbols: symbols,
    filledOrdersLoaded: filledOrders?.loaded,
    filledOrdersCount: filledOrders?.data?.length || 0,
    priceChartData: !!priceChart,
    priceChartKeys: priceChart ? Object.keys(priceChart) : 'none',
    priceChartSeries: priceChart?.series?.length || 0,
    lastPrice: priceChart?.lastPrice || 'none'
  })

  return (
    <div className="component exchange__chart flex flex-col h-full">
      <div className='component__header'>
        <div className='flex items-center gap-3'>
          <h2 className="text-lg font-bold">
            {symbols ? `${symbols[0]}/${symbols[1]}` : 'Loading...'}
          </h2>

          {priceChart && (
            <div className='flex items-center gap-2 px-3 py-1 rounded-lg bg-muted'>
              {priceChart.lastPriceChange === '+' ? (
                <img src={arrowUp} alt="Price up" className="w-4 h-4" />
              ) : (
                <img src={arrowDown} alt="Price down" className="w-4 h-4" />
              )}
              <span className={`font-bold text-sm ${priceChart.lastPriceChange === '+' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {priceChart.lastPrice}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-muted-foreground">
            Price Chart • Candlestick View
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {[
              { label: '5m', value: '5m' },
              { label: '1h', value: '1h' },
              { label: '4h', value: '4h' },
              { label: '1d', value: '1d' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  timeRange === range.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 w-full">
        {!account ? (
          <div className="flex justify-center items-center flex-1 text-center w-full">
            <div className="p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-lg font-medium text-foreground mb-2">Connect Your Wallet</div>
              <div className="text-sm text-muted-foreground">Connect to MetaMask to view price charts</div>
            </div>
          </div>
        ) : !filledOrders?.loaded || filledOrders?.data?.length === 0 ? (
          <div className="flex justify-center items-center flex-1 text-center w-full">
            <div className="p-8 max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-lg font-medium text-foreground mb-2">No Completed Trades</div>
              <div className="text-sm text-muted-foreground mb-4">Charts show price history from executed orders only</div>
              
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <div className="text-sm font-medium text-foreground mb-2">Quick Start:</div>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    Create orders in Order Book
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    Click on others' orders to fill them
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    Each trade creates chart data points
                  </li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 w-full p-4">
            <Chart
              type="candlestick"
              options={{
                ...options,
                xaxis: {
                  ...options.xaxis,
                  labels: {
                    ...options.xaxis.labels,
                    format: timeRange === '1d' ? 'MMM dd' : timeRange === '4h' || timeRange === '1h' ? 'HH:mm' : 'HH:mm'
                  }
                }
              }}
              series={priceChart && priceChart.series && Array.isArray(priceChart.series) ? priceChart.series : defaultSeries}
              width="100%"
              height="100%"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PriceChart