/**
 * Ride Service
 * Contains business logic for ride operations
 */

import Ride from '../models/Ride.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { 
  RIDE_STATUS, 
  VEHICLE_TYPES, 
  PRICING, 
  ERROR_MESSAGES,
  LIMITS 
} from '../config/constants.js';

class RideService {
  constructor() {
    this.calculations = new Calculations();
    this.matcher = new DriverMatcher();
  }

  /**
   * Request a new ride
   */
  async requestRide(riderId, rideData) {
    try {
      console.log(`🚗 Ride request from rider: ${riderId}`);

      // Verify rider exists and is a rider
      const rider = await User.findById(riderId);
      if (!rider || rider.role !== 'rider') {
        throw new Error('Only riders can request rides');
      }

      // Calculate fare
      const fare = this.calculations.calculateFare(
        rideData.pickupLocation,
        rideData.dropoffLocation,
        rideData.vehicleType || 'car'
      );

      // Create ride object
      const ride = new Ride({
        rider: riderId,
        pickupLocation: rideData.pickupLocation,
        dropoffLocation: rideData.dropoffLocation,
        fare: {
          baseFare: fare.baseFare,
          distanceFare: fare.distanceFare,
          timeFare: fare.timeFare,
          surgeMultiplier: fare.surgeMultiplier,
          total: fare.total,
          currency: 'USD'
        },
        distance: fare.distance,
        estimatedDuration: fare.duration,
        vehicleType: rideData.vehicleType || 'car',
        status: RIDE_STATUS.REQUESTED
      });

      // Save ride
      await ride.save();
      await ride.populate('rider', 'name email phone');

      console.log(`✅ Ride created: ${ride._id}`);
      
      // Find nearby drivers and notify them (async - don't wait)
      this.matcher.findAndNotifyDrivers(ride);

      return {
        success: true,
        ride,
        message: 'Ride requested successfully. Searching for drivers...'
      };
    } catch (error) {
      console.error('❌ Ride request error:', error);
      throw error;
    }
  }

  /**
   * Get ride by ID with authorization check
   */
  async getRide(rideId, userId, userRole) {
    try {
      const ride = await Ride.findById(rideId)
        .populate('rider', 'name email phone')
        .populate('driver', 'name email phone')
        .populate('payment');

      if (!ride) {
        throw new Error(ERROR_MESSAGES.RIDE_NOT_FOUND);
      }

      // Check authorization
      const isAuthorized = 
        ride.rider._id.toString() === userId.toString() ||
        (ride.driver && ride.driver._id.toString() === userId.toString()) ||
        userRole === 'admin';

      if (!isAuthorized) {
        throw new Error('Not authorized to view this ride');
      }

      return { success: true, ride };
    } catch (error) {
      console.error('❌ Get ride error:', error);
      throw error;
    }
  }

  /**
   * Update ride status with validation
   */
  async updateRideStatus(rideId, status, userId, userRole) {
    try {
      const ride = await Ride.findById(rideId);
      
      if (!ride) {
        throw new Error(ERROR_MESSAGES.RIDE_NOT_FOUND);
      }

      // Validate status transition
      this.validateStatusTransition(ride.status, status, userId, ride);

      // Update ride
      ride.status = status;
      
      // Set timestamps based on status
      switch (status) {
        case RIDE_STATUS.ACCEPTED:
          ride.startedAt = new Date();
          break;
        case RIDE_STATUS.COMPLETED:
          ride.completedAt = new Date();
          ride.actualDuration = Math.floor((ride.completedAt - ride.startedAt) / 60000); // minutes
          break;
        case RIDE_STATUS.CANCELLED:
          ride.cancelledAt = new Date();
          break;
      }

      await ride.save();

      console.log(`✅ Ride ${rideId} status updated to ${status}`);

      return {
        success: true,
        ride,
        message: `Ride status updated to ${status}`
      };
    } catch (error) {
      console.error('❌ Update ride status error:', error);
      throw error;
    }
  }

  /**
   * Cancel a ride
   */
  async cancelRide(rideId, userId, userRole) {
    try {
      const ride = await Ride.findById(rideId);
      
      if (!ride) {
        throw new Error(ERROR_MESSAGES.RIDE_NOT_FOUND);
      }

      // Check authorization
      const canCancel = 
        ride.rider.toString() === userId.toString() ||
        (ride.driver && ride.driver.toString() === userId.toString()) ||
        userRole === 'admin';

      if (!canCancel) {
        throw new Error('Not authorized to cancel this ride');
      }

      // Check if ride can be cancelled
      const cancellableStatuses = [RIDE_STATUS.REQUESTED, RIDE_STATUS.ACCEPTED];
      if (!cancellableStatuses.includes(ride.status)) {
        throw new Error(ERROR_MESSAGES.RIDE_CANNOT_BE_CANCELLED);
      }

      // Update ride
      ride.status = RIDE_STATUS.CANCELLED;
      ride.cancelledAt = new Date();
      await ride.save();

      console.log(`✅ Ride ${rideId} cancelled by ${userId}`);

      return {
        success: true,
        ride,
        message: 'Ride cancelled successfully'
      };
    } catch (error) {
      console.error('❌ Cancel ride error:', error);
      throw error;
    }
  }

  /**
   * Get user's ride history
   */
  async getRideHistory(userId, userRole, type = 'all', page = 1, limit = 10) {
    try {
      // Build query based on user role
      const query = {};
      
      if (userRole === 'rider') {
        query.rider = userId;
      } else if (userRole === 'driver') {
        query.driver = userId;
      } else {
        throw new Error('Invalid user role');
      }

      // Filter by type
      if (type === 'upcoming') {
        query.status = { $in: [RIDE_STATUS.REQUESTED, RIDE_STATUS.ACCEPTED, RIDE_STATUS.IN_PROGRESS] };
      } else if (type === 'completed') {
        query.status = { $in: [RIDE_STATUS.COMPLETED, RIDE_STATUS.CANCELLED] };
      }

      // Execute query with pagination
      const rides = await Ride.find(query)
        .populate('rider', 'name email')
        .populate('driver', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await Ride.countDocuments(query);

      return {
        success: true,
        data: {
          rides,
          pagination: {
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit
          }
        }
      };
    } catch (error) {
      console.error('❌ Get ride history error:', error);
      throw error;
    }
  }

  /**
   * Rate a ride
   */
  async rateRide(rideId, userId, rating, comment, userRole) {
    try {
      const ride = await Ride.findById(rideId);
      
      if (!ride) {
        throw new Error(ERROR_MESSAGES.RIDE_NOT_FOUND);
      }

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      let updatedDriver = null;

      // Determine who is rating
      if (ride.rider.toString() === userId) {
        // Rider rating driver
        ride.rating.byRider = { rating, comment };
        
        // Update driver's average rating
        if (ride.driver) {
          const driver = await Driver.findOne({ user: ride.driver });
          if (driver) {
            const totalRatings = driver.totalRides || 0;
            const currentRating = driver.rating || 0;
            const newRating = ((currentRating * totalRatings) + rating) / (totalRatings + 1);
            
            driver.rating = newRating;
            driver.totalRides = (driver.totalRides || 0) + 1;
            await driver.save();
            
            updatedDriver = driver;
          }
        }
      } else if (ride.driver && ride.driver.toString() === userId) {
        // Driver rating rider
        ride.rating.byDriver = { rating, comment };
      } else {
        throw new Error('Not authorized to rate this ride');
      }

      await ride.save();
      
      return {
        success: true,
        message: 'Rating submitted successfully',
        ride,
        updatedDriver
      };
    } catch (error) {
      console.error('❌ Rate ride error:', error);
      throw error;
    }
  }

  /**
   * Validate status transition
   */
  validateStatusTransition(currentStatus, newStatus, userId, ride) {
    const validTransitions = {
      [RIDE_STATUS.REQUESTED]: [RIDE_STATUS.ACCEPTED, RIDE_STATUS.CANCELLED],
      [RIDE_STATUS.ACCEPTED]: [RIDE_STATUS.IN_PROGRESS, RIDE_STATUS.CANCELLED],
      [RIDE_STATUS.IN_PROGRESS]: [RIDE_STATUS.COMPLETED, RIDE_STATUS.CANCELLED],
      [RIDE_STATUS.COMPLETED]: [],
      [RIDE_STATUS.CANCELLED]: []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }

    // Additional role-based validation
    if (newStatus === RIDE_STATUS.ACCEPTED && !ride.driver) {
      throw new Error('Cannot accept ride without a driver');
    }
  }
}

/**
 * Calculations helper class
 */
class Calculations {
  /**
   * Calculate ride fare
   */
  calculateFare(pickupLocation, dropoffLocation, vehicleType) {
    // For demo purposes, using mock calculations
    // In production, use Google Maps Distance Matrix API
    
    const baseFare = PRICING.BASE_FARE;
    const perKmRate = PRICING.PER_KM_RATES[vehicleType] || PRICING.PER_KM_RATES.car;
    
    // Mock distance (5-20km)
    const distance = Math.random() * 15 + 5;
    
    // Mock duration (10-45 minutes)
    const duration = Math.random() * 35 + 10;
    
    // Calculate components
    const distanceFare = distance * perKmRate;
    const timeFare = duration * PRICING.PER_MINUTE_RATE;
    
    // Surge pricing (random 1.0-1.5x)
    const surgeMultiplier = Math.random() * 0.5 + 1.0;
    
    // Total fare
    let total = baseFare + distanceFare + timeFare;
    total *= surgeMultiplier;
    
    // Apply minimum fare
    total = Math.max(total, PRICING.MINIMUM_FARE);
    
    return {
      baseFare,
      distanceFare: parseFloat(distanceFare.toFixed(2)),
      timeFare: parseFloat(timeFare.toFixed(2)),
      surgeMultiplier: parseFloat(surgeMultiplier.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      distance: parseFloat(distance.toFixed(2)),
      duration: Math.round(duration)
    };
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }

  toRad(degrees) {
    return degrees * (Math.PI/180);
  }
}

/**
 * Driver matcher helper class
 */
class DriverMatcher {
  /**
   * Find nearby drivers and notify them
   */
  async findAndNotifyDrivers(ride) {
    try {
      // In production, use geospatial query
      // For demo, find online drivers
      const nearbyDrivers = await Driver.find({
        isOnline: true,
        vehicleType: ride.vehicleType || 'car'
      }).limit(10);

      console.log(`🔍 Found ${nearbyDrivers.length} nearby drivers`);

      // In production, emit socket event to notify drivers
      // this.io.emit('new_ride_request', { rideId: ride._id, ... });

      return nearbyDrivers;
    } catch (error) {
      console.error('❌ Find drivers error:', error);
      return [];
    }
  }

  /**
   * Assign driver to ride
   */
  async assignDriver(rideId, driverId) {
    try {
      const ride = await Ride.findById(rideId);
      const driver = await Driver.findOne({ user: driverId });

      if (!ride || !driver) {
        throw new Error('Ride or driver not found');
      }

      if (ride.status !== RIDE_STATUS.REQUESTED) {
        throw new Error('Ride is not in requested state');
      }

      if (!driver.isOnline) {
        throw new Error('Driver is offline');
      }

      // Assign driver
      ride.driver = driverId;
      ride.status = RIDE_STATUS.ACCEPTED;
      ride.startedAt = new Date();
      
      await ride.save();

      // Update driver stats
      driver.currentRide = rideId;
      await driver.save();

      console.log(`✅ Driver ${driverId} assigned to ride ${rideId}`);

      return {
        success: true,
        ride,
        driver,
        message: 'Driver assigned successfully'
      };
    } catch (error) {
      console.error('❌ Assign driver error:', error);
      throw error;
    }
  }
}

export default new RideService();