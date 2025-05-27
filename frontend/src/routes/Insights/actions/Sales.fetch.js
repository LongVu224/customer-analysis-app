import { uploadServiceInstance } from '../../../components/axios/axios';

export const salesDataFetchSuccess = (response) => {
  return {
    type: 'FETCH_SALES_DATA_SUCCESS',
    response: response
  };
};

export const salesDataFetchFail = (error) => {
  return {
    type: 'FETCH_SALES_DATA_FAIL',
    error: error
  };
};

export const salesDataFetchStart = () => {
    return {
      type: 'FETCH_SALES_DATA_START'
    }
};

export const fetchSalesData = () => {
  return dispatch => {
    dispatch(salesDataFetchStart());
    uploadServiceInstance.get('upload')
    .then(response => {
      if (response.status === 200) {
        dispatch(salesDataFetchSuccess(response));
      } else {
        dispatch(salesDataFetchFail(new Error('Unexpected response status')));
      }
    })
    .catch(err => {
      dispatch(salesDataFetchFail(err));
    });
  }
};