/**
 * Driver Service
 * Contains business logic for driver operations
 */

import Driver from '../models/Driver.js';
import User from '../models/User.js';
import Ride from '../models/Ride.js';
import { RIDE_STATUS, ERROR_MESSAGES } from '../config/constants.js';

class DriverService {
  /**
   * Update driver location
   */
  async updateLocation(driverId, locationData) {
    try {
      const driver = await Driver.findOne({ user: driverId });
      
      if (!driver) {
        throw new Error(ERROR_MESSAGES.DRIVER_NOT_FOUND);
      }

      // Update location
      driver.currentLocation = {
        lat: locationData.lat,
        lng: locationData.lng
      };

      if (locationData.heading !== null && locationData.heading !== undefined) {
        driver.heading = locationData.heading;
      }

      driver.lastLocationUpdate = new Date();
      await driver.save();

      console.log(`📍 Driver ${driverId} location updated`);

      return {
        success: true,
        data: {
          location: driver.currentLocation,
          heading: driver.heading,
          lastUpdate: driver.lastLocationUpdate
        }
      };
    } catch (error) {
      console.error('❌ Update location error:', error);
      throw error;
    }
  }

  /**
   * Toggle driver online/offline status
   */
  async toggleStatus(driverId, isOnline) {
    try {
      const driver = await Driver.findOne({ user: driverId });
      
      if (!driver) {
        throw new Error(ERROR_MESSAGES.DRIVER_NOT_FOUND);
      }

      const previousStatus = driver.isOnline;
      driver.isOnline = isOnline;
      driver.lastOnlineTime = new Date();

      // Reset current ride if going offline
      if (!isOnline && driver.currentRide) {
        driver.currentRide = null;
      }

      await driver.save();

      console.log(`🔌 Driver ${driverId} status: ${previousStatus} -> ${isOnline}`);

      return {
        isOnline: driver.isOnline,
        lastOnlineTime: driver.lastOnlineTime,
        currentRide: driver.currentRide
      };
    } catch (error) {
      console.error('❌ Toggle status error:', error);
      throw error;
    }
  }

  /**
   * Find nearby available drivers
   */
  async findNearbyDrivers(location, radiusKm = 10, vehicleType = null) {
    try {
      const { lat, lng } = location;
      
      if (!lat || !lng) {
        throw new Error('Location coordinates are required');
      }

      // Build query
      const query = {
        isOnline: true,
        'currentLocation.lat': { $exists: true },
        'currentLocation.lng': { $exists: true }
      };

      // Filter by vehicle type if specified
      if (vehicleType) {
        query.vehicleType = vehicleType;
      }

      // Get all online drivers first (simplified - in production use geospatial query)
      const drivers = await Driver.find(query)
        .populate('user', 'name rating')
        .limit(50);

      // Calculate distance and filter (simplified - in production use MongoDB geospatial)
      const nearbyDrivers = drivers.filter(driver => {
        if (!driver.currentLocation?.lat || !driver.currentLocation?.lng) {
          return false;
        }

        const distance = this.calculateDistance(
          lat,
          lng,
          driver.currentLocation.lat,
          driver.currentLocation.lng
        );

        return distance <= radiusKm;
      });

      // Sort by distance
      nearbyDrivers.sort((a, b) => {
        const distA = this.calculateDistance(
          lat,
          lng,
          a.currentLocation.lat,
          a.currentLocation.lng
        );
        const distB = this.calculateDistance(
          lat,
          lng,
          b.currentLocation.lat,
          b.currentLocation.lng
        );
        return distA - distB;
      });

      console.log(`🔍 Found ${nearbyDrivers.length} nearby drivers within ${radiusKm}km`);

      return nearbyDrivers;
    } catch (error) {
      console.error('❌ Find nearby drivers error:', error);
      throw error;
    }
  }

  /**
   * Get driver earnings report
   */
  async getEarningsReport(driverId, period = 'today') {
    try {
      const driver = await Driver.findOne({ user: driverId });
      
      if (!driver) {
        throw new Error(ERROR_MESSAGES.DRIVER_NOT_FOUND);
      }

      let startDate, endDate;
      const now = new Date();

      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        
        default:
          startDate = new Date(0); // Beginning of time
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      }

      // Get rides for the period
      const rides = await Ride.find({
        driver: driver._id,
        status: RIDE_STATUS.COMPLETED,
        completedAt: {
          $gte: startDate,
          $lt: endDate
        }
      }).sort({ completedAt: -1 });

      // Calculate earnings
      const totalEarnings = rides.reduce((sum, ride) => sum + (ride.fare?.total || 0), 0);
      
      // Calculate average fare
      const averageFare = rides.length > 0 ? totalEarnings / rides.length : 0;

      // Get hourly breakdown
      const hourlyBreakdown = this.calculateHourlyBreakdown(rides);
      
      // Get daily breakdown for weekly/monthly reports
      const dailyBreakdown = period !== 'today' 
        ? this.calculateDailyBreakdown(rides, startDate, endDate)
        : [];

      return {
        success: true,
        data: {
          period,
          startDate,
          endDate,
          summary: {
            totalRides: rides.length,
            totalEarnings: parseFloat(totalEarnings.toFixed(2)),
            averageFare: parseFloat(averageFare.toFixed(2)),
            onlineHours: driver.onlineHoursToday || 0
          },
          rides: rides.map(ride => ({
            id: ride._id,
            riderId: ride.rider,
            fare: ride.fare?.total || 0,
            distance: ride.distance,
            duration: ride.actualDuration || ride.estimatedDuration,
            completedAt: ride.completedAt
          })),
          breakdown: {
            hourly: hourlyBreakdown,
            daily: dailyBreakdown
          }
        }
      };
    } catch (error) {
      console.error('❌ Get earnings report error:', error);
      throw error;
    }
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

  /**
   * Calculate hourly breakdown of earnings
   */
  calculateHourlyBreakdown(rides) {
    const hourly = {};
    
    for (let hour = 0; hour < 24; hour++) {
      hourly[hour] = {
        hour,
        label: `${hour}:00`,
        rides: 0,
        earnings: 0
      };
    }

    rides.forEach(ride => {
      if (!ride.completedAt) return;
      
      const hour = ride.completedAt.getHours();
      hourly[hour].rides += 1;
      hourly[hour].earnings += ride.fare?.total || 0;
    });

    return Object.values(hourly);
  }

  /**
   * Calculate daily breakdown of earnings
   */
  calculateDailyBreakdown(rides, startDate, endDate) {
    const daily = {};
    const current = new Date(startDate);
    
    while (current < endDate) {
      const dateStr = current.toISOString().split('T')[0];
      daily[dateStr] = {
        date: dateStr,
        rides: 0,
        earnings: 0
      };
      current.setDate(current.getDate() + 1);
    }

    rides.forEach(ride => {
      if (!ride.completedAt) return;
      
      const dateStr = ride.completedAt.toISOString().split('T')[0];
      if (daily[dateStr]) {
        daily[dateStr].rides += 1;
        daily[dateStr].earnings += ride.fare?.total || 0;
      }
    });

    return Object.values(daily);
  }

  /**
   * Convert degrees to radians
   */
  toRad(degrees) {
    return degrees * (Math.PI/180);
  }

  /**
   * Update driver statistics after ride completion
   */
  async updateDriverStats(driverId, rideFare) {
    try {
      const driver = await Driver.findOne({ user: driverId });
      
      if (!driver) {
        return;
      }

      // Update statistics
      driver.totalRides = (driver.totalRides || 0) + 1;
      driver.totalEarnings = (driver.totalEarnings || 0) + rideFare;
      
      // Update online hours (estimate 30 minutes per ride)
      driver.onlineHoursToday = (driver.onlineHoursToday || 0) + 0.5;
      
      // Reset current ride
      driver.currentRide = null;
      
      await driver.save();
      
      console.log(`📊 Updated stats for driver ${driverId}`);
    } catch (error) {
      console.error('❌ Update driver stats error:', error);
    }
  }

  /**
   * Get driver analytics
   */
  async getAnalytics(driverId) {
    try {
      const driver = await Driver.findOne({ user: driverId });
      
      if (!driver) {
        throw new Error(ERROR_MESSAGES.DRIVER_NOT_FOUND);
      }

      // Get last 30 days of data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const rides = await Ride.find({
        driver: driver._id,
        status: RIDE_STATUS.COMPLETED,
        completedAt: { $gte: thirtyDaysAgo }
      });

      // Calculate analytics
      const analytics = {
        performance: {
          totalRides: rides.length,
          totalEarnings: rides.reduce((sum, ride) => sum + (ride.fare?.total || 0), 0),
          averageRating: driver.rating || 0,
          acceptanceRate: this.calculateAcceptanceRate(driver, rides),
          completionRate: this.calculateCompletionRate(rides)
        },
        trends: {
          weeklyTrend: this.calculateWeeklyTrend(rides),
          hourlyPeak: this.calculateHourlyPeak(rides),
          popularLocations: this.calculatePopularLocations(rides)
        },
        recommendations: this.generateRecommendations(driver, rides)
      };

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      console.error('❌ Get analytics error:', error);
      throw error;
    }
  }

  /**
   * Calculate acceptance rate
   */
  calculateAcceptanceRate(driver, rides) {
    // Simplified - in production track acceptance/rejection separately
    const totalOffers = rides.length * 1.5; // Estimate
    return totalOffers > 0 ? (rides.length / totalOffers) * 100 : 0;
  }

  /**
   * Calculate completion rate
   */
  calculateCompletionRate(rides) {
    // Simplified - in production track cancellations separately
    return 95; // Placeholder
  }

  /**
   * Calculate weekly trend
   */
  calculateWeeklyTrend(rides) {
    // Simplified - return mock data
    return {
      monday: { rides: 5, earnings: 45 },
      tuesday: { rides: 7, earnings: 63 },
      wednesday: { rides: 6, earnings: 54 },
      thursday: { rides: 8, earnings: 72 },
      friday: { rides: 12, earnings: 108 },
      saturday: { rides: 15, earnings: 135 },
      sunday: { rides: 10, earnings: 90 }
    };
  }

  /**
   * Calculate hourly peak
   */
  calculateHourlyPeak(rides) {
    // Simplified - return peak hours
    return {
      morning: { hour: 8, rides: 10 },
      afternoon: { hour: 14, rides: 15 },
      evening: { hour: 18, rides: 20 },
      night: { hour: 22, rides: 8 }
    };
  }

  /**
   * Calculate popular locations
   */
  calculatePopularLocations(rides) {
    // Simplified - return mock popular locations
    return [
      { location: 'Downtown', rides: 25 },
      { location: 'Airport', rides: 18 },
      { location: 'Shopping Mall', rides: 15 },
      { location: 'University', rides: 12 },
      { location: 'Business District', rides: 20 }
    ];
  }

  /**
   * Generate recommendations for driver
   */
  generateRecommendations(driver, rides) {
    const recommendations = [];
    
    if (driver.rating < 4.5) {
      recommendations.push({
        type: 'rating',
        title: 'Improve Your Rating',
        description: 'Maintain a clean vehicle and provide excellent service to improve your rating.',
        priority: 'high'
      });
    }
    
    if (rides.length < 10) {
      recommendations.push({
        type: 'activity',
        title: 'Increase Activity',
        description: 'Try driving during peak hours to get more ride requests.',
        priority: 'medium'
      });
    }
    
    if (!driver.currentLocation) {
      recommendations.push({
        type: 'location',
        title: 'Update Your Location',
        description: 'Keep your location updated to receive nearby ride requests.',
        priority: 'high'
      });
    }
    
    return recommendations;
  }
}

export default new DriverService();