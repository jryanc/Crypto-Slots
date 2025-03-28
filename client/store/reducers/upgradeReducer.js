// Action Types
export const FETCH_UPGRADES_START = 'FETCH_UPGRADES_START';
export const FETCH_UPGRADES_SUCCESS = 'FETCH_UPGRADES_SUCCESS';
export const FETCH_UPGRADES_FAILURE = 'FETCH_UPGRADES_FAILURE';
export const FETCH_USER_UPGRADES_SUCCESS = 'FETCH_USER_UPGRADES_SUCCESS';
export const FETCH_UPGRADE_DETAILS_SUCCESS = 'FETCH_UPGRADE_DETAILS_SUCCESS';
export const FETCH_MACHINE_UPGRADES_SUCCESS = 'FETCH_MACHINE_UPGRADES_SUCCESS';
export const PURCHASE_UPGRADE_SUCCESS = 'PURCHASE_UPGRADE_SUCCESS';
export const APPLY_UPGRADE_SUCCESS = 'APPLY_UPGRADE_SUCCESS';
export const SELL_UPGRADE_SUCCESS = 'SELL_UPGRADE_SUCCESS';
export const FETCH_UPGRADE_CATEGORIES_SUCCESS = 'FETCH_UPGRADE_CATEGORIES_SUCCESS';
export const FETCH_CATEGORY_UPGRADES_SUCCESS = 'FETCH_CATEGORY_UPGRADES_SUCCESS';
export const RESET_UPGRADE_ERROR = 'RESET_UPGRADE_ERROR';

// Initial State
const initialState = {
  availableUpgrades: [],
  userUpgrades: [],
  machineUpgrades: {},  // Keyed by machine ID
  upgradeDetails: null,
  categories: [],
  categoryUpgrades: {},  // Keyed by category ID
  loading: false,
  error: null
};

// Reducer
const upgradeReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_UPGRADES_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FETCH_UPGRADES_SUCCESS:
      return {
        ...state,
        availableUpgrades: action.payload,
        loading: false
      };
    
    case FETCH_UPGRADES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case FETCH_USER_UPGRADES_SUCCESS:
      return {
        ...state,
        userUpgrades: action.payload,
        loading: false
      };
    
    case FETCH_UPGRADE_DETAILS_SUCCESS:
      return {
        ...state,
        upgradeDetails: action.payload,
        loading: false
      };
    
    case FETCH_MACHINE_UPGRADES_SUCCESS:
      return {
        ...state,
        machineUpgrades: {
          ...state.machineUpgrades,
          [action.payload.machineId]: action.payload.upgrades
        },
        loading: false
      };
    
    case PURCHASE_UPGRADE_SUCCESS:
      return {
        ...state,
        userUpgrades: [...state.userUpgrades, action.payload],
        loading: false
      };
    
    case APPLY_UPGRADE_SUCCESS:
      // Update the upgrade in userUpgrades
      const updatedUserUpgrades = state.userUpgrades.map(upgrade => 
        upgrade._id === action.payload.upgradeId ? 
        {
          ...upgrade,
          applied: true,
          appliedTo: action.payload.machineId
        } : upgrade
      );
      
      // Update machineUpgrades if we have them for this machine
      const updatedMachineUpgrades = state.machineUpgrades[action.payload.machineId] ? 
        {
          ...state.machineUpgrades,
          [action.payload.machineId]: [
            ...state.machineUpgrades[action.payload.machineId],
            action.payload.upgrade
          ]
        } : state.machineUpgrades;
      
      return {
        ...state,
        userUpgrades: updatedUserUpgrades,
        machineUpgrades: updatedMachineUpgrades,
        loading: false
      };
    
    case SELL_UPGRADE_SUCCESS:
      // Remove the upgrade from userUpgrades
      const filteredUserUpgrades = state.userUpgrades.filter(
        upgrade => upgrade._id !== action.payload.upgradeId
      );
      
      return {
        ...state,
        userUpgrades: filteredUserUpgrades,
        loading: false
      };
    
    case FETCH_UPGRADE_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: action.payload,
        loading: false
      };
    
    case FETCH_CATEGORY_UPGRADES_SUCCESS:
      return {
        ...state,
        categoryUpgrades: {
          ...state.categoryUpgrades,
          [action.payload.categoryId]: action.payload.upgrades
        },
        loading: false
      };
    
    case RESET_UPGRADE_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

export default upgradeReducer;