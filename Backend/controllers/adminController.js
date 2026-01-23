// src/controllers/adminController.js
// Admin panel controller for driver approval and platform management

import Driver from "../models/Driver.js";
import User from "../models/User.js";
import Ride from "../models/Ride.js";
import logger from "../utils/logger.js";
import cashPaymentService from "../services/cashPaymentService.js";

class AdminController {
  /**
   * Get pending driver approvals
   */
  async getPendingDrivers(req, res) {
    try {
      const { limit = 20, skip = 0 } = req.query;

      const drivers = await Driver.find({ approvalStatus: "pending" })
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await Driver.countDocuments({ approvalStatus: "pending" });

      res.json({
        success: true,
        drivers,
        pagination: { total, limit: parseInt(limit), skip: parseInt(skip) },
      });
    } catch (error) {
      logger.error("❌ Error fetching pending drivers:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get all approved drivers
   */
  async getApprovedDrivers(req, res) {
    try {
      const { limit = 20, skip = 0 } = req.query;

      const drivers = await Driver.find({ approvalStatus: "approved" })
        .populate("user", "name email phone rating")
        .sort({ rating: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await Driver.countDocuments({ approvalStatus: "approved" });

      res.json({
        success: true,
        drivers,
        pagination: { total, limit: parseInt(limit), skip: parseInt(skip) },
      });
    } catch (error) {
      logger.error("❌ Error fetching approved drivers:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Approve driver registration
   */
  async approveDriver(req, res) {
    try {
      const { driverId } = req.params;
      const { notes = "" } = req.body;
      const adminId = req.user._id;

      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res
          .status(404)
          .json({ success: false, error: "Driver not found" });
      }

      if (driver.approvalStatus !== "pending") {
        return res.status(400).json({
          success: false,
          error: `Driver status is already ${driver.approvalStatus}`,
        });
      }

      // Update driver status
      driver.approvalStatus = "approved";
      driver.approvedBy = adminId;
      driver.approvalDate = new Date();
      driver.approvalNotes = notes;
      driver.kycVerified = true;
      driver.kycVerificationDate = new Date();

      await driver.save();

      // Update user role confirmation
      await User.findByIdAndUpdate(driver.user, {
        isVerified: true,
      });

      logger.info(`✅ Driver ${driverId} approved by admin ${adminId}`);

      // Send email to driver (driver approved notification)
      // TODO: Integrate email service for driver approval notification

      res.json({
        success: true,
        message: "Driver approved successfully",
        driver,
      });
    } catch (error) {
      logger.error("❌ Error approving driver:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Reject driver registration
   */
  async rejectDriver(req, res) {
    try {
      const { driverId } = req.params;
      const { reason = "" } = req.body;
      const adminId = req.user._id;

      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res
          .status(404)
          .json({ success: false, error: "Driver not found" });
      }

      if (driver.approvalStatus !== "pending") {
        return res.status(400).json({
          success: false,
          error: `Can only reject pending drivers`,
        });
      }

      // Update driver status
      driver.approvalStatus = "rejected";
      driver.approvalNotes = reason;

      await driver.save();

      logger.info(`❌ Driver ${driverId} rejected by admin ${adminId}`);

      res.json({
        success: true,
        message: "Driver rejected successfully",
        driver,
      });
    } catch (error) {
      logger.error("❌ Error rejecting driver:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Suspend driver
   */
  async suspendDriver(req, res) {
    try {
      const { driverId } = req.params;
      const { reason = "" } = req.body;

      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res
          .status(404)
          .json({ success: false, error: "Driver not found" });
      }

      // Update driver status
      driver.approvalStatus = "suspended";
      driver.suspensionReason = reason;
      driver.suspensionDate = new Date();
      driver.isOnline = false;

      await driver.save();

      logger.warn(`⚠️  Driver ${driverId} suspended: ${reason}`);

      res.json({
        success: true,
        message: "Driver suspended successfully",
        driver,
      });
    } catch (error) {
      logger.error("❌ Error suspending driver:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Unsuspend driver
   */
  async unsuspendDriver(req, res) {
    try {
      const { driverId } = req.params;

      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res
          .status(404)
          .json({ success: false, error: "Driver not found" });
      }

      if (driver.approvalStatus !== "suspended") {
        return res.status(400).json({
          success: false,
          error: "Driver is not suspended",
        });
      }

      driver.approvalStatus = "approved";
      driver.suspensionReason = null;
      driver.suspensionDate = null;

      await driver.save();

      logger.info(`✅ Driver ${driverId} unsuspended`);

      res.json({
        success: true,
        message: "Driver unsuspended successfully",
        driver,
      });
    } catch (error) {
      logger.error("❌ Error unsuspending driver:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats(req, res) {
    try {
      const [
        totalUsers,
        totalDrivers,
        approvedDrivers,
        totalRides,
        totalRevenue,
      ] = await Promise.all([
        User.countDocuments(),
        Driver.countDocuments(),
        Driver.countDocuments({ approvalStatus: "approved" }),
        Ride.countDocuments({ status: "completed" }),
        Ride.aggregate([
          { $match: { paymentStatus: "completed" } },
          { $group: { _id: null, total: { $sum: "$fareAmount" } } },
        ]),
      ]);

      const totalRevenueAmount = totalRevenue[0]?.total || 0;

      // Get daily stats
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [todayRides, todayRevenue] = await Promise.all([
        Ride.countDocuments({
          paymentStatus: "completed",
          paymentCompletedAt: { $gte: startOfDay },
        }),
        Ride.aggregate([
          {
            $match: {
              paymentStatus: "completed",
              paymentCompletedAt: { $gte: startOfDay },
            },
          },
          { $group: { _id: null, total: { $sum: "$fareAmount" } } },
        ]),
      ]);

      const todayRevenueAmount = todayRevenue[0]?.total || 0;

      res.json({
        success: true,
        stats: {
          users: {
            total: totalUsers,
            drivers: totalDrivers,
            riders: totalUsers - totalDrivers,
            approvedDrivers,
          },
          rides: {
            total: totalRides,
            today: todayRides,
          },
          revenue: {
            total: parseFloat(totalRevenueAmount.toFixed(2)),
            today: parseFloat(todayRevenueAmount.toFixed(2)),
          },
          platform: {
            avgRideValue:
              totalRides > 0
                ? parseFloat((totalRevenueAmount / totalRides).toFixed(2))
                : 0,
          },
        },
      });
    } catch (error) {
      logger.error("❌ Error fetching platform stats:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get cash settlement report
   */
  async getSettlementReport(req, res) {
    try {
      const { date } = req.query;
      const reportDate = date ? new Date(date) : new Date();

      const result =
        await cashPaymentService.generateDailySettlementReport(reportDate);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        report: result.report,
      });
    } catch (error) {
      logger.error("❌ Error generating settlement report:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get driver earnings
   */
  async getDriverEarnings(req, res) {
    try {
      const { driverId } = req.params;

      const result = await cashPaymentService.getDriverEarnings(driverId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("❌ Error fetching driver earnings:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Record cash collection from driver
   */
  async recordCashCollection(req, res) {
    try {
      const { driverId } = req.params;
      const { amount, notes = "" } = req.body;

      if (!amount || amount <= 0) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid amount" });
      }

      const result = await cashPaymentService.recordCashCollection(
        driverId,
        amount,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      logger.info(
        `💰 Cash collection recorded: $${amount} from driver ${driverId}`,
      );

      res.json(result);
    } catch (error) {
      logger.error("❌ Error recording cash collection:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new AdminController();
