/**
 * Ride Controller
 * Handles HTTP requests for ride operations
 */

import rideService from "../services/rideService.js";
import otpService from "../services/otpService.js";
import locationService from "../services/locationService.js";
import notificationService from "../services/notificationService.js";
import rideMatchingService from "../services/rideMatchingService.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../config/constants.js";
import Ride from "../models/Ride.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

class RideController {
  /**
   * Accept a ride (driver accepts ride request)
   */
  async acceptRide(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Check if user is a driver
      if (userRole !== "driver") {
        return res.status(403).json({
          success: false,
          error: "Only drivers can accept rides",
        });
      }

      const result = await rideService.acceptRide(id, userId);
      res.json(result);
    } catch (error) {
      console.error("❌ Accept ride error:", error);

      if (error.message.includes("Ride or driver not found")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message.includes("not in requested state")) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }

  /**
   * Verify OTP and start ride
   */
  async verifyOTP(req, res) {
    try {
      const { rideId } = req.params;
      const { otp, verifiedBy = "driver" } = req.body;
      const userId = req.user._id;

      // Validate OTP
      const isValid = await otpService.verifyOTP(
        userId.toString(),
        otp,
        rideId,
      );

      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: "Invalid or expired OTP",
        });
      }

      // Update ride to in_progress status
      const ride = await Ride.findByIdAndUpdate(
        rideId,
        {
          status: "in_progress",
          "otp.verified": true,
          "otp.verifiedAt": new Date(),
          "otp.verifiedBy": verifiedBy,
          startedAt: new Date(),
        },
        { new: true },
      ).populate("rider driver");

      if (!ride) {
        return res.status(404).json({
          success: false,
          error: "Ride not found",
        });
      }

      logger.info(`Ride ${rideId} started after OTP verification`);

      res.json({
        success: true,
        message: "OTP verified. Ride started.",
        data: {
          rideId: ride._id,
          status: ride.status,
          startedAt: ride.startedAt,
        },
      });
    } catch (error) {
      logger.error("Error verifying OTP:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error",
      });
    }
  }

  /**
   * Start ride - Driver arrived and rider got in
   */
  async startRide(req, res) {
    try {
      const { rideId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      if (userRole !== "driver") {
        return res.status(403).json({
          success: false,
          error: "Only drivers can start rides",
        });
      }

      const ride = await Ride.findById(rideId).populate("rider driver");

      if (!ride) {
        return res.status(404).json({
          success: false,
          error: "Ride not found",
        });
      }

      if (ride.driver._id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          error: "Only assigned driver can start this ride",
        });
      }

      if (ride.status !== "otp_pending" && ride.status !== "accepted") {
        return res.status(400).json({
          success: false,
          error: `Ride cannot be started from ${ride.status} status`,
        });
      }

      // Generate and send OTP
      const phone = ride.rider.phone;
      await otpService.createOTP(phone, rideId);
      await notificationService.sendOTPNotification(ride.rider, "****", null);

      // Update ride status
      ride.status = "otp_pending";
      await ride.save();

      logger.info(`OTP sent for ride ${rideId}`);

      res.json({
        success: true,
        message: "OTP sent to rider",
        data: {
          rideId: ride._id,
          status: ride.status,
        },
      });
    } catch (error) {
      logger.error("Error starting ride:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error",
      });
    }
  }

  /**
   * Driver arrived at pickup location
   */
  async arrivedAtPickup(req, res) {
    try {
      const { rideId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      if (userRole !== "driver") {
        return res.status(403).json({
          success: false,
          error: "Only drivers can mark arrival",
        });
      }

      const ride = await Ride.findById(rideId).populate("rider driver");

      if (!ride || ride.driver._id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          error: "Ride not found or unauthorized",
        });
      }

      if (ride.status !== "accepted") {
        return res.status(400).json({
          success: false,
          error: `Cannot mark arrival for ride in ${ride.status} status`,
        });
      }

      ride.status = "driver_arrived";
      ride.arrivedAt = new Date();
      await ride.save();

      // Notify rider
      await notificationService.sendDriverArrivedNotification(
        ride.rider,
        ride.driver,
        ride,
        null,
      );

      logger.info(`Driver arrived at pickup for ride ${rideId}`);

      res.json({
        success: true,
        message: "Driver arrival marked",
        data: {
          rideId: ride._id,
          status: ride.status,
          arrivedAt: ride.arrivedAt,
        },
      });
    } catch (error) {
      logger.error("Error marking driver arrival:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error",
      });
    }
  }

  /**
   * Complete a ride
   */
  async completeRide(req, res) {
    try {
      const { rideId } = req.params;
      const { actualDuration, endLocationLat, endLocationLng } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;

      if (userRole !== "driver") {
        return res.status(403).json({
          success: false,
          error: "Only drivers can complete rides",
        });
      }

      const ride = await Ride.findById(rideId).populate("rider driver");

      if (!ride || ride.driver._id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          error: "Ride not found or unauthorized",
        });
      }

      if (!["in_progress", "driver_arrived"].includes(ride.status)) {
        return res.status(400).json({
          success: false,
          error: `Ride cannot be completed from ${ride.status} status`,
        });
      }

      // Calculate actual fare
      const distance = locationService.calculateDistance(
        ride.pickupLocation.coordinates.lat,
        ride.pickupLocation.coordinates.lng,
        endLocationLat,
        endLocationLng,
      );

      const actualFare = locationService.calculateFare(
        distance,
        actualDuration,
        ride.rideType,
        1, // Normal multiplier (no surge for completed ride)
      );

      // Update ride
      ride.status = "completed";
      ride.completedAt = new Date();
      ride.actualDuration = actualDuration;
      ride.distance = distance;
      ride.fare = {
        ...ride.fare,
        total: actualFare.total,
        distanceFare: actualFare.distanceFare,
        timeFare: actualFare.timeFare,
      };
      ride.paymentStatus = "pending"; // Ready for payment

      await ride.save();

      // Update driver stats
      const driver = await User.findById(ride.driver._id);
      if (driver) {
        driver.totalRides = (driver.totalRides || 0) + 1;
        driver.totalEarnings = (driver.totalEarnings || 0) + actualFare.total;
        driver.completedRides = (driver.completedRides || 0) + 1;
        await driver.save();
      }

      // Notify both parties
      await notificationService.sendRideCompletedNotification(
        ride.rider,
        ride.driver,
        ride,
        null,
      );

      logger.info(`Ride ${rideId} completed. Fare: $${actualFare.total}`);

      res.json({
        success: true,
        message: "Ride completed successfully",
        data: {
          rideId: ride._id,
          status: ride.status,
          completedAt: ride.completedAt,
          fare: actualFare,
          distance,
          actualDuration,
        },
      });
    } catch (error) {
      logger.error("Error completing ride:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error",
      });
    }
  }

  /**
   * Update ride location (for tracking)
   */
  async updateLocation(req, res) {
    try {
      const { rideId } = req.params;
      const { lat, lng, address } = req.body;
      const userId = req.user._id;

      const ride = await Ride.findById(rideId);

      if (!ride) {
        return res.status(404).json({
          success: false,
          error: "Ride not found",
        });
      }

      // Only driver or rider can update their location
      if (
        ride.driver._id.toString() !== userId.toString() &&
        ride.rider._id.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized",
        });
      }

      // Add waypoint to route
      if (!ride.route.waypoints) {
        ride.route.waypoints = [];
      }

      ride.route.waypoints.push({
        lat,
        lng,
        timestamp: new Date(),
      });

      await ride.save();

      res.json({
        success: true,
        message: "Location updated",
        data: {
          rideId: ride._id,
          waypoint: { lat, lng, address },
        },
      });
    } catch (error) {
      logger.error("Error updating location:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }

  /**
   * Cancel ride with reason and penalty calculation
   */
  async cancelRideWithReason(req, res) {
    try {
      const { rideId } = req.params;
      const { reason } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;

      const ride = await Ride.findById(rideId).populate("rider driver");

      if (!ride) {
        return res.status(404).json({
          success: false,
          error: "Ride not found",
        });
      }

      // Check authorization
      if (
        ride.rider._id.toString() !== userId.toString() &&
        ride.driver._id.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized",
        });
      }

      // Check if ride can be cancelled
      const cancelableStates = ["requested", "accepted", "driver_arrived"];
      if (!cancelableStates.includes(ride.status)) {
        return res.status(400).json({
          success: false,
          error: `Cannot cancel ride in ${ride.status} status`,
        });
      }

      // Calculate cancellation penalty
      const penalty = rideMatchingService.calculateCancellationPenalty(
        ride,
        userRole,
      );

      // Update ride
      const cancelledBy =
        ride.rider._id.toString() === userId.toString() ? "rider" : "driver";
      ride.status = "cancelled";
      ride.cancelledAt = new Date();
      ride.cancellationReason = reason;
      ride.cancelledBy = cancelledBy;

      await ride.save();

      // Notify the other party
      const otherUser = cancelledBy === "rider" ? ride.driver : ride.rider;
      await notificationService.sendCancellationNotification(
        {
          _id: userId,
          name: userRole === "rider" ? ride.rider.name : ride.driver.name,
        },
        otherUser,
        ride,
        reason,
        null,
      );

      logger.info(
        `Ride ${rideId} cancelled by ${cancelledBy}. Penalty: $${penalty}`,
      );

      res.json({
        success: true,
        message: "Ride cancelled",
        data: {
          rideId: ride._id,
          status: ride.status,
          cancellationPenalty: penalty,
          cancelledBy,
          reason,
        },
      });
    } catch (error) {
      logger.error("Error cancelling ride:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error",
      });
    }
  }

  /**
   * Rate ride and other user
   */
  async rateRide(req, res) {
    try {
      const { rideId } = req.params;
      const { rating, comment, feedback } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: "Rating must be between 1 and 5",
        });
      }

      const ride = await Ride.findById(rideId).populate("rider driver");

      if (!ride) {
        return res.status(404).json({
          success: false,
          error: "Ride not found",
        });
      }

      // Check authorization and status
      if (ride.status !== "completed") {
        return res.status(400).json({
          success: false,
          error: "Can only rate completed rides",
        });
      }

      if (
        userRole === "rider" &&
        ride.rider._id.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized",
        });
      }

      if (
        userRole === "driver" &&
        ride.driver._id.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized",
        });
      }

      // Check if already rated
      if (userRole === "rider" && ride.rating?.byRider) {
        return res.status(400).json({
          success: false,
          error: "You have already rated this ride",
        });
      }

      if (userRole === "driver" && ride.rating?.byDriver) {
        return res.status(400).json({
          success: false,
          error: "You have already rated this ride",
        });
      }

      // Save rating
      if (userRole === "rider") {
        ride.rating.byRider = {
          rating,
          comment,
          ratedAt: new Date(),
        };
        ride.riderFeedback = feedback;

        // Update driver rating
        const driver = await User.findById(ride.driver._id);
        if (driver) {
          const totalRatings = (driver.totalRatings || 0) + 1;
          const oldAvg = driver.rating || 0;
          driver.rating = (oldAvg * (totalRatings - 1) + rating) / totalRatings;
          driver.totalRatings = totalRatings;
          await driver.save();
        }
      } else {
        ride.rating.byDriver = {
          rating,
          comment,
          ratedAt: new Date(),
        };
        ride.driverFeedback = feedback;

        // Update rider rating
        const rider = await User.findById(ride.rider._id);
        if (rider) {
          const totalRatings = (rider.totalRatings || 0) + 1;
          const oldAvg = rider.rating || 0;
          rider.rating = (oldAvg * (totalRatings - 1) + rating) / totalRatings;
          rider.totalRatings = totalRatings;
          await rider.save();
        }
      }

      await ride.save();

      logger.info(`Ride ${rideId} rated by ${userRole}: ${rating} stars`);

      res.json({
        success: true,
        message: "Rating saved successfully",
        data: {
          rideId: ride._id,
          rating: rating,
          comment: comment,
        },
      });
    } catch (error) {
      logger.error("Error rating ride:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error",
      });
    }
  }

  /**
   * Get ride history
   */
  async getRideHistory(req, res) {
    try {
      const { page = 1, limit = 10, status = "all" } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      const query = {};

      if (userRole === "rider") {
        query.rider = userId;
      } else if (userRole === "driver") {
        query.driver = userId;
      }

      if (status !== "all") {
        query.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const rides = await Ride.find(query)
        .populate(
          userRole === "rider" ? "driver" : "rider",
          "name rating phone",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Ride.countDocuments(query);

      res.json({
        success: true,
        data: {
          rides,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      logger.error("Error getting ride history:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }

  /**
   * Request a new ride
   */
  async requestRide(req, res) {
    try {
      const {
        pickupLocation,
        dropoffLocation,
        rideType = "standard",
      } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Check if user is a rider
      if (userRole !== "rider") {
        return res.status(403).json({
          success: false,
          error: "Only riders can request rides",
        });
      }

      const result = await rideService.requestRide(userId, {
        pickupLocation,
        dropoffLocation,
        rideType,
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("❌ Request ride error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error",
      });
    }
  }

  /**
   * Get ride by ID
   */
  async getRide(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      const result = await rideService.getRide(id, userId, userRole);
      res.json(result);
    } catch (error) {
      console.error("❌ Get ride error:", error);

      if (error.message === ERROR_MESSAGES.RIDE_NOT_FOUND) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message.includes("Not authorized")) {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }

  /**
   * Update ride status
   */
  async updateRideStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;

      const result = await rideService.updateRideStatus(
        id,
        status,
        userId,
        userRole,
      );

      res.json(result);
    } catch (error) {
      console.error("❌ Update ride status error:", error);

      res.status(400).json({
        success: false,
        error: error.message || "Invalid status transition",
      });
    }
  }

  /**
   * Cancel a ride
   */
  async cancelRide(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      const result = await rideService.cancelRide(id, userId, userRole);
      res.json(result);
    } catch (error) {
      console.error("❌ Cancel ride error:", error);

      if (error.message === ERROR_MESSAGES.RIDE_NOT_FOUND) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message === ERROR_MESSAGES.RIDE_CANNOT_BE_CANCELLED) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }

  /**
   * Get available rides for drivers
   */
  async getAvailableRides(req, res) {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;

      // Check if user is a driver
      if (userRole !== "driver") {
        return res.status(403).json({
          success: false,
          error: "Only drivers can view available rides",
        });
      }

      // Get rides with REQUESTED status
      const rides = await Ride.find({
        status: "requested",
      })
        .populate("rider", "name rating phone")
        .sort({ createdAt: -1 })
        .limit(20);

      res.json({
        success: true,
        data: {
          rides,
          count: rides.length,
        },
      });
    } catch (error) {
      console.error("❌ Get available rides error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
}

export default new RideController();
