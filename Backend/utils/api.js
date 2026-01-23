// src/utils/api.js
import axios from 'axios';
import { API_BASE_URL } from './constants.js';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      });
    }

    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        break;
        
      case 403:
        console.error('Forbidden:', data);
        break;
        
      case 404:
        console.error('Not found:', data);
        break;
        
      case 500:
        console.error('Server error:', data);
        break;
        
      default:
        console.error('API error:', error);
    }
    
    return Promise.reject({
      message: data?.error || 'An error occurred',
      code: status,
      details: data
    });
  }
);

export const apiService = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  getProfile: () => 
    api.get('/auth/me'),
  
  requestRide: (rideData) => 
    api.post('/rides/request', rideData),
  
  getRide: (rideId) => 
    api.get(`/rides/${rideId}`),
  
  getRideHistory: (type = 'all', page = 1, limit = 10) => 
    api.get(`/rides/history/${type}?page=${page}&limit=${limit}`),
  
  cancelRide: (rideId) => 
    api.post(`/rides/${rideId}/cancel`),
  
  rateRide: (rideId, rating, comment) => 
    api.post(`/rides/${rideId}/rate`, { rating, comment }),
  
  getDriverDashboard: () => 
    api.get('/driver/dashboard'),
  
  updateDriverStatus: (isOnline) => 
    api.patch('/driver/status', { isOnline }),
  
  getAvailableRides: () => 
    api.get('/driver/rides/available'),
  
  createPayment: (paymentData) => 
    api.post('/payments/create', paymentData),
  
  verifyPayment: (paymentData) => 
    api.post('/payments/verify', paymentData),
  
  getPaymentHistory: (page = 1, limit = 10) => 
    api.get(`/payments/history?page=${page}&limit=${limit}`),
  
  request: (method, url, data = null) => {
    const config = {
      method,
      url,
      ...(data && { data })
    };
    return api(config);
  }
};

export { api };
export default apiService;