const initialState = {
  insights: [],
  salesData: [],
  loading: true
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_INSIGHTS_START':
      return {
        loading: true
      }
    case 'FETCH_INSIGHTS_SUCCESS':
      return {
        ...state,
        insights: action.response.data.insights,
        loading: false
      }
    case 'FETCH_INSIGHTS_FAIL':
      return {
        loading: false,
      }
    case 'FETCH_SALES_DATA_START':
      return {
        loading: true
      }
    case 'FETCH_SALES_DATA_SUCCESS':
      return {
        ...state,
        salesData: action.response.data.sales,
        loading: false
      }
    case 'FETCH_SALES_DATA_FAIL':
      return {
        loading: false,
      }
    default: 
      return state;
  }
};

export default reducer;