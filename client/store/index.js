import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

// Import reducers
import gameReducer from './reducers/gameReducer';
import cryptoReducer from './reducers/cryptoReducer';
import machineReducer from './reducers/machineReducer';
import upgradeReducer from './reducers/upgradeReducer';
import achievementReducer from './reducers/achievementReducer';

// Combine reducers
const rootReducer = combineReducers({
  game: gameReducer,
  crypto: cryptoReducer,
  machines: machineReducer,
  upgrades: upgradeReducer,
  achievements: achievementReducer
});

// Create store
const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;