import Driver from "../models/Driver.js";
import logger from "../utils/logger.js";

/**
 * Location Service - Handles geospatial queries and location tracking
 */
class LocationService {
  /**
   * Find nearby drivers for a rider
   * @param {number} lat - Rider latitude
   * @param {number} lng - Rider longitude
   * @param {number} radiusInKm - Search radius in kilometers (default: 10km)
   * @returns {array} Array of nearby drivers
   */
  async findNearbyDrivers(lat, lng, radiusInKm = 10) {
    try {
      const radiusInMeters = radiusInKm * 1000;

      const drivers = await Driver.find({
        isOnline: true,
        currentLocation: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
            },
            $maxDistance: radiusInMeters,
          },
        },
      })
        .populate("user", "name phone rating avatar")
        .select("user vehicle currentLocation stats rating")
        .limit(50) // Limit to 50 drivers
        .lean();

      return drivers.map((driver) => ({
        driverId: driver._id,
        name: driver.user?.name,
        phone: driver.user?.phone,
        rating: driver.stats?.rating || 0,
        avatar: driver.user?.avatar,
        vehicle: driver.vehicle,
        location: {
          lat: driver.currentLocation?.coordinates[1],
          lng: driver.currentLocation?.coordinates[0],
        },
        totalRides: driver.stats?.totalRides || 0,
      }));
    } catch (error) {
      logger.error("Error finding nearby drivers:", error);
      throw error;
    }
  }

  /**
   * Update driver location
   * @param {string} driverId - Driver ID
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} address - Address (optional)
   * @returns {object} Updated driver location
   */
  async updateDriverLocation(driverId, lat, lng, address = null) {
    try {
      const driver = await Driver.findByIdAndUpdate(
        driverId,
        {
          currentLocation: {
            type: "Point",
            coordinates: [lng, lat],
            address: address || "",
            updatedAt: new Date(),
          },
        },
        { new: true },
      );

      if (!driver) {
        throw new Error("Driver not found");
      }

      return {
        success: true,
        location: {
          lat: driver.currentLocation.coordinates[1],
          lng: driver.currentLocation.coordinates[0],
          address: driver.currentLocation.address,
          updatedAt: driver.currentLocation.updatedAt,
        },
      };
    } catch (error) {
      logger.error("Error updating driver location:", error);
      throw error;
    }
  }

  /**
   * Get distance between two coordinates (Haversine formula)
   * @param {number} lat1 - First latitude
   * @param {number} lon1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lon2 - Second longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return parseFloat(distance.toFixed(2));
  }

  /**
   * Calculate ETA based on distance
   * Assumes average speed of 30 km/h in city
   * @param {number} distanceInKm - Distance in kilometers
   * @returns {number} ETA in minutes
   */
  calculateETA(distanceInKm) {
    const avgSpeedKmPerHour = 30; // Average city speed
    const etaMinutes = Math.ceil((distanceInKm / avgSpeedKmPerHour) * 60);
    return Math.max(2, etaMinutes); // Minimum 2 minutes
  }

  /**
   * Calculate fare based on distance, time, and ride type
   * @param {number} distanceInKm - Distance in kilometers
   * @param {number} durationInMinutes - Ride duration in minutes
   * @param {string} rideType - 'standard', 'comfort', or 'premium'
   * @param {number} surgeMultiplier - Surge multiplier (default: 1)
   * @returns {object} Fare breakdown
   */
  calculateFare(
    distanceInKm,
    durationInMinutes,
    rideType = "standard",
    surgeMultiplier = 1,
  ) {
    // Base fares
    const baseFares = {
      standard: 2.5, // $2.50 base
      comfort: 3.5,
      premium: 5.0,
    };

    // Per km rates
    const perKmRates = {
      standard: 1.5,
      comfort: 2.0,
      premium: 2.75,
    };

    // Per minute rates
    const perMinuteRates = {
      standard: 0.3,
      comfort: 0.4,
      premium: 0.5,
    };

    const baseFare = baseFares[rideType] || baseFares.standard;
    const distanceFare =
      distanceInKm * (perKmRates[rideType] || perKmRates.standard);
    const timeFare =
      durationInMinutes * (perMinuteRates[rideType] || perMinuteRates.standard);

    // Calculate total
    let total = (baseFare + distanceFare + timeFare) * surgeMultiplier;

    // Apply minimum fare of $5
    total = Math.max(5, total);

    return {
      baseFare: parseFloat(baseFare.toFixed(2)),
      distanceFare: parseFloat(distanceFare.toFixed(2)),
      timeFare: parseFloat(timeFare.toFixed(2)),
      subtotal: parseFloat((baseFare + distanceFare + timeFare).toFixed(2)),
      surgeMultiplier,
      total: parseFloat(total.toFixed(2)),
      currency: "USD",
      breakdown: {
        distance: `${distanceInKm} km`,
        duration: `${durationInMinutes} min`,
        rideType,
      },
    };
  }

  /**
   * Get driver's current availability status
   * @param {string} driverId - Driver ID
   * @returns {object} Availability status
   */
  async getDriverAvailability(driverId) {
    try {
      const driver = await Driver.findById(driverId).select(
        "isOnline currentRide stats",
      );

      if (!driver) {
        throw new Error("Driver not found");
      }

      return {
        isOnline: driver.isOnline,
        isAvailable: driver.isOnline && !driver.currentRide,
        currentRide: driver.currentRide,
        totalRides: driver.stats.totalRides,
        rating: driver.stats.rating,
        cancelledRides: driver.stats.cancelledRides,
      };
    } catch (error) {
      logger.error("Error getting driver availability:", error);
      throw error;
    }
  }

  /**
   * Get average distance from all nearby drivers
   * Useful for showing wait times
   * @param {number} lat - Rider latitude
   * @param {number} lng - Rider longitude
   * @returns {object} Average distance and wait time
   */
  async getAverageDriverDistance(lat, lng) {
    try {
      const drivers = await this.findNearbyDrivers(lat, lng, 10);

      if (drivers.length === 0) {
        return {
          averageDistance: null,
          averageWaitTime: null,
          availableDrivers: 0,
        };
      }

      const totalDistance = drivers.reduce((sum, driver) => {
        const distance = this.calculateDistance(
          lat,
          lng,
          driver.location.lat,
          driver.location.lng,
        );
        return sum + distance;
      }, 0);

      const averageDistance = totalDistance / drivers.length;
      const averageWaitTime = this.calculateETA(averageDistance);

      return {
        averageDistance: parseFloat(averageDistance.toFixed(2)),
        averageWaitTime,
        availableDrivers: drivers.length,
      };
    } catch (error) {
      logger.error("Error calculating average driver distance:", error);
      throw error;
    }
  }
}

export default new LocationService();
