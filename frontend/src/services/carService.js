// frontend/src/services/carService.js
import api from './api';

export const fetchCars = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  return await api.get(`/cars?${params.toString()}`);
};

export const fetchCarById = async (id) => {
  return await api.get(`/cars/${id}`);
};

export const createCar = async (carData) => {
  return await api.post('/cars', carData);
};

export const updateCar = async (id, carData) => {
  return await api.put(`/cars/${id}`, carData);
};

export const deleteCar = async (id) => {
  return await api.delete(`/cars/${id}`);
};