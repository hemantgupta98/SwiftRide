import express from "express";
import cors from "cors";
import path from "path";
import passport from "passport";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import corsOption from "./config/cors.js";
import allRoutes from "./routes/index.js";
import cookieParser from "cookie-parser";

import "./modules/auth/auth.google.js";

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOption));
app.use(helmet());
app.use(apiLimiter);
app.use(passport.initialize());

app.use("/uploads", express.static(path.join("uploads")));
app.use("/api", allRoutes);

export default app;
