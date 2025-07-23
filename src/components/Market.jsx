import { useState } from 'react'
import config from '../config.json'
import { loadToken } from '../store/interactions'
import useProviderStore from '../store/providerStore'
import { Button } from '../components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import { ChevronDownIcon } from 'lucide-react'
import '../App.css'

const Market = () => {
  const provider = useProviderStore((state) => state.connection)
  const chainId = useProviderStore((state) => state.chainId)
  const [selectedMarket, setSelectedMarket] = useState('SSS / mETH')
  
  console.log(chainId)
  console.log(config[chainId])

  const marketHandler = async (value, label) => {
    loadToken(provider, value.split(','))
    setSelectedMarket(label)
  }

  return (
    <div className='component exchange__markets bg-card rounded-lg border shadow-sm'>
      <div className='component__header p-6 border-b'>
        <h2>Select Market</h2>
      </div>

      <div className="p-6">
        {chainId && config[chainId] ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between h-10 px-3"
              >
                {selectedMarket}
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px]" align="start">
              <DropdownMenuItem 
                onClick={() => marketHandler(`${config[chainId].SSS.address},${config[chainId].mETH.address}`, 'SSS / mETH')}
                className="cursor-pointer"
              >
                SSS / mETH
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => marketHandler(`${config[chainId].SSS.address},${config[chainId].mDAI.address}`, 'SSS / mDAI')}
                className="cursor-pointer"
              >
                SSS / mDAI
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground">Not Deployed to Network</p>
            <p className="mt-1 text-muted-foreground">Switch to a supported network to trade</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Market
