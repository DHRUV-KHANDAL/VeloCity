/**
 * Application Constants and Configuration
 * Centralized constants for consistent usage across the application
 */

// User roles and permissions
export const USER_ROLES = {
  RIDER: 'rider',
  DRIVER: 'driver',
  ADMIN: 'admin',
  ALL: ['rider', 'driver', 'admin']
};

// Ride status flow
export const RIDE_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVED: 'driver_arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ALL: ['requested', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled']
};

// Vehicle types with pricing
export const VEHICLE_TYPES = {
  BIKE: 'bike',
  AUTO: 'auto',
  CAR: 'car',
  SUV: 'suv',
  PREMIUM: 'premium',
  ALL: ['bike', 'auto', 'car', 'suv', 'premium']
};

// Pricing configuration (in USD)
export const PRICING = {
  BASE_FARE: 2.5,
  PER_KM_RATES: {
    bike: 0.8,
    auto: 1.2,
    car: 1.5,
    suv: 2.0,
    premium: 3.0
  },
  PER_MINUTE_RATE: 0.3,
  MINIMUM_FARE: 5.0,
  SURGE_MULTIPLIER: {
    LOW: 1.0,
    MEDIUM: 1.5,
    HIGH: 2.0
  }
};

// Payment methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  CASH: 'cash',
  WALLET: 'wallet',
  UPI: 'upi',
  ALL: ['card', 'cash', 'wallet', 'upi']
};

// JWT configuration
export const JWT_CONFIG = {
  SECRET_KEY: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  EXPIRES_IN: '7d',
  ALGORITHM: 'HS256'
};

// Error messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists with this email',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_INVALID: 'Invalid or expired token',
  
  // Ride
  RIDE_NOT_FOUND: 'Ride not found',
  NO_DRIVERS_AVAILABLE: 'No drivers available at this time',
  RIDE_CANNOT_BE_CANCELLED: 'Ride cannot be cancelled at this stage',
  
  // Driver
  DRIVER_NOT_FOUND: 'Driver profile not found',
  DRIVER_OFFLINE: 'Driver is currently offline',
  
  // Payment
  PAYMENT_FAILED: 'Payment processing failed',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  
  // Validation
  VALIDATION_ERROR: 'Validation failed',
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please provide a valid email',
  INVALID_PHONE: 'Please provide a valid phone number'
};

// Success messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  RIDE_REQUESTED: 'Ride requested successfully',
  RIDE_ACCEPTED: 'Ride accepted successfully',
  RIDE_COMPLETED: 'Ride completed successfully',
  PAYMENT_SUCCESS: 'Payment successful',
  LOCATION_UPDATED: 'Location updated successfully'
};

// Application limits
export const LIMITS = {
  MAX_RIDE_DISTANCE_KM: 50,
  MAX_RIDE_DURATION_MINUTES: 180,
  MAX_RADIUS_KM: 20,
  MAX_RETRY_ATTEMPTS: 3,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100
};

// Socket events
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // User events
  USER_CONNECTED: 'user_connected',
  
  // Driver events
  DRIVER_ONLINE: 'driver_online',
  DRIVER_OFFLINE: 'driver_offline',
  DRIVER_LOCATION_UPDATE: 'driver_location_update',
  
  // Ride events
  NEW_RIDE_REQUEST: 'new_ride_request',
  RIDE_ACCEPTED: 'ride_accepted',
  RIDE_STATUS_CHANGED: 'ride_status_changed',
  RIDE_CANCELLED: 'ride_cancelled',
  
  // Location tracking
  LOCATION_UPDATE: 'location_update',
  DRIVER_LOCATION_CHANGED: 'driver_location_changed',
  
  // Notification events
  NEW_NOTIFICATION: 'new_notification'
};

// API response codes
export const RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

// Database constants
export const DB_CONFIG = {
  POOL_SIZE: 10,
  CONNECTION_TIMEOUT: 5000,
  SOCKET_TIMEOUT: 45000
};

export default {
  USER_ROLES,
  RIDE_STATUS,
  VEHICLE_TYPES,
  PRICING,
  PAYMENT_METHODS,
  JWT_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LIMITS,
  SOCKET_EVENTS,
  RESPONSE_CODES,
  DB_CONFIG
};