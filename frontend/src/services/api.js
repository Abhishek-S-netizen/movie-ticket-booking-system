// Placeholder for Axios API Instance
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Unwrap { success, data } envelope (skip auth responses)
api.interceptors.response.use((response) => {
    const d = response.data;
    if (d && d.success !== undefined && d.data !== undefined) {
        response.data = d.data;
    }
    return response;
});

export default api;
