import locationService from "./locationService.js";
import Ride from "../models/Ride.js";
import logger from "../utils/logger.js";

class RideMatchingService {
  /**
   * Find and match suitable drivers for a ride request
   * Considers distance, rating, acceptance rate, and vehicle type
   */
  async findMatchingDrivers(riderId, rideData) {
    try {
      const {
        pickupLat,
        pickupLng,
        rideType = "standard",
        specialRequirements,
      } = rideData;

      // Get nearby drivers within 10km
      const nearbyDrivers = await locationService.findNearbyDrivers(
        pickupLat,
        pickupLng,
        10,
      );

      // Filter and score drivers
      const filteredDrivers = nearbyDrivers
        .filter((driver) => {
          // Exclude rider themselves
          if (driver._id.toString() === riderId) return false;

          // Check availability
          if (!driver.isAvailable || driver.isAvailable.isOnline === false)
            return false;

          // Minimum rating threshold
          if (driver.rating && driver.rating < 3.5) return false;

          // Good acceptance rate
          if (driver.acceptanceRate && driver.acceptanceRate < 0.75)
            return false;

          // Check vehicle type match if needed
          if (rideType === "premium" && driver.vehicleType !== "premium")
            return false;
          if (
            rideType === "comfort" &&
            !["comfort", "premium"].includes(driver.vehicleType)
          )
            return false;

          return true;
        })
        .map((driver) => {
          // Calculate match score (0-100)
          let score = 100;

          // Distance factor (closer is better) - 30 points
          const distanceFactor = Math.max(0, 30 - (driver.distance || 0) * 3);
          score -= 30;
          score += distanceFactor;

          // Rating factor - 30 points
          const ratingFactor = ((driver.rating || 4.5) / 5) * 30;
          score -= 30;
          score += ratingFactor;

          // Acceptance rate - 20 points
          const acceptanceFactor = (driver.acceptanceRate || 0.9) * 20;
          score -= 20;
          score += acceptanceFactor;

          // Completed rides - 20 points (experienced drivers)
          const experienceFactor = Math.min(
            20,
            (driver.completedRides || 0) / 100,
          );
          score -= 20;
          score += experienceFactor;

          return {
            ...(driver.toObject?.() || driver),
            matchScore: Math.max(0, Math.min(100, score)),
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

      return filteredDrivers.slice(0, 10); // Return top 10 matches
    } catch (error) {
      logger.error("Error finding matching drivers:", error);
      throw error;
    }
  }

  /**
   * Broadcast ride request to matched drivers
   */
  async broadcastRideRequest(rideId, pickupLat, pickupLng, rideData, io) {
    try {
      const matchedDrivers = await this.findMatchingDrivers(rideData.riderId, {
        pickupLat,
        pickupLng,
        rideType: rideData.rideType,
      });

      if (matchedDrivers.length === 0) {
        return {
          success: false,
          message: "No suitable drivers available",
          drivers: [],
        };
      }

      // Get ride details
      const ride = await Ride.findById(rideId)
        .populate("rider", "name phone avatar")
        .lean();

      // Broadcast to all matched drivers
      matchedDrivers.forEach((driver) => {
        io.to(`driver_${driver._id}`).emit("new_ride_request", {
          rideId,
          ride: {
            id: ride._id,
            riderId: ride.rider._id,
            riderName: ride.rider.name,
            riderPhone: ride.rider.phone,
            riderRating: ride.rider.rating,
            pickupAddress: ride.pickupLocation.address,
            pickupCoordinates: {
              lat: pickupLat,
              lng: pickupLng,
            },
            dropoffAddress: ride.dropoffLocation.address,
            distance: ride.distance,
            estimatedDuration: ride.estimatedDuration,
            fare: ride.fare,
            rideType: ride.rideType,
            specialRequirements: ride.specialRequirements,
          },
          driver: {
            distanceFromPickup: driver.distance,
            estimatedArrival: Math.round((driver.distance / 40) * 60), // minutes at 40 km/h
            matchScore: driver.matchScore,
          },
          timestamp: new Date(),
        });
      });

      return {
        success: true,
        message: `Ride request sent to ${matchedDrivers.length} drivers`,
        drivers: matchedDrivers.map((d) => ({
          id: d._id,
          distance: d.distance,
          rating: d.rating,
          vehicleType: d.vehicleType,
          matchScore: d.matchScore,
        })),
      };
    } catch (error) {
      logger.error("Error broadcasting ride request:", error);
      throw error;
    }
  }

  /**
   * Calculate cancellation penalty
   */
  calculateCancellationPenalty(ride, cancelledBy) {
    try {
      let penalty = 0;
      const status = ride.status;

      if (cancelledBy === "rider") {
        if (status === "accepted" || status === "in_progress") {
          penalty = ride.fare.total * 0.5; // 50% cancellation fee
        }
      } else if (cancelledBy === "driver") {
        if (status === "accepted") {
          penalty = ride.fare.baseFare * 0.25; // 25% penalty to driver
        }
      }

      return penalty;
    } catch (error) {
      logger.error("Error calculating cancellation penalty:", error);
      return 0;
    }
  }

  /**
   * Get ride statistics for matching algorithms
   */
  async getDriverStats(driverId) {
    try {
      const rides = await Ride.find({ driver: driverId });

      const completedRides = rides.filter((r) => r.status === "completed");
      const cancelledRides = rides.filter((r) => r.status === "cancelled");

      const totalEarnings = completedRides.reduce(
        (sum, r) => sum + (r.fare.total || 0),
        0,
      );

      const avgRating =
        completedRides.length > 0
          ? completedRides.reduce(
              (sum, r) => sum + (r.rating?.byRider?.rating || 0),
              0,
            ) / completedRides.length
          : 0;

      const acceptanceRate =
        completedRides.length /
        (completedRides.length + cancelledRides.length || 1);

      return {
        totalRides: rides.length,
        completedRides: completedRides.length,
        cancelledRides: cancelledRides.length,
        totalEarnings,
        avgRating,
        acceptanceRate,
        responseTime: rides.length > 0 ? 45 : null, // seconds (placeholder)
      };
    } catch (error) {
      logger.error("Error getting driver stats:", error);
      return null;
    }
  }

  /**
   * Suggest driver alternatives if ride not accepted
   */
  async getAlternativeDrivers(rideId, currentMatchedDriverCount) {
    try {
      const ride = await Ride.findById(rideId);
      if (!ride) throw new Error("Ride not found");

      const { pickupLocation } = ride;

      // Expand search radius
      const expandedRadius = 15; // 15km instead of 10km

      const alternatives = await locationService.findNearbyDrivers(
        pickupLocation.coordinates.lat,
        pickupLocation.coordinates.lng,
        expandedRadius,
      );

      return alternatives.slice(
        currentMatchedDriverCount,
        currentMatchedDriverCount + 5,
      );
    } catch (error) {
      logger.error("Error getting alternative drivers:", error);
      throw error;
    }
  }
}

export default new RideMatchingService();
