import axios from 'axios';

const uploadServiceInstance = axios.create({
  baseURL: "http://localhost:8000"
});

const insightsServiceInstance = axios.create({
  baseURL: "http://localhost:9000"
});

const monitorServiceInstance = axios.create({
  baseURL: "http://localhost:8999"
});

export { 
  uploadServiceInstance, 
  insightsServiceInstance,
  monitorServiceInstance 
};