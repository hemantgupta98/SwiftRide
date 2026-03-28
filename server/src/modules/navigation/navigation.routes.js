import express from "express";
import {
  createNavigationHistory,
  getRiderNavigationHistory,
  updateNavigationHistory,
  getActiveNavigation,
  completeNavigation,
  cancelNavigation,
} from "./navigation.controllers.js";
import { verifyToken } from "../auth/auth.middleware.js";

const router = express.Router();

// Create a new navigation history record
router.post("/", verifyToken, createNavigationHistory);

// Get navigation history for a rider
router.get("/rider/:riderId", getRiderNavigationHistory);

// Get active navigation for a rider
router.get("/rider/:riderId/active", getActiveNavigation);

// Update navigation history (add location updates, etc.)
router.patch("/:navigationId", verifyToken, updateNavigationHistory);

// Complete a navigation
router.put("/:navigationId/complete", verifyToken, completeNavigation);

// Cancel a navigation
router.put("/:navigationId/cancel", verifyToken, cancelNavigation);

export default router;
