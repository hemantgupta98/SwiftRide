import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
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
//all are set

// Email / password auth
router.post("/signup", signup);
router.post("/ridersignup", ridersignup);
router.get("/me", verifyToken, getProfile);
router.patch("/me", verifyToken, updateProfile);
router.post("/login", Userlogin);
router.post("/riderlogin", Riderlogin);

// OTP
router.post("/otp", registerUser);
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
      const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";
      return res.redirect(`${FRONTEND_URL}/login?oauth=google_not_configured`);
    }

    next();
  },
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/authCustomer?oauth=failed`,
  }),
  (req, res) => {
    const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";
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

      const token = jwt.sign({ id: user._id, email: user.email }, secret, {
        expiresIn: "7d",
      });

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
