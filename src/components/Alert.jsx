import { useRef, useEffect } from 'react'
import useProviderStore from '../store/providerStore'
import useExchangeStore from '../store/exchangeStore'

import { useMyEventsSelector } from '../store/zustandSelectors'

import config from '../config.json'

const Alert = () => {
  const alertRef = useRef(null)

  const network = useProviderStore(state => state.chainId)
  const account = useProviderStore(state => state.account)
  const isPending = useExchangeStore(state => state.transaction.isPending)
  const isError = useExchangeStore(state => state.transaction.isError)
  const events = useMyEventsSelector()
  // console.log(network, account, isPending, isError, events)
  const removeHandler = async (e) => {
    alertRef.current.className = 'alert--remove'
  }

  useEffect(() => {
    // console.log(isPending)
    // console.log(events[0], isPending, isError, account)
    if ((events[0] || isPending || isError) && account) {
      console.log('alerts')
      alertRef.current.className = 'alert'
    }
  }, [isPending, isError])

  return (
    <div>
      {isPending ? (

        <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
          <h1>Transaction Pending...</h1>
        </div>

      ) : isError ? (

        <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
          <h1>Transaction Will Fail</h1>
        </div>

      ) : !isPending && events[0] ? (

        <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
          <h1>Transaction Successful</h1>
          <a
            href={config[network] ? `${config[network].explorerURL}/tx/${events[0].transactionHash}` : '#'}
            target='_blank'
            rel='noreferrer'
          >
            {events[0].transactionHash.slice(0, 6) + '...' + events[0].transactionHash.slice(60, 66)}
          </a>
        </div>

      ) : (
        <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}></div>
      )}
    </div>
  )
}

export default Alert
