import mongoose from "mongoose";

const rideNotificationSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiderHistories",
      required: true,
      index: true,
    },
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideBooking",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "RIDE_COMES",
        "RIDE_CANCELLED",
        "RIDE_TIMEOUT",
        "RIDE_TAKEN",
        "RIDE_ACCEPTED",
        "RIDE_DECLINED",
      ],
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

export const RideNotification = mongoose.model(
  "RideNotification",
  rideNotificationSchema,
  "ride_notification_db",
);
