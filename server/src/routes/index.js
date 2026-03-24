import authRoutes from "../modules/auth/auth.routes.js";
import rideRoutes from "../modules/ride/ride.routes.js";
import notificationRoutes from "../modules/notification/notification.routes.js";
import rideNotificationRoutes from "../modules/rideNotification/rideNotification.routes.js";
import express from "express";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/ride", rideRoutes);
router.use("/notification", notificationRoutes);
router.use("/ride-notification", rideNotificationRoutes);

export default router;
