// src/utils/constants.js

// API URLs
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

// User Roles
export const USER_ROLES = {
  RIDER: 'rider',
  DRIVER: 'driver',
  ADMIN: 'admin'
};

// Ride Status
export const RIDE_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVED: 'driver_arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Vehicle Types
export const VEHICLE_TYPES = {
  CAR: 'car',
  BIKE: 'bike',
  AUTO: 'auto'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  CASH: 'cash',
  WALLET: 'wallet',
  UPI: 'upi',
  ALL: ['card', 'cash', 'wallet', 'upi']
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  RIDE_NOT_FOUND: 'Ride not found',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  RIDE_CANNOT_BE_CANCELLED: 'Ride cannot be cancelled at this stage'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  RIDE_REQUESTED: 'Ride requested successfully',
  PAYMENT_SUCCESS: 'Payment successful'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 10,
  MAX_RETRIES: 3,
  TIMEOUT: 30000
};

export default {
  API_BASE_URL,
  WS_URL,
  USER_ROLES,
  RIDE_STATUS,
  VEHICLE_TYPES,
  PAYMENT_METHODS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  DEFAULTS
};