import { useSelector, useDispatch } from 'react-redux'

import config from '../config.json'

import { loadToken } from '../store/interactions'

const Market = () => {
  const provider = useSelector(state => state.provider.connection)
  const chainId = useSelector(state => state.provider.chainId)
  console.log(chainId)
  console.log(config[chainId])
  const dispatch = useDispatch()

  const marketHandler = async (e) => {
    loadToken(provider, (e.target.value).split(','), dispatch)
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
