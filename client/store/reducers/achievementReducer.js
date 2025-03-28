// Action Types
export const FETCH_ACHIEVEMENTS_START = 'FETCH_ACHIEVEMENTS_START';
export const FETCH_ACHIEVEMENTS_SUCCESS = 'FETCH_ACHIEVEMENTS_SUCCESS';
export const FETCH_ACHIEVEMENTS_FAILURE = 'FETCH_ACHIEVEMENTS_FAILURE';
export const FETCH_USER_ACHIEVEMENTS_SUCCESS = 'FETCH_USER_ACHIEVEMENTS_SUCCESS';
export const ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED';
export const CLEAR_NEW_ACHIEVEMENTS = 'CLEAR_NEW_ACHIEVEMENTS';
export const RESET_ACHIEVEMENT_ERROR = 'RESET_ACHIEVEMENT_ERROR';

// Initial State
const initialState = {
  achievements: [],  // All available achievements
  userAchievements: [],  // User's unlocked achievements
  newAchievements: [],  // Recently unlocked achievements
  loading: false,
  error: null
};

// Reducer
const achievementReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ACHIEVEMENTS_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FETCH_ACHIEVEMENTS_SUCCESS:
      return {
        ...state,
        achievements: action.payload,
        loading: false
      };
    
    case FETCH_ACHIEVEMENTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case FETCH_USER_ACHIEVEMENTS_SUCCESS:
      return {
        ...state,
        userAchievements: action.payload,
        loading: false
      };
    
    case ACHIEVEMENT_UNLOCKED:
      // Check if achievement is already in userAchievements
      const achievementExists = state.userAchievements.some(
        achievement => achievement.achievementId === action.payload.achievementId
      );
      
      // Only add if it doesn't exist
      const updatedUserAchievements = achievementExists ? 
        state.userAchievements : 
        [...state.userAchievements, action.payload];
      
      // Add to newAchievements if it's not already there
      const newAchievementExists = state.newAchievements.some(
        achievement => achievement.achievementId === action.payload.achievementId
      );
      
      const updatedNewAchievements = newAchievementExists ?
        state.newAchievements :
        [...state.newAchievements, action.payload];
      
      return {
        ...state,
        userAchievements: updatedUserAchievements,
        newAchievements: updatedNewAchievements
      };
    
    case CLEAR_NEW_ACHIEVEMENTS:
      return {
        ...state,
        newAchievements: []
      };
    
    case RESET_ACHIEVEMENT_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

export default achievementReducer;