const initialState = {
  processLogs: [],
  loading: true
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_PROCESS_LOGS_START':
      return {
        loading: true
      }
    case 'FETCH_PROCESS_LOGS_SUCCESS':
      return {
        ...state,
        PROCESS_LOG: action.response.data.processLogs,
        loading: false
      }
    case 'FETCH_PROCESS_LOGS_FAIL':
      return {
        loading: false,
      }
    default: 
      return state;
  }
};

export default reducer;