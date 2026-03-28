import jwt from "jsonwebtoken";
import { User, Rider, googleDB } from "./auth.model.js";

const VALID_ROLES = new Set(["customer", "rider"]);

const normalizeRole = (role, fallback = "customer") => {
  const normalized = String(role || "")
    .trim()
    .toLowerCase();

  if (normalized === "rider" || normalized === "driver") {
    return "rider";
  }

  if (
    normalized === "customer" ||
    normalized === "user" ||
    normalized === "client"
  ) {
    return "customer";
  }

  return fallback;
};

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
    const cookieToken = req.cookies?.auth_token || null;
    const token = bearerToken || cookieToken;

    if (!token) {
      return res.status(401).json({ message: "Please login first" });
    }

    if (!process.env.JWT_TOKEN) {
      console.error("❌ JWT_TOKEN not set");
      return res.status(500).json({ message: "Server configuration error" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_TOKEN);
      if (!decoded?.id) {
        return res.status(401).json({ message: "Please login first" });
      }
    } catch (err) {
      return res.status(401).json({ message: "Please login first" });
    }

    // Trust the token role since it's cryptographically signed
    const tokenRole = normalizeRole(decoded.role, "customer");

    if (!VALID_ROLES.has(tokenRole)) {
      return res.status(401).json({ message: "Please login first" });
    }

    // Verify user exists with matching role
    let user;
    if (tokenRole === "rider") {
      user = await Rider.findById(decoded.id).select("_id email name role");
    } else {
      user = await User.findById(decoded.id).select("_id email name role");
      if (!user) {
        user = await googleDB
          .findById(decoded.id)
          .select("_id email name role");
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Please login first" });
    }

    // Ensure user has role field (for legacy data compatibility)
    if (!user.role) {
      user.role = tokenRole;
      await user.save();
    }

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: tokenRole,
    };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Please login first" });
  }
};

export const requireRole = (...allowedRoles) => {
  const allowed = new Set(allowedRoles);

  return (req, res, next) => {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (!allowed.has(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};
