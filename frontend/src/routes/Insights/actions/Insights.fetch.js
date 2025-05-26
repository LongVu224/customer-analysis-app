import { insightsServiceInstance } from '../../../components/axios/axios';

export const insightsFetchSuccess = (response) => {
  return {
    type: 'FETCH_INSIGHTS_SUCCESS',
    response: response
  };
};

export const insightsFetchFail = (error) => {
  return {
    type: 'FETCH_INSIGHTS_FAIL',
    error: error
  };
};

export const insightsFetchStart = () => {
    return {
      type: 'FETCH_INSIGHTS_START'
    }
};

export const fetchInsights = () => {
  return dispatch => {
    dispatch(insightsFetchStart());
    insightsServiceInstance.get('insights')
    .then(response => {
      console.log("res: ", response)
      if (response.status === 201) {
        dispatch(insightsFetchSuccess(response));
      } else {
        dispatch(insightsFetchFail(new Error('Unexpected response status')));
      }
    })
    .catch(err => {
      dispatch(insightsFetchFail(err));
    });
  }
};