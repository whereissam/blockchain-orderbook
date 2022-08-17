export const provider = (state = {}, action) => {
  console.log(action)
  // console.log(action.type)
  console.log(action.connection)
  switch (action.type) {
    case 'ACCOUNT_LOADED':
      return {
        ...state,
        account: action.account
      }
    case 'PROVIDER_LOADED':
      return {
        ...state,
        connection: action.connection
      }
    case 'NETWORK_LOADED':
      return {
        ...state,
        connection: action.chainId
      }



    default:
      return state
  }
}



export const tokens = (state = { loaded: false, contract: null }, action) => {
  console.log(action.type)
  console.log(action.token)
  switch (action.type) {
    case 'TOKEN_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.token,
        symbol: action.symbol
      }

    default:
      return state
  }
}

