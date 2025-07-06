import Chart from 'react-apexcharts'

import arrowDown from '../assets/down-arrow.svg'
import arrowUp from '../assets/up-arrow.svg'

import { options, defaultSeries } from "./PriceChart.config"

import { usePriceChartSelector } from "../store/zustandSelectors"

import Banner from "./Banner"
import useProviderStore from '../store/providerStore'
import useTokensStore from '../store/tokensStore'

const PriceChart = () => {
  const account = useProviderStore((state) => state.account)
  const symbols = useTokensStore((state) => state.symbols)
  const priceChart = usePriceChartSelector()

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
      ) : (
        <Chart
          type="candlestick"
          options={options}
          series={priceChart ? priceChart.series : defaultSeries}
          width="100%"
          height="100%"
        />
      )}

    </div>
  )
}

export default PriceChart