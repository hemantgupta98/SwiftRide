import express from "express";
import { verifyToken } from "../auth/auth.middleware.js";
import {
  createRideNotificationForRider,
  deleteAllRideNotifications,
  deleteRideNotification,
  getRideNotifications,
  markRideNotificationAsRead,
} from "./rideNotification.controllers.js";

const router = express.Router();

router.post("/", verifyToken, createRideNotificationForRider);
router.get("/", verifyToken, getRideNotifications);
router.patch("/:id/read", verifyToken, markRideNotificationAsRead);
router.delete("/:id", verifyToken, deleteRideNotification);
router.delete("/", verifyToken, deleteAllRideNotifications);

export default router;
