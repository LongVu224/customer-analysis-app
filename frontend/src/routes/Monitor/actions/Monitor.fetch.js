import { monitorServiceInstance } from '../../../components/axios/axios';

export const processLogsFetchSuccess = (response) => {
  return {
    type: 'FETCH_PROCESS_LOGS_SUCCESS',
    response: response
  };
};

export const processLogsFetchFail = (error) => {
  return {
    type: 'FETCH_PROCESS_LOGS_FAIL',
    error: error
  };
};

export const processLogsFetchStart = () => {
    return {
      type: 'FETCH_PROCESS_LOGS_START'
    }
};

export const fetchProcessLogs = (serviceName) => {
  return dispatch => {
    dispatch(processLogsFetchStart());
    monitorServiceInstance.get(`monitor/service/${serviceName}`)
    .then(response => {
      console.log("res: ", response)
      if (response.status === 200) {
        dispatch(processLogsFetchSuccess(response));
      } else {
        dispatch(processLogsFetchFail(new Error('Unexpected response status')));
      }
    })
    .catch(err => {
      dispatch(processLogsFetchFail(err));
    });
  }
};