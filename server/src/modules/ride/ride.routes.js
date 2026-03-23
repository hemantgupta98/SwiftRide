import express from "express";
import {
  bookRideController,
  claimRewardController,
  findNearbyRidersController,
  getRewardsStatusController,
  getRideHistoryController,
  updateRiderLocationController,
} from "./ride.controllers.js";
import { verifyToken } from "../auth/auth.middleware.js";

const router = express.Router();

router.patch("/rider/location", updateRiderLocationController);
router.get("/nearby-riders", findNearbyRidersController);
router.post("/book-ride", bookRideController);
router.get("/history", verifyToken, getRideHistoryController);
router.get("/rewards/status", verifyToken, getRewardsStatusController);
router.post("/rewards/claim", verifyToken, claimRewardController);

export default router;
