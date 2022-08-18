import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { configureStore } from '@reduxjs/toolkit'

/* Import Reducers */
import { provider, tokens, exchange } from './reducers'

console.log(tokens)

const reducer = combineReducers({
  provider,
  tokens,
  exchange
})
console.log(reducer)

const initialState = {}

const middleware = [thunk]

const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)))
export default store
