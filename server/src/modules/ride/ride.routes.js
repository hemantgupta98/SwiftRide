import express from "express";
import {
  bookRideController,
  findNearbyRidersController,
  updateRiderLocationController,
} from "./ride.controllers.js";

const router = express.Router();

router.patch("/rider/location", updateRiderLocationController);
router.get("/nearby-riders", findNearbyRidersController);
router.post("/book-ride", bookRideController);

export default router;
