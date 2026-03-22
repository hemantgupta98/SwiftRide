import authRoutes from "../modules/auth/auth.routes.js";
import rideRoutes from "../modules/ride/ride.routes.js";
import express from "express";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/ride", rideRoutes);

export default router;
