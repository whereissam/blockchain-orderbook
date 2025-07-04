import { configureStore } from '@reduxjs/toolkit'

/* Import Reducers */
import { provider, tokens, exchange } from './reducers'

const store = configureStore({
  reducer: {
    provider,
    tokens,
    exchange
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['PROVIDER_LOADED'],
      ignoredPaths: ['provider.connection']
    }
  }),
  devTools: process.env.NODE_ENV !== 'production'
})

export default store
