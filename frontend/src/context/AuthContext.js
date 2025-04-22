// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          api.setAuthToken(token);
          const response = await api.get('/auth/profile');
          setUser(response.data);
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken } = response.data;
      
      localStorage.setItem('token', newToken);
      api.setAuthToken(newToken);
      setToken(newToken);
      setUser(response.data);
      navigate('/');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken } = response.data;
      
      localStorage.setItem('token', newToken);
      api.setAuthToken(newToken);
      setToken(newToken);
      setUser(response.data);
      navigate('/');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    api.setAuthToken(null);
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('/auth/profile', userData);
      setUser(response.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isDealer: user?.role === 'dealer' || user?.role === 'admin',
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};