/**
 * Utility Functions
 * Common helper functions used across the application
 */

import { VEHICLE_TYPES, PRICING, USER_ROLES } from '../config/constants.js';

/**
 * Generate a unique ID
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}_${random}`;
}

/**
 * Generate a ride ID
 */
export function generateRideId() {
  return generateId('ride_');
}

/**
 * Generate a payment ID
 */
export function generatePaymentId() {
  return generateId('pay_');
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date, format = 'medium') {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const options = {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    medium: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

/**
 * Convert degrees to radians
 */
function toRad(degrees) {
  return degrees * (Math.PI/180);
}

/**
 * Calculate estimated fare
 */
export function calculateFare(distance, duration, vehicleType = 'car') {
  const baseFare = PRICING.BASE_FARE;
  const perKmRate = PRICING.PER_KM_RATES[vehicleType] || PRICING.PER_KM_RATES.car;
  const perMinuteRate = PRICING.PER_MINUTE_RATE;
  
  const distanceFare = distance * perKmRate;
  const timeFare = duration * perMinuteRate;
  
  let total = baseFare + distanceFare + timeFare;
  total = Math.max(total, PRICING.MINIMUM_FARE);
  
  return {
    baseFare,
    distanceFare: parseFloat(distanceFare.toFixed(2)),
    timeFare: parseFloat(timeFare.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    distance,
    duration
  };
}

/**
 * Validate email
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone) {
  // Basic validation - accepts international format
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[&<>"']/g, '') // Remove special characters
    .substring(0, 1000); // Limit length
}

/**
 * Generate random OTP
 */
export function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
}

/**
 * Format vehicle type for display
 */
export function formatVehicleType(type) {
  const typeMap = {
    bike: 'Bike',
    auto: 'Auto',
    car: 'Car',
    suv: 'SUV',
    premium: 'Premium'
  };
  
  return typeMap[type] || 'Car';
}

/**
 * Get vehicle icon
 */
export function getVehicleIcon(type) {
  const iconMap = {
    bike: '🏍️',
    auto: '🛺',
    car: '🚗',
    suv: '🚙',
    premium: '⭐'
  };
  
  return iconMap[type] || '🚗';
}

/**
 * Calculate ETA (Estimated Time of Arrival)
 */
export function calculateETA(distance, trafficFactor = 1) {
  const averageSpeed = 30; // km/h
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = timeInHours * 60 * trafficFactor;
  
  return Math.ceil(timeInMinutes);
}

/**
 * Format duration for display
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Format distance for display
 */
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  
  return `${km.toFixed(1)} km`;
}

/**
 * Check if user has required role
 */
export function hasRole(user, requiredRole) {
  if (!user || !user.role) return false;
  
  if (requiredRole === 'any') return true;
  if (requiredRole === 'admin' && user.role === USER_ROLES.ADMIN) return true;
  if (requiredRole === 'driver' && user.role === USER_ROLES.DRIVER) return true;
  if (requiredRole === 'rider' && user.role === USER_ROLES.RIDER) return true;
  
  return false;
}

/**
 * Generate pagination metadata
 */
export function generatePagination(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    totalPages,
    currentPage: page,
    limit,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects deeply
 */
export function deepMerge(target, source) {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Generate random coordinates within radius
 */
export function generateRandomCoordinates(centerLat, centerLng, radiusKm) {
  const radiusInDegrees = radiusKm / 111; // 1 degree ≈ 111 km
  
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  
  const newLat = centerLat + y;
  const newLng = centerLng + x / Math.cos(centerLat * Math.PI / 180);
  
  return {
    lat: parseFloat(newLat.toFixed(6)),
    lng: parseFloat(newLng.toFixed(6))
  };
}

/**
 * Mask sensitive data
 */
export function maskData(data, type = 'email') {
  if (!data) return '';
  
  switch (type) {
    case 'email':
      const [local, domain] = data.split('@');
      if (local.length <= 2) return data;
      return `${local.substring(0, 2)}***@${domain}`;
    
    case 'phone':
      return data.replace(/\d(?=\d{4})/g, '*');
    
    case 'creditCard':
      return `**** **** **** ${data.slice(-4)}`;
    
    default:
      return data;
  }
}

export default {
  generateId,
  generateRideId,
  generatePaymentId,
  formatCurrency,
  formatDate,
  calculateDistance,
  calculateFare,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  sanitizeInput,
  generateOTP,
  formatVehicleType,
  getVehicleIcon,
  calculateETA,
  formatDuration,
  formatDistance,
  hasRole,
  generatePagination,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  generateRandomCoordinates,
  maskData
};