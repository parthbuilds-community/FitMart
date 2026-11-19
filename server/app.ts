import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { API_LIMIT_MAX, PAYMENT_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "./config/constants";
import logger from "./middleware/logger";

const configuredOrigins = [
  process.env.ALLOWED_ORIGIN,
  process.env.ALLOWED_ORIGINS,
  process.env.CLIENT_ORIGIN,
  process.env.APP_BASE_URL,
]
  .filter(Boolean)
  .join(",")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// The production storefront. Keeping it here means the deployed API keeps
// working even when ALLOWED_ORIGIN has not been set on the hosting provider.
const defaultOrigins = ["https://fitmart-omega.vercel.app"];

export const allowedOrigins = [...new Set([...configuredOrigins, ...defaultOrigins])];

const isDev = process.env.NODE_ENV !== "production";

if (isDev) {
  for (const origin of ["http://localhost:5173", "http://127.0.0.1:5173"]) {
    if (!allowedOrigins.includes(origin)) allowedOrigins.push(origin);
  }
}

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: API_LIMIT_MAX,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: PAYMENT_LIMIT_MAX,
  message: { error: "Too many payment requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

type CorsCallback = (err: Error | null, allow?: boolean) => void;

/**
 * Builds the Express app without side effects: no database connection, no
 * listener, no environment validation. Safe to import from tests.
 */
export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin(origin: string | undefined, callback: CorsCallback) {
        // Requests without an Origin header are not browser cross-origin
        // requests (health checks, server-to-server, supertest).
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );

  app.use(helmet());
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
  app.disable("etag");

  app.use("/api", (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use("/api", apiLimiter);
  app.use("/api/payment/create-order", paymentLimiter);
  app.use("/api/payment/verify-payment", paymentLimiter);

  app.use(logger);

  // Legacy CommonJS route modules. They are ported to TypeScript in later
  // Phase 1 tasks; until then they are mounted through require().
  /* eslint-disable @typescript-eslint/no-var-requires */
  app.use("/api/products", require("./routes/products"));
  app.use("/api/cart", require("./routes/cart"));
  app.use("/api/orders", require("./routes/orders"));
  app.use("/api/dashboard", require("./routes/dashboard"));
  app.use("/api/reports", require("./routes/reports"));
  app.use("/api/chat", require("./routes/chat"));
  app.use("/api/user", require("./routes/user"));
  app.use("/api/customers", require("./routes/customers"));
  app.use("/api/exercises", require("./routes/exercises"));
  app.use("/api/workouts", require("./routes/workouts"));
  app.use("/api/bugs", require("./routes/bugs"));
  app.use("/api/payment", require("./routes/payment"));
  app.use("/api/rewards", require("./routes/rewards"));
  app.use("/api/fitness-centers", require("./routes/fitnessCenters"));
  app.use("/api/quotes", require("./routes/quotes").quotesRouter);

  app.use("/api/github", require("./routes/github"));
  /* eslint-enable @typescript-eslint/no-var-requires */

  app.get("/", (req: Request, res: Response) => res.send("FitMart server running"));

  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    void next;
    const e = (err ?? {}) as { status?: number; type?: string; message?: string };

    if (err instanceof SyntaxError && e.status === 400) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }

    if (e.type === "entity.too.large" || e.status === 413) {
      return res.status(413).json({ error: "Payload too large" });
    }

    console.error("Unhandled error:", e.message);
    return res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
