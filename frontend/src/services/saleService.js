// frontend/src/services/saleService.js
import api from './api';

export const createSaleRequest = async (saleData) => {
  return await api.post('/sales', saleData);
};

export const fetchUserSales = async () => {
  return await api.get('/sales/user');
};

export const fetchSaleById = async (id) => {
  return await api.get(`/sales/${id}`);
};