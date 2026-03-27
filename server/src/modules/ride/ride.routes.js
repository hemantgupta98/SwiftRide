import express from "express";
import {
  bookRideController,
  claimRewardController,
  findNearbyRidersController,
  getRewardsStatusController,
  getRideHistoryController,
  updateRiderLocationController,
} from "./ride.controllers.js";
import { requireRole, verifyToken } from "../auth/auth.middleware.js";

const router = express.Router();

router.patch(
  "/rider/location",
  verifyToken,
  requireRole("rider"),
  updateRiderLocationController,
);
router.get("/nearby-riders", findNearbyRidersController);
router.post(
  "/book-ride",
  verifyToken,
  requireRole("customer"),
  bookRideController,
);
router.get("/history", verifyToken, getRideHistoryController);
router.get("/my-rides", verifyToken, getRideHistoryController);
router.get(
  "/rewards/status",
  verifyToken,
  requireRole("customer"),
  getRewardsStatusController,
);
router.post(
  "/rewards/claim",
  verifyToken,
  requireRole("customer"),
  claimRewardController,
);

export default router;
