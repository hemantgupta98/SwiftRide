import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { googleDB } from "./auth.model.js";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
const API_BASE_URL = (
  process.env.API_BASE_URL ??
  process.env.BACKEND_URL ??
  process.env.RENDER_EXTERNAL_URL ??
  "https://swiftride-gvce.onrender.com"
).replace(/\/$/, "");

const GOOGLE_CALLBACK_URL = (
  process.env.GOOGLE_CALLBACK_URL ?? `${API_BASE_URL}/api/auth/google/callback`
).replace(/\/$/, "");

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn(
    "Google OAuth not configured: missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET",
  );
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          let user = await googleDB.findOne({ email });

          if (!user) {
            user = await googleDB.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );
}
