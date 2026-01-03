import axios from 'axios';

// Create an axios instance
const api = axios.create({
    // Use environment variable or default to localhost
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor (optional, for global error handling)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized globally if needed (e.g., redirect to login)
        if (error.response && error.response.status === 401) {
            // Optional: dispatch logic to clear local storage if token expired
            // localStorage.removeItem('token');
            // localStorage.removeItem('user');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
