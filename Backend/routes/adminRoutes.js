// src/routes/adminRoutes.js
// Admin panel routes for driver approval and platform management
// Protected by admin-only middleware

import express from "express";
import adminController from "../controllers/adminController.js";
import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/validation.js";

const router = express.Router();

/**
 * Middleware to ensure admin access
 */
const adminAuth = [auth, adminOnly];

// Driver Approval Routes
router.get("/drivers/pending", adminAuth, adminController.getPendingDrivers);
router.get("/drivers/approved", adminAuth, adminController.getApprovedDrivers);
router.post(
  "/drivers/:driverId/approve",
  adminAuth,
  adminController.approveDriver,
);
router.post(
  "/drivers/:driverId/reject",
  adminAuth,
  adminController.rejectDriver,
);
router.post(
  "/drivers/:driverId/suspend",
  adminAuth,
  adminController.suspendDriver,
);
router.post(
  "/drivers/:driverId/unsuspend",
  adminAuth,
  adminController.unsuspendDriver,
);

// Platform Statistics
router.get("/stats", adminAuth, adminController.getPlatformStats);

// Cash Settlement & Earnings
router.get(
  "/settlement/report",
  adminAuth,
  adminController.getSettlementReport,
);
router.get(
  "/drivers/:driverId/earnings",
  adminAuth,
  adminController.getDriverEarnings,
);
router.post(
  "/drivers/:driverId/cash-collection",
  adminAuth,
  adminController.recordCashCollection,
);

export default router;
