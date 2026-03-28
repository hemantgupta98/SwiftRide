import express from "express";
import {
  createNavigationHistory,
  getRiderNavigationHistory,
  updateNavigationHistory,
  getActiveNavigation,
  completeNavigation,
  cancelNavigation,
} from "./navigation.controllers.js";
import authMiddleware from "../auth/auth.middleware.js";

const router = express.Router();

// Create a new navigation history record
router.post("/", authMiddleware, createNavigationHistory);

// Get navigation history for a rider
router.get("/rider/:riderId", getRiderNavigationHistory);

// Get active navigation for a rider
router.get("/rider/:riderId/active", getActiveNavigation);

// Update navigation history (add location updates, etc.)
router.patch("/:navigationId", authMiddleware, updateNavigationHistory);

// Complete a navigation
router.put("/:navigationId/complete", authMiddleware, completeNavigation);

// Cancel a navigation
router.put("/:navigationId/cancel", authMiddleware, cancelNavigation);

export default router;
