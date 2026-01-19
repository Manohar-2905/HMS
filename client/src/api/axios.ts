import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD
    ? '' // In production, serve from the same domain
    : 'http://localhost:5000'; // In development, point to the local server

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to include the auth token if available
api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
