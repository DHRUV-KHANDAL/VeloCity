import { body, validationResult } from "express-validator";
import ErrorResponse from "../utils/errorResponse.js";

// Generic validation middleware
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  };
};

// Ride request validation schema
export const rideRequestValidation = [
  // pickupLocation validation
  body("pickupLocation")
    .exists()
    .withMessage("Pickup location is required")
    .isObject()
    .withMessage("Pickup location must be an object")
    .custom((value) => {
      if (!value.address || !value.coordinates) {
        throw new Error("Pickup location must have address and coordinates");
      }
      return true;
    }),

  // dropoffLocation validation
  body("dropoffLocation")
    .exists()
    .withMessage("Dropoff location is required")
    .isObject()
    .withMessage("Dropoff location must be an object")
    .custom((value) => {
      if (!value.address || !value.coordinates) {
        throw new Error("Dropoff location must have address and coordinates");
      }
      return true;
    }),

  // vehicleType validation
  body("vehicleType")
    .optional()
    .isIn(["standard", "premium", "suv", "bike", "auto"])
    .withMessage(
      "Vehicle type must be one of: standard, premium, suv, bike, auto",
    ),

  // coordinates validation
  body("pickupLocation.coordinates")
    .exists()
    .withMessage("Pickup coordinates are required")
    .custom((value) => {
      if (!value.lat || !value.lng) {
        throw new Error("Coordinates must have lat and lng");
      }
      if (value.lat < -90 || value.lat > 90) {
        throw new Error("Latitude must be between -90 and 90");
      }
      if (value.lng < -180 || value.lng > 180) {
        throw new Error("Longitude must be between -180 and 180");
      }
      return true;
    }),

  body("dropoffLocation.coordinates")
    .exists()
    .withMessage("Dropoff coordinates are required")
    .custom((value) => {
      if (!value.lat || !value.lng) {
        throw new Error("Coordinates must have lat and lng");
      }
      if (value.lat < -90 || value.lat > 90) {
        throw new Error("Latitude must be between -90 and 90");
      }
      if (value.lng < -180 || value.lng > 180) {
        throw new Error("Longitude must be between -180 and 180");
      }
      return true;
    }),
];

// User registration validation
export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["rider", "driver"])
    .withMessage("Role must be either rider or driver"),
];

// Login validation
export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];

// Driver location update validation
export const locationValidation = [
  body("lat")
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  body("lng")
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  body("heading")
    .optional()
    .isFloat({ min: 0, max: 360 })
    .withMessage("Heading must be between 0 and 360"),
];

// Payment validation
export const paymentValidation = [
  body("rideId")
    .notEmpty()
    .withMessage("Ride ID is required")
    .isMongoId()
    .withMessage("Invalid Ride ID format"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 1 })
    .withMessage("Amount must be at least 1"),

  body("paymentMethod")
    .optional()
    .isIn(["card", "cash", "wallet", "upi"])
    .withMessage("Invalid payment method"),
];

// Sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  if (req.body.name) req.body.name = req.body.name.trim();
  if (req.body.email) req.body.email = req.body.email.trim().toLowerCase();
  if (req.body.phone) req.body.phone = req.body.phone.trim();

  next();
};

// Validation error handler middleware (global)
export const validationErrorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: err.errors,
    });
  }
  next(err);
};

/**
 * Middleware to ensure admin-only access
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, error: "Admin access required" });
  }

  next();
};
