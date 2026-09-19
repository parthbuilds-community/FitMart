// server/config/envSchema.js
// Zod schema for validating all environment variables on server startup.
// Critical (required) vars cause process.exit(1) if missing/invalid.
// Optional vars are validated for type/format when present but won't block startup.

const { z } = require("zod");

const envSchema = z.object({
  // ── Critical (required) ──────────────────────────────────────────────
  MONGO_URI: z
    .string()
    .url("MONGO_URI must be a valid URL")
    .min(1, "MONGO_URI is required"),

  // ── Server config ────────────────────────────────────────────────────
  PORT: z.coerce.number().int().positive().optional(),
  NODE_ENV: z.enum(["production", "development", "test"]).optional(),
  ALLOWED_ORIGIN: z.string().optional(),
  ALLOW_ALL_ORIGINS: z
    .union([z.literal("true"), z.literal("false")])
    .optional(),

  // ── Razorpay ─────────────────────────────────────────────────────────
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  // ── Database ─────────────────────────────────────────────────────────
  MONGO_DB: z.string().optional(),

  // ── Firebase Admin ───────────────────────────────────────────────────
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

  // ── SMTP / Email ────────────────────────────────────────────────────
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z
    .union([z.literal("true"), z.literal("false")])
    .optional(),
  SMTP_FROM: z.string().optional(),
  APP_BASE_URL: z.string().url().optional(),

  // ── Redis / Cache ───────────────────────────────────────────────────
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().optional(),
  PRODUCTS_CACHE_TTL: z.coerce.number().int().positive().optional(),
  DEBUG_REDIS: z
    .union([z.literal("true"), z.literal("false")])
    .optional(),

  // ── Gemini / AI ─────────────────────────────────────────────────────
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL_NAME: z.string().optional(),

  // ── Admin / Auth ────────────────────────────────────────────────────
  ADMIN_UID: z.string().optional(),
  SUPER_ADMIN_UID: z.string().optional(),
  VITE_ADMIN_UID: z.string().optional(),
  VITE_SUPER_ADMIN_UID: z.string().optional(),
  DEV_ADMIN_UID: z.string().optional(),
  DEV_ADMIN_EMAIL: z.string().email().optional(),

  // ── Cloudinary ──────────────────────────────────────────────────────
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // ── Other ───────────────────────────────────────────────────────────
  RAPIDAPI_KEY: z.string().optional(),
  RAPIDAPI_HOST: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
});

module.exports = envSchema;
