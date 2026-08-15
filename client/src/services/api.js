import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT Bearer token into headers
API.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem('expenses_user');
    if (userJson) {
      try {
        const { token } = JSON.parse(userJson);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Failed to parse user session token:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration (401)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('expenses_user')) {
        localStorage.removeItem('expenses_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
