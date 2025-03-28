// Action Types
export const FETCH_MACHINES_START = 'FETCH_MACHINES_START';
export const FETCH_MACHINES_SUCCESS = 'FETCH_MACHINES_SUCCESS';
export const FETCH_MACHINES_FAILURE = 'FETCH_MACHINES_FAILURE';
export const FETCH_MACHINE_DETAILS_SUCCESS = 'FETCH_MACHINE_DETAILS_SUCCESS';
export const SELECT_MACHINE = 'SELECT_MACHINE';
export const PURCHASE_MACHINE_SUCCESS = 'PURCHASE_MACHINE_SUCCESS';
export const UPGRADE_MACHINE_SUCCESS = 'UPGRADE_MACHINE_SUCCESS';
export const UPDATE_MACHINE_STATS = 'UPDATE_MACHINE_STATS';
export const RESET_MACHINE_ERROR = 'RESET_MACHINE_ERROR';

// Initial State
const initialState = {
  machines: [],
  selectedMachine: null,
  machineDetails: null,
  loading: false,
  error: null
};

// Reducer
const machineReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MACHINES_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FETCH_MACHINES_SUCCESS:
      // If no machine is selected yet, select the first one
      const selectedMachine = state.selectedMachine || 
                             (action.payload.length > 0 ? action.payload[0]._id : null);
      
      return {
        ...state,
        machines: action.payload,
        selectedMachine,
        loading: false
      };
    
    case FETCH_MACHINES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case FETCH_MACHINE_DETAILS_SUCCESS:
      return {
        ...state,
        machineDetails: action.payload,
        loading: false
      };
    
    case SELECT_MACHINE:
      return {
        ...state,
        selectedMachine: action.payload,
        machineDetails: null // Clear details when selecting a new machine
      };
    
    case PURCHASE_MACHINE_SUCCESS:
      return {
        ...state,
        machines: [...state.machines, action.payload],
        selectedMachine: action.payload._id,
        loading: false
      };
    
    case UPGRADE_MACHINE_SUCCESS:
      // Update the machine in the machines array
      const updatedMachines = state.machines.map(machine => 
        machine._id === action.payload._id ? action.payload : machine
      );
      
      return {
        ...state,
        machines: updatedMachines,
        machineDetails: state.machineDetails && state.machineDetails._id === action.payload._id ? 
                       action.payload : state.machineDetails,
        loading: false
      };
    
    case UPDATE_MACHINE_STATS:
      // Update machine stats after gameplay
      const { machineId, stats } = action.payload;
      
      // Update the machine in the machines array
      const machinesWithUpdatedStats = state.machines.map(machine => 
        machine._id === machineId ? 
        {
          ...machine,
          stats: {
            ...machine.stats,
            ...stats
          }
        } : machine
      );
      
      // Update machine details if it's the current machine
      const updatedMachineDetails = state.machineDetails && state.machineDetails._id === machineId ? 
        {
          ...state.machineDetails,
          stats: {
            ...state.machineDetails.stats,
            ...stats
          }
        } : state.machineDetails;
      
      return {
        ...state,
        machines: machinesWithUpdatedStats,
        machineDetails: updatedMachineDetails
      };
    
    case RESET_MACHINE_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

export default machineReducer;