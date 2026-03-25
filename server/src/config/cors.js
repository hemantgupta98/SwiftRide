import cors from "cors";

const normalizeOrigin = (value) =>
  typeof value === "string" ? value.trim().replace(/\/$/, "") : "";

const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),

  "https://swift-ride-seven.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3002",
].filter(Boolean);

export const allowedOrigins = [
  ...new Set(configuredOrigins.map(normalizeOrigin).filter(Boolean)),
];

const corsOption = {
  origin: (origin, callback) => {
    console.log("🌐 Request Origin 👉", origin);

    // ✅ Allow requests with no origin (Postman, mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    // ✅ Allow only whitelisted origins
    if (allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    // ❌ Block others
    console.error("❌ CORS BLOCKED for 👉", origin);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],

  credentials: true,

  optionsSuccessStatus: 200,
};

export default corsOption;
