import mongoose from "mongoose";

const navigationHistorySchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiderHistories",
      required: true,
      index: true,
    },
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideBooking",
      required: true,
      index: true,
    },
    stage: {
      type: String,
      enum: ["toPickup", "toDrop", "completed", "cancelled"],
      required: true,
    },
    pickupLocation: {
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
    dropLocation: {
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
    riderLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: false,
        validate: {
          validator: (value) =>
            !value || (Array.isArray(value) && value.length === 2),
          message: "Location coordinates must be [lng, lat]",
        },
      },
    },
    distanceKm: {
      type: Number,
      required: false,
      min: 0,
    },
    durationMinutes: {
      type: Number,
      required: false,
      min: 0,
    },
    routePath: {
      type: {
        type: String,
        enum: ["LineString"],
        default: "LineString",
      },
      coordinates: {
        type: [[[Number]]],
        required: false,
      },
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customerHistories",
      required: false,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "cancelled"],
      default: "in_progress",
    },
  },
  { timestamps: true },
);

// Create geospatial index for location queries
navigationHistorySchema.index({ "pickupLocation.coordinates": "2dsphere" });
navigationHistorySchema.index({ "dropLocation.coordinates": "2dsphere" });
navigationHistorySchema.index({ "riderLocation.coordinates": "2dsphere" });

const NavigationHistory = mongoose.model(
  "NavigationHistory",
  navigationHistorySchema,
  "navigation_history",
);

export default NavigationHistory;
