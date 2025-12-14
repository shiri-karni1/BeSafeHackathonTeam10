import axios from 'axios';

// Create an instance of Axios with default configurations
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
