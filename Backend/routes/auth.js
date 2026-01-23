import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Driver from "../models/Driver.js";

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  try {
    console.log("🔐 Registration attempt:", req.body);

    const {
      name,
      email,
      password,
      phone,
      role,
      licenseNumber,
      licenseExpiry,
      vehicleType,
      vehicleNumber,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email",
      });
    }

    if (!role || !["rider", "driver"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Role is required and must be either rider or driver",
      });
    }

    if (role === "driver") {
      if (!licenseNumber || !licenseExpiry || !vehicleType || !vehicleNumber) {
        return res.status(400).json({
          success: false,
          error:
            "Driver registration requires licenseNumber, licenseExpiry, vehicleType, and vehicleNumber",
        });
      }

      const parsedExpiry = new Date(licenseExpiry);
      if (Number.isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({
          success: false,
          error: "licenseExpiry must be a valid date",
        });
      }
    }

    const user = new User({
      name,
      email,
      password,
      phone,
      role,
    });

    await user.save();
    console.log("✅ User saved successfully:", user.email);

    if (role === "driver") {
      const parsedExpiry = new Date(licenseExpiry);
      await Driver.create({
        user: user._id,
        licenseNumber,
        licenseExpiry: parsedExpiry,
        vehicleType,
        vehicleNumber,
        isOnline: false,
        rating: 0,
        totalRides: 0,
        onlineHoursToday: 0,
        currentLocation: {
          lat: 0,
          lng: 0,
        },
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role, // Include role in token payload
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt for:", req.body.email);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const isMatch = await user.correctPassword(password);
    console.log("🔑 Password match:", isMatch);

    if (!isMatch) {
      console.log("❌ Invalid password for:", email);
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("✅ Login successful for:", user.email);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
});

// Debug route - Check all users in database
router.get("/debug-users", async (req, res) => {
  try {
    const users = await User.find().select("name email role phone");
    console.log("👥 All users in database:", users);

    res.json({
      success: true,
      data: {
        count: users.length,
        users,
      },
    });
  } catch (error) {
    console.error("Debug users error:", error);
    res.status(500).json({
      success: false,
      error: "Debug failed",
    });
  }
});

export default router;
