const initialState = {
  processLogs: [],
  loading: false
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
        processLogs: action.response.data.logs,
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