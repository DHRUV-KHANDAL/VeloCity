import express from "express";
import auth from "../middleware/auth.js";
import rideController from "../controllers/rideController.js";
import { validate, rideRequestValidation } from "../middleware/validation.js";

const router = express.Router();

// Request a new ride
router.post(
  "/request",
  auth,
  validate(rideRequestValidation),
  rideController.requestRide,
);

// Get ride by ID
router.get("/:id", auth, rideController.getRide);

// Get available rides for driver
router.get("/available/list", auth, rideController.getAvailableRides);

// Accept ride (driver accepts ride request)
router.post("/:id/accept", auth, rideController.acceptRide);

// Driver arrived at pickup location
router.post("/:id/arrived", auth, rideController.arrivedAtPickup);

// Start ride (generate OTP for rider)
router.post("/:id/start", auth, rideController.startRide);

// Verify OTP and begin ride
router.post("/:id/verify-otp", auth, rideController.verifyOTP);

// Complete a ride
router.post("/:id/complete", auth, rideController.completeRide);

// Update ride location (for tracking)
router.post("/:id/location", auth, rideController.updateLocation);

// Cancel a ride with reason
router.post("/:id/cancel", auth, rideController.cancelRideWithReason);

// Rate a ride and other user
router.post("/:id/rate", auth, rideController.rateRide);

// Get ride history (all, active, completed, cancelled)
router.get("/history/all", auth, rideController.getRideHistory);

export default router;
