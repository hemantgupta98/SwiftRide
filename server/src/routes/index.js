import authRoutes from "../modules/auth/auth.routes.js";
import rideRoutes from "../modules/ride/ride.routes.js";
import notificationRoutes from "../modules/notification/notification.routes.js";
import rideNotificationRoutes from "../modules/rideNotification/rideNotification.routes.js";
import navigationRoutes from "../modules/navigation/navigation.routes.js";
import express from "express";
import { verifyToken } from "../modules/auth/auth.middleware.js";
import { getRideHistoryController } from "../modules/ride/ride.controllers.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/ride", rideRoutes);
router.get("/my-rides", verifyToken, getRideHistoryController);
router.use("/notification", notificationRoutes);
router.use("/ride-notification", rideNotificationRoutes);
router.use("/navigation", navigationRoutes);

export default router;
