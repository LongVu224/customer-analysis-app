import axios from 'axios';

const uploadServiceInstance = axios.create({
  baseURL: process.env.REACT_APP_UPLOAD_SERVICE_ENDPOINT || "http://localhost:8000"
});

const insightsServiceInstance = axios.create({
  baseURL: process.env.REACT_APP_INSIGHTS_SERVICE_ENDPOINT || "http://localhost:9000"
});

const monitorServiceInstance = axios.create({
  baseURL: process.env.REACT_APP_MONITOR_SERVICE_ENDPOINT || "http://localhost:8999"
});

export { 
  uploadServiceInstance, 
  insightsServiceInstance,
  monitorServiceInstance 
};