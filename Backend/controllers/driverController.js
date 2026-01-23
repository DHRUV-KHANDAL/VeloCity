/**
 * Driver Controller
 * Handles HTTP requests for driver operations
 */

import Driver from '../models/Driver.js';
import User from '../models/User.js';
import Ride from '../models/Ride.js';
import driverService from '../services/driverService.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, RIDE_STATUS } from '../config/constants.js';

class DriverController {
  /**
   * Get driver profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user._id;
      
      const driver = await Driver.findOne({ user: userId })
        .populate('user', 'name email phone avatar');
      
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: ERROR_MESSAGES.DRIVER_NOT_FOUND
        });
      }

      res.json({
        success: true,
        data: { driver }
      });
    } catch (error) {
      console.error('❌ Get driver profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  /**
   * Update driver location
   */
  async updateLocation(req, res) {
    try {
      const { lat, lng, heading } = req.body;
      const userId = req.user._id;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required'
        });
      }

      const result = await driverService.updateLocation(userId, {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        heading: heading ? parseFloat(heading) : null
      });

      res.json(result);
    } catch (error) {
      console.error('❌ Update location error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  /**
   * Toggle driver online/offline status
   */
  async toggleStatus(req, res) {
    try {
      const { isOnline } = req.body;
      const userId = req.user._id;

      const result = await driverService.toggleStatus(userId, isOnline);
      
      res.json({
        success: true,
        data: result,
        message: isOnline 
          ? 'Driver is now online and accepting rides' 
          : 'Driver is now offline'
      });
    } catch (error) {
      console.error('❌ Toggle status error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  /**
   * Get available rides for driver
   */
  async getAvailableRides(req, res) {
    try {
      const userId = req.user._id;
      const driver = await Driver.findOne({ user: userId });

      if (!driver || !driver.isOnline) {
        return res.json({
          success: true,
          data: [],
          message: 'Driver is offline'
        });
      }

      // Get available rides matching driver's vehicle type
      const availableRides = await Ride.find({
        status: RIDE_STATUS.REQUESTED,
        $or: [
          { vehicleType: driver.vehicleType },
          { vehicleType: { $exists: false } }
        ]
      })
        .populate('rider', 'name rating')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: availableRides
      });
    } catch (error) {
      console.error('❌ Get available rides error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  /**
   * Get driver dashboard data
   */
  async getDashboard(req, res) {
    try {
      const userId = req.user._id;
      
      const driver = await Driver.findOne({ user: userId })
        .populate('user', 'name email phone');
      
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: ERROR_MESSAGES.DRIVER_NOT_FOUND
        });
      }

      // Calculate today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayRides = await Ride.find({
        driver: driver._id,
        status: RIDE_STATUS.COMPLETED,
        completedAt: { $gte: today }
      });

      const todayEarnings = todayRides.reduce((total, ride) => 
        total + (ride.fare?.total || 0), 0);

      // Get recent activity
      const recentRides = await Ride.find({
        driver: driver._id
      })
        .populate('rider', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

      // Get weekly earnings
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      
      const weeklyRides = await Ride.find({
        driver: driver._id,
        status: RIDE_STATUS.COMPLETED,
        completedAt: { $gte: weekStart }
      });

      const weeklyEarnings = weeklyRides.reduce((total, ride) => 
        total + (ride.fare?.total || 0), 0);

      const dashboardData = {
        driver: {
          name: driver.user.name,
          rating: driver.rating || 0,
          totalRides: driver.totalRides || 0,
          isOnline: driver.isOnline || false,
          vehicleType: driver.vehicleType,
          vehicleNumber: driver.vehicleNumber,
          licenseNumber: driver.licenseNumber
        },
        stats: {
          today: {
            rides: todayRides.length,
            earnings: todayEarnings,
            hours: driver.onlineHoursToday || 0
          },
          weekly: {
            rides: weeklyRides.length,
            earnings: weeklyEarnings
          },
          allTime: {
            rides: driver.totalRides || 0,
            earnings: driver.totalEarnings || 0,
            rating: driver.rating || 0
          }
        },
        recentActivity: recentRides.map(ride => ({
          rideId: ride._id,
          riderName: ride.rider?.name || 'Unknown',
          status: ride.status,
          amount: ride.fare?.total || 0,
          time: ride.completedAt || ride.createdAt
        }))
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('❌ Get dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  /**
   * Get driver earnings report
   */
  async getEarnings(req, res) {
    try {
      const userId = req.user._id;
      const { period = 'today' } = req.query;

      const driver = await Driver.findOne({ user: userId });
      
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: ERROR_MESSAGES.DRIVER_NOT_FOUND
        });
      }

      const result = await driverService.getEarningsReport(userId, period);
      res.json(result);
    } catch (error) {
      console.error('❌ Get earnings error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  /**
   * Update driver profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user._id;
      const updates = req.body;

      const driver = await Driver.findOne({ user: userId });
      
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: ERROR_MESSAGES.DRIVER_NOT_FOUND
        });
      }

      // Update driver fields
      Object.assign(driver, updates);
      await driver.save();

      // Update user fields if provided
      if (updates.name || updates.phone) {
        await User.findByIdAndUpdate(userId, {
          name: updates.name,
          phone: updates.phone
        }, { new: true });
      }

      res.json({
        success: true,
        data: { driver },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('❌ Update driver profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  /**
   * Get driver's current ride
   */
  async getCurrentRide(req, res) {
    try {
      const userId = req.user._id;

      const driver = await Driver.findOne({ user: userId });
      
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: ERROR_MESSAGES.DRIVER_NOT_FOUND
        });
      }

      if (!driver.currentRide) {
        return res.json({
          success: true,
          data: null,
          message: 'No active ride'
        });
      }

      const ride = await Ride.findById(driver.currentRide)
        .populate('rider', 'name phone')
        .populate('driver', 'name vehicleType vehicleNumber');

      res.json({
        success: true,
        data: { ride }
      });
    } catch (error) {
      console.error('❌ Get current ride error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
}

export default new DriverController();