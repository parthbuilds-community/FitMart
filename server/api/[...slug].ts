// Vercel serverless entry point.
//
// The local server starts a listener from index.js, but Vercel expects a
// request handler. This catch-all function mounts the same Express app at
// /api/* and reuses one MongoDB connection across warm invocations.
import type { IncomingMessage, ServerResponse } from "node:http";

import { allowedOrigins, createApp } from "../app";
import { connectToDatabase } from "../db";

const app = createApp();
let connectionPromise: Promise<unknown> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (!connectionPromise) {
      connectionPromise = connectToDatabase();
    }
    await connectionPromise;
  } catch (err) {
    console.error("Database connection failed:", err);
    if (!res.headersSent) {
      // Express (and its CORS middleware) has not run yet, so add the CORS
      // headers here to keep the error readable by the browser.
      const origin = req.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Vary", "Origin");
      }
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Database unavailable" }));
    }
    return;
  }

  // Express apps are valid Node request handlers.
  return app(req as never, res as never);
}
