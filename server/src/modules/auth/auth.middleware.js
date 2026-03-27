import jwt from "jsonwebtoken";
import { User, Rider, googleDB } from "./auth.model.js";

const VALID_ROLES = new Set(["customer", "rider"]);

const resolveUserById = async (id) => {
  let user = await User.findById(id).select("_id email name role");
  if (user) {
    return { user, role: user.role || "customer" };
  }

  user = await googleDB.findById(id).select("_id email name role");
  if (user) {
    return { user, role: user.role || "customer" };
  }

  user = await Rider.findById(id).select("_id email name role");
  if (user) {
    return { user, role: user.role || "rider" };
  }

  return { user: null, role: null };
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

    const { user, role } = await resolveUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Please login first" });
    }

    const tokenRole = decoded.role;
    if (tokenRole && VALID_ROLES.has(tokenRole) && tokenRole !== role) {
      return res.status(401).json({ message: "Please login first" });
    }

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role,
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
