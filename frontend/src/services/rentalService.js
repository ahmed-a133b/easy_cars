// frontend/src/services/rentalService.js
import api from './api';

export const createRentalRequest = async (rentalData) => {
  return await api.post('/rentals', rentalData);
};

export const fetchUserRentals = async () => {
  return await api.get('/rentals/user');
};

export const fetchRentalById = async (id) => {
  return await api.get(`/rentals/${id}`);
};

export const cancelRental = async (id) => {
  return await api.put(`/rentals/${id}/cancel`);
};
