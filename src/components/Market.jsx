import config from '../config.json'

import { loadToken } from '../store/interactions'
import useProviderStore from '../store/providerStore'

const Market = () => {
  const provider = useProviderStore((state) => state.connection)
  const chainId = useProviderStore((state) => state.chainId)
  console.log(chainId)
  console.log(config[chainId])

  const marketHandler = async (e) => {
    loadToken(provider, (e.target.value).split(','))
  }

  return (
    <div className='component exchange__markets'>
      <div className='component__header'>
        <h2>Select Market</h2>
      </div>

      {chainId && config[chainId] ? (
        <select name="markets" id="markets" onChange={marketHandler}>
          <option value={`${config[chainId].SSS.address},${config[chainId].mETH.address}`}>SSS / mETH</option>
          <option value={`${config[chainId].SSS.address},${config[chainId].mDAI.address}`}>SSS / mDAI</option>
        </select>
      ) : (
        <div>
          <p>Not Deployed to Network</p>
        </div>
      )}

      <hr />
    </div>
  )
}

export default Market
