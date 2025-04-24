// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://easycar-4a65991d3f5e.herokuapp.com/api',
  headers: {
    'Content-Type': 'application/json'
  },
    withCredentials: true 
});

export default api;







