import express from "express";
import {
  bookRideController,
  findNearbyRidersController,
  getRideHistoryController,
  updateRiderLocationController,
} from "./ride.controllers.js";
import { verifyToken } from "../auth/auth.middleware.js";

const router = express.Router();

router.patch("/rider/location", updateRiderLocationController);
router.get("/nearby-riders", findNearbyRidersController);
router.post("/book-ride", bookRideController);
router.get("/history", verifyToken, getRideHistoryController);

export default router;
