import express from "express";
import auth from "../middleware/auth.js";
import Driver from "../models/Driver.js";
import Ride from "../models/Ride.js";

const router = express.Router();

// Root route to confirm API is working
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚗 VeloCity Driver API is working!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    endpoints: {
      dashboard: "GET /api/driver/dashboard (protected)",
      status: "PATCH /api/driver/status (protected)",
      availableRides: "GET /api/driver/rides/available (protected)",
    },
  });
});

// Get driver dashboard data
router.get("/dashboard", auth, async (req, res) => {
  try {
    // Find driver, creating if not exists
    let driver = await Driver.findOne({ user: req.user._id }).populate("user");

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: "Driver profile not found",
      });
    }

    // Calculate today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRides = await Ride.find({
      driver: driver._id,
      status: "completed",
      completedAt: { $gte: today },
    });

    // Calculate total earnings (assuming each ride has a fare)
    const todayEarnings = todayRides.reduce(
      (total, ride) => total + (ride.fare?.total || 0),
      0,
    );

    // Prepare dashboard data
    const dashboardData = {
      driver: {
        name: driver.user.name,
        rating: driver.rating || 0,
        totalRides: driver.totalRides || 0,
        isOnline: driver.isOnline || false,
        vehicleType: driver.vehicleType,
        vehicleNumber: driver.vehicleNumber,
      },
      todayStats: {
        rides: todayRides.length,
        earnings: todayEarnings,
        rating: driver.rating || 0,
        hours: driver.onlineHoursToday || 0,
      },
      recentActivity: todayRides.slice(0, 5).map((ride) => ({
        type: "ride_completed",
        location: ride.dropoffLocation?.address || "Unknown location",
        amount: ride.fare?.total || 0,
        time: ride.completedAt,
      })),
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Driver dashboard error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      details: error.message,
    });
  }
});

// Toggle driver online/offline status
router.patch("/status", auth, async (req, res) => {
  try {
    const { isOnline } = req.body;

    const driver = await Driver.findOne({ user: req.user._id });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: "Driver profile not found",
      });
    }

    driver.isOnline = isOnline;
    driver.lastOnlineTime = new Date();

    await driver.save();

    res.json({
      success: true,
      data: {
        isOnline: driver.isOnline,
        lastOnlineTime: driver.lastOnlineTime,
      },
    });
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      details: error.message,
    });
  }
});

// Get available rides for the driver
router.get("/rides/available", auth, async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });

    if (!driver || !driver.isOnline) {
      return res.json({ success: true, data: [] });
    }

    const availableRides = await Ride.find({
      status: "requested",
      $or: [
        { preferredVehicleType: driver.vehicleType },
        { preferredVehicleType: { $exists: false } },
      ],
    }).populate("rider", "name rating");

    res.json({
      success: true,
      data: availableRides,
    });
  } catch (error) {
    console.error("Available rides error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      details: error.message,
    });
  }
});

export default router;
