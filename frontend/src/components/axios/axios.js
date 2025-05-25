import axios from 'axios';

//Availability base url
const uploadServiceInstance = axios.create({
    baseURL: process.env.REACT_APP_UPLOAD_SERVICE_ENDPOINT
});

const insightsServiceInstance = axios.create({
    baseURL: process.env.REACT_APP_INSIGHTS_SERVICE_ENDPOINT
});

export { uploadServiceInstance, insightsServiceInstance };