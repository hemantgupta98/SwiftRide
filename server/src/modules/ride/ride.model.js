import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 2,
        message: "Location coordinates must be [lng, lat]",
      },
    },
    label: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const rideSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customerHistories",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customerHistories",
      required: true,
      index: true,
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiderHistories",
      default: null,
      index: true,
    },
    pickup: {
      type: locationSchema,
      required: true,
    },
    drop: {
      type: locationSchema,
      required: true,
    },
    distanceKm: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    fareAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "searching",
        "accepted",
        "started",
        "timeout",
        "cancelled",
        "completed",
      ],
      default: "searching",
      index: true,
    },
    requestedRiderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RiderHistories",
      },
    ],
    declinedRiderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RiderHistories",
      },
    ],
    acceptedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

rideSchema.pre("validate", function (next) {
  if (!this.customerId && this.userId) {
    this.customerId = this.userId;
  }

  if (!this.userId && this.customerId) {
    this.userId = this.customerId;
  }

  next();
});

const Ride = mongoose.model("RideBooking", rideSchema, "ride_bookings");

export default Ride;
