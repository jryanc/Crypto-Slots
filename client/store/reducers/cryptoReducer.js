// Action Types
export const FETCH_CRYPTO_BALANCE_START = 'FETCH_CRYPTO_BALANCE_START';
export const FETCH_CRYPTO_BALANCE_SUCCESS = 'FETCH_CRYPTO_BALANCE_SUCCESS';
export const FETCH_CRYPTO_BALANCE_FAILURE = 'FETCH_CRYPTO_BALANCE_FAILURE';
export const FETCH_CRYPTO_PRICES_START = 'FETCH_CRYPTO_PRICES_START';
export const FETCH_CRYPTO_PRICES_SUCCESS = 'FETCH_CRYPTO_PRICES_SUCCESS';
export const FETCH_CRYPTO_PRICES_FAILURE = 'FETCH_CRYPTO_PRICES_FAILURE';
export const PURCHASE_CRYPTO_SUCCESS = 'PURCHASE_CRYPTO_SUCCESS';
export const SELL_CRYPTO_SUCCESS = 'SELL_CRYPTO_SUCCESS';
export const WITHDRAW_CRYPTO_SUCCESS = 'WITHDRAW_CRYPTO_SUCCESS';
export const DEPOSIT_CRYPTO_SUCCESS = 'DEPOSIT_CRYPTO_SUCCESS';
export const CONVERT_CRYPTO_SUCCESS = 'CONVERT_CRYPTO_SUCCESS';
export const FETCH_CRYPTO_TRANSACTIONS_SUCCESS = 'FETCH_CRYPTO_TRANSACTIONS_SUCCESS';
export const FETCH_CRYPTO_PORTFOLIO_SUCCESS = 'FETCH_CRYPTO_PORTFOLIO_SUCCESS';
export const FETCH_SUPPORTED_CRYPTOS_SUCCESS = 'FETCH_SUPPORTED_CRYPTOS_SUCCESS';
export const CRYPTO_OPERATION_FAILURE = 'CRYPTO_OPERATION_FAILURE';
export const RESET_CRYPTO_ERROR = 'RESET_CRYPTO_ERROR';
export const UPDATE_CRYPTO_BALANCE = 'UPDATE_CRYPTO_BALANCE';

// Initial State
const initialState = {
  balances: [],
  totalUsdValue: 0,
  prices: {},
  portfolio: [],
  portfolioSummary: {
    totalInvested: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercentage: 0
  },
  transactions: [],
  transactionsPagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  },
  supportedCryptos: [],
  loading: false,
  error: null,
  lastUpdated: null
};

// Reducer
const cryptoReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CRYPTO_BALANCE_START:
    case FETCH_CRYPTO_PRICES_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FETCH_CRYPTO_BALANCE_SUCCESS:
      return {
        ...state,
        balances: action.payload.balances,
        totalUsdValue: action.payload.totalUsdValue,
        loading: false,
        lastUpdated: new Date()
      };
    
    case FETCH_CRYPTO_PRICES_SUCCESS:
      return {
        ...state,
        prices: action.payload,
        loading: false,
        lastUpdated: new Date()
      };
    
    case FETCH_CRYPTO_BALANCE_FAILURE:
    case FETCH_CRYPTO_PRICES_FAILURE:
    case CRYPTO_OPERATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case PURCHASE_CRYPTO_SUCCESS:
      return {
        ...state,
        balances: action.payload.newBalance.crypto,
        loading: false,
        error: null,
        lastUpdated: new Date()
      };
    
    case SELL_CRYPTO_SUCCESS:
      return {
        ...state,
        balances: action.payload.newBalance.crypto,
        loading: false,
        error: null,
        lastUpdated: new Date()
      };
    
    case WITHDRAW_CRYPTO_SUCCESS:
    case DEPOSIT_CRYPTO_SUCCESS:
    case CONVERT_CRYPTO_SUCCESS:
      return {
        ...state,
        balances: action.payload.newBalance.crypto,
        loading: false,
        error: null,
        lastUpdated: new Date()
      };
    
    case FETCH_CRYPTO_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        transactions: action.payload.transactions,
        transactionsPagination: action.payload.pagination,
        loading: false,
        error: null
      };
    
    case FETCH_CRYPTO_PORTFOLIO_SUCCESS:
      return {
        ...state,
        portfolio: action.payload.portfolio,
        portfolioSummary: action.payload.summary,
        loading: false,
        error: null,
        lastUpdated: new Date()
      };
    
    case FETCH_SUPPORTED_CRYPTOS_SUCCESS:
      return {
        ...state,
        supportedCryptos: action.payload,
        loading: false,
        error: null
      };
    
    case RESET_CRYPTO_ERROR:
      return {
        ...state,
        error: null
      };
    
    case UPDATE_CRYPTO_BALANCE:
      // This is used when crypto is earned from gameplay
      const { cryptoType, amount } = action.payload;
      
      // Find if this crypto already exists in balances
      const existingBalanceIndex = state.balances.findIndex(
        b => b.cryptoType.toLowerCase() === cryptoType.toLowerCase()
      );
      
      let updatedBalances;
      
      if (existingBalanceIndex >= 0) {
        // Update existing balance
        updatedBalances = [...state.balances];
        updatedBalances[existingBalanceIndex] = {
          ...updatedBalances[existingBalanceIndex],
          amount: updatedBalances[existingBalanceIndex].amount + amount
        };
      } else {
        // Add new crypto type
        updatedBalances = [
          ...state.balances,
          {
            cryptoType: cryptoType.toLowerCase(),
            amount,
            usdValue: 0 // Will be updated on next balance fetch
          }
        ];
      }
      
      return {
        ...state,
        balances: updatedBalances,
        lastUpdated: new Date()
      };
    
    default:
      return state;
  }
};

export default cryptoReducer;