/**
 * Environment Configuration Validation
 * Ensures all required environment variables are present
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Required environment variables
const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL'
];

// Optional environment variables with defaults
const OPTIONAL_ENV_VARS = {
  PORT: 5000,
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
  REDIS_URL: null,
  SOCKET_PORT: null,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  PAYMENT_GATEWAY_KEY: null,
  PAYMENT_GATEWAY_SECRET: null,
  GOOGLE_MAPS_API_KEY: null,
  STRIPE_SECRET_KEY: null,
  RAZORPAY_KEY_ID: null,
  RAZORPAY_KEY_SECRET: null
};

/**
 * Validate environment variables
 */
function validateEnv() {
  const errors = [];
  
  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      errors.push(`❌ Missing required environment variable: ${envVar}`);
    }
  }
  
  // Set optional variables with defaults
  for (const [envVar, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[envVar] && defaultValue !== null) {
      process.env[envVar] = String(defaultValue);
      console.log(`⚙️  Set default for ${envVar}: ${defaultValue}`);
    }
  }
  
  // Validate JWT secret length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('❌ JWT_SECRET must be at least 32 characters long for security');
  }
  
  // Validate MongoDB URI format
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    errors.push('❌ MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }
  
  // Validate FRONTEND_URL format
  if (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.startsWith('http')) {
    errors.push('❌ FRONTEND_URL must be a valid URL starting with http:// or https://');
  }
  
  // Check environment
  const allowedEnvs = ['development', 'test', 'production'];
  if (!allowedEnvs.includes(process.env.NODE_ENV)) {
    errors.push(`❌ NODE_ENV must be one of: ${allowedEnvs.join(', ')}`);
  }
  
  // Log errors and exit if any
  if (errors.length > 0) {
    console.error('\n🚨 Environment Configuration Errors:');
    errors.forEach(error => console.error(error));
    
    console.error('\n💡 Please check your .env file or environment variables.');
    console.error('   Create a .env file in the Backend directory with:');
    console.error(`
       MONGODB_URI=mongodb://localhost:27017/velocity
       JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
       FRONTEND_URL=http://localhost:3000
       PORT=5000
       NODE_ENV=development
    `);
    
    process.exit(1);
  }
  
  // Log successful validation
  console.log('✅ Environment variables validated successfully');
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚪 Port: ${process.env.PORT}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  
  // Log sensitive info in development only
  if (process.env.NODE_ENV === 'development') {
    console.log(`🗄️  Database: ${process.env.MONGODB_URI?.split('@')[1] || 'Not set'}`);
  }
}

/**
 * Get environment configuration
 */
function getEnvConfig() {
  return {
    // Required
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    
    // Server
    port: parseInt(process.env.PORT, 10),
    nodeEnv: process.env.NODE_ENV,
    
    // Logging
    logLevel: process.env.LOG_LEVEL,
    
    // Rate limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10),
    
    // Payment gateways
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
    
    // External services
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    redisUrl: process.env.REDIS_URL,
    
    // Feature flags
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  };
}

// Auto-validate on import
validateEnv();

export { validateEnv, getEnvConfig };
export default getEnvConfig();