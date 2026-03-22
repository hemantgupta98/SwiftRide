import mongoose from "mongoose";
import { hashpassword } from "./auth.hashed.js";

const authUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, default: "" },
    contact: { type: String, default: "" },
    address: { type: String, default: "" },
    bio: { type: String, default: "" },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
  },
  { timestamps: true },
);

authUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await hashpassword(this.password);
});

const User = mongoose.model("customerHistories", authUserSchema);

const authRiderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    vechileNumber: { type: String, required: true },
    vechileType: {
      type: String,
      required: true,
      enum: ["car", "bike", "ev-bike"],
    },
    username: { type: String, default: "" },
    contact: { type: String, default: "" },
    address: { type: String, default: "" },
    bio: { type: String, default: "" },
    isOnline: { type: Boolean, default: false },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
        validate: {
          validator: (value) => Array.isArray(value) && value.length === 2,
          message: "Location coordinates must be [lng, lat]",
        },
      },
    },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
  },
  { timestamps: true },
);

authRiderSchema.index({ location: "2dsphere" });

authRiderSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await hashpassword(this.password);
});

const Rider = mongoose.model("RiderHistories", authRiderSchema);

const loginSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    email: String,
    loginAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const LoginHistory = mongoose.model("UserLoginHistory", loginSchema);

const RiderloginSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
    },
    email: String,
    loginAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const RiderLoginHistory = mongoose.model("RiderLoginHistory", RiderloginSchema);
const resetPasswordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: { type: String, required: true },
    password: { type: String, required: true }, // hashed new password
    confirmPassword: { type: String, required: true }, // hashed confirm password (same as password)
    changedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const googleschema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    googleId: String,
    avatar: String,
    username: { type: String, default: "" },
    contact: { type: String, default: "" },
    address: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
  { timestamps: true },
);

const googleDB = mongoose.model("googlelogin", googleschema);

const ResetPassword = mongoose.model(
  "ResetPassword",
  resetPasswordSchema,
  "resetpassword",
);

export {
  User,
  LoginHistory,
  ResetPassword,
  googleDB,
  Rider,
  RiderLoginHistory,
};
