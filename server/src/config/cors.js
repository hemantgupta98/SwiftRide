import cors from "cors";

const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),

  // ✅ Local development origins (both localhost and 127.0.0.1)
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3002",
].filter(Boolean);

// إزالة duplicates
export const allowedOrigins = [...new Set(configuredOrigins)];

const corsOption = {
  origin: (origin, callback) => {
    console.log("🌐 Request Origin 👉", origin);

    // ✅ Allow requests with no origin (Postman, mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    // ✅ Allow only whitelisted origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ❌ Block others
    console.error("❌ CORS BLOCKED for 👉", origin);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],

  credentials: true, // ✅ Important for cookies/auth

  optionsSuccessStatus: 200,
};

export default corsOption;
