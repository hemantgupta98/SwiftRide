import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import rateLimit from "express-rate-limit";
import {
  signup,
  Userlogin,
  Riderlogin,
  registerUser,
  verifyotp,
  resetpassword,
  logout,
  getUserByGmail,
  getProfile,
  updateProfile,
  ridersignup,
  refreshAuthToken,
} from "./auth.controllers.js";
import { sendMailSafe } from "../../utils/mailer.js";
import { verifyToken } from "./auth.middleware.js";

const router = express.Router();
const isGoogleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

const normalizeAuthMode = (value) => (value === "rider" ? "rider" : "customer");

const getOAuthRedirectPathByMode = (mode) =>
  mode === "rider" ? "/rider/home" : "/CuRider";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth requests. Please try again later.",
  },
});
//all are set

// Email / password auth
router.post("/signup", authLimiter, signup);
router.post("/ridersignup", authLimiter, ridersignup);
router.get("/me", verifyToken, getProfile);
router.patch("/me", verifyToken, updateProfile);
router.post("/login", authLimiter, Userlogin);
router.post("/riderlogin", authLimiter, Riderlogin);
router.post("/refresh", refreshAuthToken);

// OTP
router.post("/otp", authLimiter, registerUser);
router.post("/verifyotp", verifyotp);
router.post("/resetpassword", resetpassword);
router.post("/logout", logout);
router.get("/mail-test", async (req, res) => {
  const result = await sendMailSafe({
    to: "yourgmail@gmail.com",
    subject: "SMTP Test",
    text: "SMTP working successfully",
    context: "test",
  });

  return res.json(result);
});

router.get(
  "/google",
  (req, res, next) => {
    if (!isGoogleConfigured) {
      return res.status(503).json({
        success: false,
        message: "Google OAuth is not configured on server",
      });
    }

    next();
  },
  (req, res, next) => {
    const mode = normalizeAuthMode(req.query?.mode);
    return passport.authenticate("google", {
      scope: ["profile", "email"],
      state: mode,
    })(req, res, next);
  },
);

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!isGoogleConfigured) {
      const FRONTEND_URL =
        process.env.FRONTEND_URL ?? "https://swift-ride-seven.vercel.app/";
      return res.redirect(
        `${FRONTEND_URL}/authCuLogin?oauth=google_not_configured`,
      );
    }

    next();
  },
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL ?? "https://swift-ride-seven.vercel.app/"}/authCustomer?oauth=failed`,
  }),
  (req, res) => {
    const FRONTEND_URL =
      process.env.FRONTEND_URL ?? "https://swift-ride-seven.vercel.app/";
    const mode = normalizeAuthMode(req.query?.state);
    const redirectPath = getOAuthRedirectPathByMode(mode);

    try {
      const user = req.user;
      if (!user) {
        return res.redirect(
          `${FRONTEND_URL}/authCustomer?oauth=missing_user&mode=${mode}`,
        );
      }

      const secret = process.env.JWT_TOKEN;
      if (!secret) {
        console.error("JWT_SECRET is missing");
        return res.redirect(
          `${FRONTEND_URL}/authCustomer?oauth=server_misconfig`,
        );
      }

      const role = mode === "rider" ? "rider" : "customer";
      const token = jwt.sign(
        { id: user._id, email: user.email, role },
        secret,
        {
          expiresIn: "7d",
        },
      );

      return res.redirect(
        `${FRONTEND_URL}${redirectPath}?token=${token}&mode=${mode}`,
      );
    } catch (err) {
      return res.redirect(
        `${FRONTEND_URL}/authCustomer?oauth=error&mode=${mode}`,
      );
    }
  },
);

export default router;
