// Backend/src/middleware/validation.js
import { body, validationResult } from 'express-validator';
import ErrorResponse from '../utils/errorResponse.js';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    if (errors.length > 0) {
      const error = new ErrorResponse('Validation error', 400);
      return next(error);
    }
  };
};

export const rideRequestValidation = [
  body('pickupLocation')
    .exists()
    .withMessage('Pickup location is required')
    .isObject()
    .withMessage('Pickup location must be an object')
    .custom((value) => {
      if (!value.address || !value.coordinates) {
        throw new Error('Pickup location must have address and coordinates');
      }
      return true;
    }),
  
  body('dropoffLocation')
    .exists()
    .withMessage('Dropoff location is required')
    .isObject()
    .withMessage('Dropoff location must be an object')
    .custom((value) => {
      if (!value.address || !value.coordinates) {
        throw new Error('Dropoff location must have address and coordinates');
      }
      return true;
    }),
  
  body('vehicleType')
    .optional()
    .isIn(['standard', 'premium', 'suv', 'bike', 'auto'])
    .withMessage('Invalid vehicle type'),
];

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['rider', 'driver'])
    .withMessage('Role must be either rider or driver'),
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const sanitizeInput = (req, res, next) => {
  if (req.body.name) req.body.name = req.body.name.trim();
  if (req.body.email) req.body.email = req.body.email.trim().toLowerCase();
  if (req.body.phone) req.body.phone = req.body.phone.trim();
  next();
};
// middleware/validation.js
export const adminOnly = (req, res, next) => {
  // Your admin-only validation logic here
  next();
};