import express from "express";
import {
  createNotificationForUser,
  getNotifications,
  markAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "./notification.controllers.js";
import { verifyToken } from "../../middleware/main.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createNotificationForUser);

router.get("/", verifyToken, getNotifications);

router.patch("/:id/read", verifyToken, markAsRead);

router.delete("/:id", verifyToken, deleteNotification);

router.delete("/", verifyToken, deleteAllNotifications);

export default router;
