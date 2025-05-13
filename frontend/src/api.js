// src/api.js
import axios from 'axios';

// Create axios instance with proper configuration for cookies
const api = axios.create({
  baseURL: 'https://easycars-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // This is critical for cookies to be sent/received
});

// Log configuration for debugging
console.log('API client configured with withCredentials:', api.defaults.withCredentials);

// Request interceptor to include authorization token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log cookies in response if any
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      console.log('Received cookies:', cookies);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an expired token (401) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token or redirect to login
        // You can implement a refresh token mechanism here if your backend supports it
        
        // For now, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;







