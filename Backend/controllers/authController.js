/**
 * Authentication Controller
 * Handles user registration, login, profile, and logout
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Driver from "../models/Driver.js";
import {
  JWT_CONFIG,
  USER_ROLES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../config/constants.js";

class AuthController {
  /**
   * Register a new user (rider or driver)
   */
  async register(req, res) {
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

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: ERROR_MESSAGES.USER_EXISTS,
        });
      }

      // Validate role
      if (!role || !USER_ROLES.ALL.includes(role)) {
        return res.status(400).json({
          success: false,
          error: "Role is required and must be either rider or driver",
        });
      }

      // Additional validation for driver registration
      if (role === USER_ROLES.DRIVER) {
        if (
          !licenseNumber ||
          !licenseExpiry ||
          !vehicleType ||
          !vehicleNumber
        ) {
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

      // Create user
      const user = new User({
        name,
        email,
        password,
        phone,
        role,
      });

      await user.save();
      console.log("✅ User saved successfully:", user.email);

      // Create driver profile if role is driver
      if (role === USER_ROLES.DRIVER) {
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

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
        },
        JWT_CONFIG.SECRET_KEY,
        { expiresIn: JWT_CONFIG.EXPIRES_IN },
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
        message: SUCCESS_MESSAGES.USER_CREATED,
      });
    } catch (error) {
      console.error("❌ Registration error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error",
      });
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      console.log("🔐 Login attempt for:", req.body.email);

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        console.log("❌ User not found:", email);
        return res.status(400).json({
          success: false,
          error: ERROR_MESSAGES.INVALID_CREDENTIALS,
        });
      }

      // Check password
      const isMatch = await user.correctPassword(password);
      console.log("🔑 Password match:", isMatch);

      if (!isMatch) {
        console.log("❌ Invalid password for:", email);
        return res.status(400).json({
          success: false,
          error: ERROR_MESSAGES.INVALID_CREDENTIALS,
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_CONFIG.SECRET_KEY,
        { expiresIn: JWT_CONFIG.EXPIRES_IN },
      );

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
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      });
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      // User is attached by auth middleware
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: ERROR_MESSAGES.UNAUTHORIZED,
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
            isVerified: user.isVerified,
            avatar: user.avatar,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }

  /**
   * Logout user (client-side token removal)
   */
  async logout(req, res) {
    try {
      // Note: JWT is stateless, so we rely on client to remove token
      // For enhanced security, you could implement token blacklisting with Redis

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== USER_ROLES.ADMIN) {
        return res.status(403).json({
          success: false,
          error: "Admin access required",
        });
      }

      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: {
          users,
          count: users.length,
        },
      });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user._id;
      const updates = req.body;

      // Remove fields that shouldn't be updated
      delete updates.password;
      delete updates.email;
      delete updates.role;

      const user = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      res.json({
        success: true,
        data: { user },
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      // Verify current password
      const isMatch = await user.correctPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
}

export default new AuthController();
