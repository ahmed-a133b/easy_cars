// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://easycars-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json'
  },
    withCredentials: true 
});

export default api;







