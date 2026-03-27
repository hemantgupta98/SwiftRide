import jwt from "jsonwebtoken";
import { comparePassword, hashpassword } from "./auth.hashed.js";
import {
  LoginHistory,
  User,
  googleDB,
  RiderLoginHistory,
  Rider,
} from "./auth.model.js";
import {
  createUser,
  findUserByEmail,
  findRiderByEmail,
  createResetPasswordRecord,
  createRider,
} from "./auth.service.js";
import sendOtp from "./auth.gmail.js";
import { isMailConfigured } from "../../utils/mailer.js";

const ACCESS_COOKIE_NAME = "auth_token";
const REFRESH_COOKIE_NAME = "refresh_token";
const ACCESS_TOKEN_TTL = "20h";
const REFRESH_TOKEN_TTL = "7d";
const ACCESS_TOKEN_MAX_AGE_MS = 20 * 60 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge,
  };
};

const getJwtSecrets = () => {
  const accessSecret = process.env.JWT_TOKEN;
  const refreshSecret = process.env.JWT_REFRESH_TOKEN || process.env.JWT_TOKEN;

  if (!accessSecret || !refreshSecret) {
    throw new Error("JWT secrets are missing");
  }

  return { accessSecret, refreshSecret };
};

const signAccessToken = ({ id, role, email }) => {
  const { accessSecret } = getJwtSecrets();
  return jwt.sign({ id, role, email, tokenType: "access" }, accessSecret, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
};

const signRefreshToken = ({ id, role }) => {
  const { refreshSecret } = getJwtSecrets();
  return jwt.sign({ id, role, tokenType: "refresh" }, refreshSecret, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
};

const setAuthCookies = ({ res, accessToken, refreshToken }) => {
  res.cookie(
    ACCESS_COOKIE_NAME,
    accessToken,
    getCookieOptions(ACCESS_TOKEN_MAX_AGE_MS),
  );
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    getCookieOptions(REFRESH_TOKEN_MAX_AGE_MS),
  );
};

const clearAuthCookies = (res) => {
  res.clearCookie(
    ACCESS_COOKIE_NAME,
    getCookieOptions(ACCESS_TOKEN_MAX_AGE_MS),
  );
  res.clearCookie(
    REFRESH_COOKIE_NAME,
    getCookieOptions(REFRESH_TOKEN_MAX_AGE_MS),
  );
  res.clearCookie("token", getCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
};

const issueTokenPairAndPersist = async ({ res, user, role }) => {
  const normalizedRole = role === "rider" ? "rider" : "customer";
  const accessToken = signAccessToken({
    id: user._id,
    role: normalizedRole,
    email: user.email,
  });
  const refreshToken = signRefreshToken({
    id: user._id,
    role: normalizedRole,
  });

  user.refreshTokenHash = await hashpassword(refreshToken);
  user.refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
  await user.save();

  setAuthCookies({ res, accessToken, refreshToken });

  return { accessToken, refreshToken };
};

const resolveUserByIdAndRole = async ({ userId, role }) => {
  if (role === "rider") {
    return Rider.findById(userId);
  }

  let user = await User.findById(userId);
  if (!user) {
    user = await googleDB.findById(userId);
  }

  return user;
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExist = await findUserByEmail(email);

    if (userExist) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await createUser({ name, email, password });
    const issueSignupToken = process.env.ISSUE_SIGNUP_TOKEN !== "false";
    const { accessToken } = await issueTokenPairAndPersist({
      res,
      user,
      role: "customer",
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      ...(issueSignupToken ? { token: accessToken } : {}),
      user: {
        id: user._id,
        email: user.email,
        role: "customer",
      },
    });
  } catch (error) {
    console.log("User Signup error:", error);
    res.status(500).json({ message: "User Signup failed" });
  }
};

export const ridersignup = async (req, res) => {
  const { name, email, password, vechileNumber, vechileType } = req.body;

  try {
    const userExist = await findRiderByEmail(email);

    if (userExist) {
      return res.status(409).json({ message: "Rider already exists" });
    }

    const user = await createRider({
      name,
      email,
      password,
      vechileNumber,
      vechileType,
    });
    const issueSignupToken = process.env.ISSUE_SIGNUP_TOKEN !== "false";
    const { accessToken } = await issueTokenPairAndPersist({
      res,
      user,
      role: "rider",
    });

    res.status(201).json({
      success: true,
      message: "Rider created successfully",
      ...(issueSignupToken ? { token: accessToken } : {}),
      user: {
        id: user._id,
        email: user.email,
        role: "rider",
      },
    });
  } catch (error) {
    console.log("Rider Signup error:", error);
    res.status(500).json({ message: "Rider Signup failed" });
  }
};

export const getUserByGmail = async (req, res) => {
  const { email } = req.query;
  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email query param is required",
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not registered. Please sign up first.",
      });
    }
    const { accessToken } = await issueTokenPairAndPersist({
      res,
      user,
      role: "customer",
    });

    return res.status(200).json({
      success: true,
      token: accessToken,
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: "customer",
      },
    });
  } catch (error) {
    console.error("Get user by gmail error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (role === "rider") {
      const rider = await Rider.findById(userId).select(
        "_id name email username contact address bio vechileType vechileNumber",
      );

      if (!rider) {
        return res.status(404).json({
          success: false,
          message: "Rider not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          userId: rider._id,
          role: "rider",
          name: rider.name || "",
          email: rider.email || "",
          username: rider.username || "",
          contact: rider.contact || "",
          address: rider.address || "",
          bio: rider.bio || "",
          vechileType: rider.vechileType || "",
          vechileNumber: rider.vechileNumber || "",
        },
      });
    }

    let user = await User.findById(userId).select(
      "_id name email username contact address bio",
    );

    if (!user) {
      user = await googleDB
        .findById(userId)
        .select("_id name email username contact address bio");
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        role: "customer",
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        contact: user.contact || "",
        address: user.address || "",
        bio: user.bio || "",
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const editableFields = ["username", "contact", "address", "bio"];
    const updates = {};

    for (const key of editableFields) {
      if (req.body[key] !== undefined) {
        updates[key] = String(req.body[key] ?? "").trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No profile fields provided for update",
      });
    }

    if (role === "rider") {
      const rider = await Rider.findById(userId);

      if (!rider) {
        return res.status(404).json({
          success: false,
          message: "Rider not found",
        });
      }

      Object.assign(rider, updates);
      await rider.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          userId: rider._id,
          role: "rider",
          name: rider.name || "",
          email: rider.email || "",
          username: rider.username || "",
          contact: rider.contact || "",
          address: rider.address || "",
          bio: rider.bio || "",
          vechileType: rider.vechileType || "",
          vechileNumber: rider.vechileNumber || "",
        },
      });
    }

    let user = await User.findById(userId);

    if (!user) {
      user = await googleDB.findById(userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    Object.assign(user, updates);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        userId: user._id,
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        contact: user.contact || "",
        address: user.address || "",
        bio: user.bio || "",
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export const Userlogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    await LoginHistory.create({
      userId: user._id,
      email: user.email,
    });

    const { accessToken } = await issueTokenPairAndPersist({
      res,
      user,
      role: "customer",
    });

    res.json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: "customer",
      },
    });
  } catch (error) {
    console.log("Login error:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
};

export const Riderlogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findRiderByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "Rider not found" });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    await RiderLoginHistory.create({
      userId: user._id,
      email: user.email,
    });

    const { accessToken } = await issueTokenPairAndPersist({
      res,
      user,
      role: "rider",
    });

    res.json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: "rider",
      },
    });
  } catch (error) {
    console.log("Login error:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
};

const otpGenerator = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const registerUser = async (req, res) => {
  const normalizedEmail = String(req.body?.email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const emailPattern = /^\S+@\S+\.\S+$/;
  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  if (!isMailConfigured()) {
    return res.status(503).json({
      success: false,
      message:
        "Email service is not configured. Set EMAIL_APP_USER/EMAIL_APP_PASS or Google OAuth mail credentials.",
    });
  }

  try {
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = otpGenerator();
    const hashedOtp = await hashpassword(otp);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    user.otpCode = hashedOtp;
    user.otpExpiresAt = expiresAt;
    await user.save();

    const mailResult = await sendOtp(normalizedEmail, otp);
    if (mailResult?.success) {
      return res
        .status(200)
        .json({ success: true, message: "OTP sent successfully" });
    }

    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return res.status(502).json({
      success: false,
      reason: mailResult?.reason || "mail_send_failed",
      message: mailResult?.message || "Unable to send OTP email",
    });
  } catch (error) {
    console.log("Register OTP error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const verifyotp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No OTP requested" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(410).json({ message: "OTP expired" });
    }

    const isValid = await comparePassword(otp, user.otpCode);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.log("Verify OTP error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const resetpassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  if (!email || !otp || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match",
    });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(410).json({ message: "OTP expired" });
    }

    {
      /**if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP already used or expired" });
    } */
    }

    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Record the reset event in the "resetpassword" collection
    await createResetPasswordRecord(user);

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (refreshToken) {
      try {
        const { refreshSecret } = getJwtSecrets();
        const decoded = jwt.verify(refreshToken, refreshSecret);
        const user = await resolveUserByIdAndRole({
          userId: decoded?.id,
          role: decoded?.role,
        });

        if (user) {
          user.refreshTokenHash = null;
          user.refreshTokenExpiresAt = null;
          await user.save();
        }
      } catch (_error) {
        // Ignore invalid refresh token and still clear cookies.
      }
    }

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

export const refreshAuthToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { refreshSecret } = getJwtSecrets();
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (_error) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!decoded?.id || decoded?.tokenType !== "refresh") {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const role = decoded.role === "rider" ? "rider" : "customer";
    const user = await resolveUserByIdAndRole({ userId: decoded.id, role });

    if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (new Date(user.refreshTokenExpiresAt).getTime() < Date.now()) {
      user.refreshTokenHash = null;
      user.refreshTokenExpiresAt = null;
      await user.save();
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const isMatch = await comparePassword(refreshToken, user.refreshTokenHash);
    if (!isMatch) {
      user.refreshTokenHash = null;
      user.refreshTokenExpiresAt = null;
      await user.save();
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { accessToken } = await issueTokenPairAndPersist({
      res,
      user,
      role,
    });

    return res.status(200).json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to refresh session",
    });
  }
};
