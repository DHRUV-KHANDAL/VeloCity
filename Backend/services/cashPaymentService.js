// src/services/cashPaymentService.js
// Track cash payments for ride-sharing platform
// All payments handled via cash, tracked in system for records

import Ride from "../models/Ride.js";
import Driver from "../models/Driver.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

class CashPaymentService {
  /**
   * Create cash payment record for completed ride
   */
  async createCashPaymentRecord(rideId, paymentDetails) {
    try {
      const ride = await Ride.findById(rideId).populate("rider driver");

      if (!ride) {
        return { success: false, error: "Ride not found" };
      }

      if (ride.paymentStatus === "completed") {
        return { success: false, error: "Payment already recorded" };
      }

      const {
        fareAmount,
        paymentMethod = "cash",
        transactionId = `CASH-${Date.now()}`,
        notes = "",
      } = paymentDetails;

      if (!fareAmount || fareAmount <= 0) {
        return { success: false, error: "Invalid fare amount" };
      }

      // Update ride payment info
      ride.paymentMethod = paymentMethod;
      ride.paymentStatus = "completed";
      ride.fareAmount = fareAmount;
      ride.transactionId = transactionId;
      ride.paymentNotes = notes;
      ride.paymentCompletedAt = new Date();

      await ride.save();

      // Update driver earnings
      await Driver.findByIdAndUpdate(ride.driver._id, {
        $inc: {
          totalEarnings: fareAmount,
          earningsThisMonth: fareAmount,
          pendingPayment: fareAmount, // Driver needs to collect this
        },
      });

      // Update rider stats
      await User.findByIdAndUpdate(ride.rider._id, {
        $inc: { "riderInfo.totalRides": 1 },
      });

      // Update driver stats
      await Driver.findByIdAndUpdate(ride.driver._id, {
        $inc: { totalRides: 1 },
      });

      logger.info(
        `✅ Cash payment recorded for ride ${rideId}: $${fareAmount}`,
      );

      return {
        success: true,
        payment: {
          rideId,
          transactionId,
          fareAmount,
          paymentMethod,
          paymentCompletedAt: ride.paymentCompletedAt,
          driverId: ride.driver._id,
          riderId: ride.rider._id,
        },
      };
    } catch (error) {
      logger.error("❌ Error creating cash payment record:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Record cash collection by driver (settlement)
   */
  async recordCashCollection(driverId, amount, collectedDate = new Date()) {
    try {
      const driver = await Driver.findById(driverId);

      if (!driver) {
        return { success: false, error: "Driver not found" };
      }

      const previousPendingAmount = driver.pendingPayment;

      // Update driver earnings (deduct from pending)
      await Driver.findByIdAndUpdate(driverId, {
        $inc: { pendingPayment: -amount },
      });

      logger.info(
        `💰 Cash collection recorded for driver ${driverId}: $${amount}`,
      );

      return {
        success: true,
        collection: {
          driverId,
          amountCollected: amount,
          previousPendingAmount,
          newPendingAmount: previousPendingAmount - amount,
          collectionDate,
          transactionId: `COLLECTION-${driverId}-${Date.now()}`,
        },
      };
    } catch (error) {
      logger.error("❌ Error recording cash collection:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get driver earnings summary
   */
  async getDriverEarnings(driverId) {
    try {
      const driver = await Driver.findById(driverId);

      if (!driver) {
        return { success: false, error: "Driver not found" };
      }

      // Get rides from this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyRides = await Ride.find({
        driver: driverId,
        paymentStatus: "completed",
        paymentCompletedAt: { $gte: startOfMonth },
      }).select("fareAmount");

      const monthlyTotal = monthlyRides.reduce(
        (sum, ride) => sum + (ride.fareAmount || 0),
        0,
      );

      return {
        success: true,
        earnings: {
          driverId,
          totalEarnings: driver.totalEarnings,
          earningsThisMonth: monthlyTotal,
          pendingPayment: driver.pendingPayment,
          totalRides: driver.totalRides,
          averageEarningsPerRide:
            driver.totalRides > 0
              ? (driver.totalEarnings / driver.totalRides).toFixed(2)
              : 0,
        },
      };
    } catch (error) {
      logger.error("❌ Error fetching driver earnings:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get cash payment history
   */
  async getCashPaymentHistory(filters = {}) {
    try {
      const {
        driverId,
        riderId,
        startDate,
        endDate,
        limit = 50,
        skip = 0,
      } = filters;

      const query = { paymentStatus: "completed" };

      if (driverId) query.driver = driverId;
      if (riderId) query.rider = riderId;

      if (startDate || endDate) {
        query.paymentCompletedAt = {};
        if (startDate) query.paymentCompletedAt.$gte = new Date(startDate);
        if (endDate) query.paymentCompletedAt.$lte = new Date(endDate);
      }

      const payments = await Ride.find(query)
        .populate("driver rider", "name email")
        .select(
          "fareAmount transactionId paymentCompletedAt pickupLocation dropoffLocation",
        )
        .sort({ paymentCompletedAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Ride.countDocuments(query);

      return {
        success: true,
        payments,
        pagination: { total, limit, skip, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error("❌ Error fetching payment history:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate daily settlement report
   */
  async generateDailySettlementReport(date = new Date()) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const dailyRides = await Ride.find({
        paymentStatus: "completed",
        paymentCompletedAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).populate("driver", "name _id");

      const report = {
        date: date.toDateString(),
        totalRides: dailyRides.length,
        totalRevenue: dailyRides.reduce(
          (sum, ride) => sum + (ride.fareAmount || 0),
          0,
        ),
        ridesByDriver: {},
      };

      // Group by driver
      for (const ride of dailyRides) {
        const driverId = ride.driver._id.toString();
        if (!report.ridesByDriver[driverId]) {
          report.ridesByDriver[driverId] = {
            driverName: ride.driver.name,
            rides: 0,
            earnings: 0,
          };
        }
        report.ridesByDriver[driverId].rides++;
        report.ridesByDriver[driverId].earnings += ride.fareAmount || 0;
      }

      logger.info(
        `📊 Daily settlement report generated for ${date.toDateString()}`,
      );

      return { success: true, report };
    } catch (error) {
      logger.error("❌ Error generating settlement report:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new CashPaymentService();
