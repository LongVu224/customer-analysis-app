import axios from 'axios';

const uploadServiceInstance = axios.create({
   baseURL: process.env.REACT_APP_UPLOAD_SERVICE_ENDPOINT
});

const insightsServiceInstance = axios.create({
  baseURL: process.env.REACT_APP_INSIGHTS_SERVICE_ENDPOINT
});

const monitorServiceInstance = axios.create({
  baseURL: process.env.REACT_APP_MONITOR_SERVICE_ENDPOINT
});

export { 
  uploadServiceInstance, 
  insightsServiceInstance,
  monitorServiceInstance 
};