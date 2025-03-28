// Action Types
export const SPIN_START = 'SPIN_START';
export const SPIN_SUCCESS = 'SPIN_SUCCESS';
export const SPIN_FAILURE = 'SPIN_FAILURE';
export const AUTO_SPIN_START = 'AUTO_SPIN_START';
export const AUTO_SPIN_STOP = 'AUTO_SPIN_STOP';
export const SET_BET_AMOUNT = 'SET_BET_AMOUNT';
export const CLAIM_DAILY_BONUS_SUCCESS = 'CLAIM_DAILY_BONUS_SUCCESS';
export const GAME_SESSION_START = 'GAME_SESSION_START';
export const GAME_SESSION_END = 'GAME_SESSION_END';
export const UPDATE_GAME_STATS = 'UPDATE_GAME_STATS';
export const ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED';
export const RESET_GAME_STATE = 'RESET_GAME_STATE';

// Initial State
const initialState = {
  isSpinning: false,
  spinResult: null,
  winAmount: 0,
  isWin: false,
  isJackpot: false,
  betAmount: 10,
  error: null,
  autoSpin: {
    active: false,
    remaining: 0,
    settings: {
      stopOnJackpot: true,
      stopOnBigWin: false,
      bigWinThreshold: 0
    }
  },
  currentSession: {
    id: null,
    isActive: false,
    startTime: null,
    endTime: null,
    stats: {
      totalSpins: 0,
      totalWins: 0,
      totalLosses: 0,
      totalBet: 0,
      totalWinnings: 0,
      netProfit: 0,
      biggestWin: 0,
      jackpotsWon: 0,
      cryptoEarned: 0
    }
  },
  dailyBonus: {
    lastClaimed: null,
    streak: 0,
    nextAvailable: null
  },
  gameStats: {
    totalSpins: 0,
    totalWins: 0,
    totalLosses: 0,
    biggestWin: 0,
    totalWinnings: 0,
    totalBets: 0,
    jackpotsWon: 0
  },
  recentAchievements: []
};

// Reducer
const gameReducer = (state = initialState, action) => {
  switch (action.type) {
    case SPIN_START:
      return {
        ...state,
        isSpinning: true,
        error: null
      };
    
    case SPIN_SUCCESS:
      const { spinResult, winAmount, isWin, isJackpot, paylines, multiplier, cryptoEarned } = action.payload;
      
      // Update session stats
      const updatedSession = {
        ...state.currentSession,
        stats: {
          ...state.currentSession.stats,
          totalSpins: state.currentSession.stats.totalSpins + 1,
          totalWins: state.currentSession.stats.totalWins + (isWin ? 1 : 0),
          totalLosses: state.currentSession.stats.totalLosses + (isWin ? 0 : 1),
          totalBet: state.currentSession.stats.totalBet + state.betAmount,
          totalWinnings: state.currentSession.stats.totalWinnings + (isWin ? winAmount : 0),
          netProfit: state.currentSession.stats.netProfit + (isWin ? winAmount : 0) - state.betAmount,
          biggestWin: Math.max(state.currentSession.stats.biggestWin, isWin ? winAmount : 0),
          jackpotsWon: state.currentSession.stats.jackpotsWon + (isJackpot ? 1 : 0),
          cryptoEarned: state.currentSession.stats.cryptoEarned + (cryptoEarned || 0)
        }
      };
      
      return {
        ...state,
        isSpinning: false,
        spinResult,
        winAmount,
        isWin,
        isJackpot,
        paylines,
        multiplier,
        cryptoEarned,
        currentSession: updatedSession,
        autoSpin: {
          ...state.autoSpin,
          remaining: state.autoSpin.active ? state.autoSpin.remaining - 1 : 0,
          active: state.autoSpin.active && 
                  state.autoSpin.remaining > 1 && 
                  !(isJackpot && state.autoSpin.settings.stopOnJackpot) &&
                  !(isWin && winAmount >= state.autoSpin.settings.bigWinThreshold && state.autoSpin.settings.stopOnBigWin)
        }
      };
    
    case SPIN_FAILURE:
      return {
        ...state,
        isSpinning: false,
        error: action.payload,
        autoSpin: {
          ...state.autoSpin,
          active: false
        }
      };
    
    case AUTO_SPIN_START:
      return {
        ...state,
        autoSpin: {
          active: true,
          remaining: action.payload.spins,
          settings: {
            stopOnJackpot: action.payload.stopOnJackpot,
            stopOnBigWin: action.payload.stopOnBigWin,
            bigWinThreshold: action.payload.bigWinThreshold
          }
        }
      };
    
    case AUTO_SPIN_STOP:
      return {
        ...state,
        autoSpin: {
          ...state.autoSpin,
          active: false
        }
      };
    
    case SET_BET_AMOUNT:
      return {
        ...state,
        betAmount: action.payload
      };
    
    case CLAIM_DAILY_BONUS_SUCCESS:
      return {
        ...state,
        dailyBonus: {
          lastClaimed: action.payload.lastClaimed,
          streak: action.payload.streak,
          nextAvailable: action.payload.nextBonusAvailable
        }
      };
    
    case GAME_SESSION_START:
      return {
        ...state,
        currentSession: {
          id: action.payload.id,
          isActive: true,
          startTime: action.payload.startTime,
          endTime: null,
          stats: {
            totalSpins: 0,
            totalWins: 0,
            totalLosses: 0,
            totalBet: 0,
            totalWinnings: 0,
            netProfit: 0,
            biggestWin: 0,
            jackpotsWon: 0,
            cryptoEarned: 0
          }
        }
      };
    
    case GAME_SESSION_END:
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          isActive: false,
          endTime: action.payload.endTime
        },
        autoSpin: {
          ...state.autoSpin,
          active: false
        }
      };
    
    case UPDATE_GAME_STATS:
      return {
        ...state,
        gameStats: {
          ...state.gameStats,
          ...action.payload
        }
      };
    
    case ACHIEVEMENT_UNLOCKED:
      return {
        ...state,
        recentAchievements: [
          ...state.recentAchievements,
          action.payload
        ]
      };
    
    case RESET_GAME_STATE:
      return {
        ...initialState,
        gameStats: state.gameStats,
        dailyBonus: state.dailyBonus
      };
    
    default:
      return state;
  }
};

export default gameReducer;