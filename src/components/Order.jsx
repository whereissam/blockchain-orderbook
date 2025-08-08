import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { makeBuyOrder, makeSellOrder } from '../store/interactions'
import useProviderStore from '../store/providerStore'
import useTokensStore from '../store/tokensStore'
import useExchangeStore from '../store/exchangeStore'

const Order = () => {
  const [isBuy, setIsBuy] = useState(true)
  const [amount, setAmount] = useState(0)
  const [price, setPrice] = useState(0)

  const provider = useProviderStore((state) => state.connection)
  const account = useProviderStore((state) => state.account)
  const isConnected = useProviderStore((state) => state.isConnected)
  const tokens = useTokensStore((state) => state.contracts)
  const exchange = useExchangeStore((state) => state.contract)
  
  const isReady = isConnected && account && tokens && tokens.length >= 2 && exchange

  const handleTabChange = (value) => {
    setIsBuy(value === 'buy')
  }

  const buyHandler = (e) => {
    e.preventDefault()
    makeBuyOrder(provider, exchange, tokens, { amount, price })
    setAmount(0)
    setPrice(0)
  }

  const sellHandler = (e) => {
    e.preventDefault()
    makeSellOrder(provider, exchange, tokens, { amount, price })
    setAmount(0)
    setPrice(0)
  }

  return (
    <div className="">
      <div className="component__header">
        <h2>New Order</h2>
        <Tabs value={isBuy ? 'buy' : 'sell'} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {!isReady && (
        <div className="flex-center w-full py-8 px-4 text-muted-foreground">
          Connect your wallet to place orders
        </div>
      )}
      
      <form onSubmit={isReady ? (isBuy ? buyHandler : sellHandler) : (e) => e.preventDefault()} className="p-4 space-y-4">
        <div>
          <label htmlFor="amount" className="block mb-2">
            {isBuy ? 'Buy Amount' : 'Sell Amount'}
          </label>
          <Input
            type="text"
            id='amount'
            placeholder='0.0000'
            value={amount === 0 ? '' : amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!isReady}
          />
        </div>

        <div>
          <label htmlFor="price" className="block mb-2">
            {isBuy ? 'Buy Price' : 'Sell Price'}
          </label>
          <Input
            type="text"
            id='price'
            placeholder='0.0000'
            value={price === 0 ? '' : price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={!isReady}
          />
        </div>

        <Button 
          type='submit' 
          disabled={!isReady}
          className="w-full"
          variant={!isReady ? 'outline' : (isBuy ? 'default' : 'destructive')}
        >
          {!isReady ? 'Connect Wallet' : isBuy ? 'Place Buy Order' : 'Place Sell Order'}
        </Button>
      </form>
    </div>
  )
}

export default Order
