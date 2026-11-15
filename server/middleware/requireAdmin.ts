import type { NextFunction, Request, Response } from "express";
import type { AuthedRequest } from "./requireAuth";

/**
 * Admin access is a Firebase custom claim (`admin: true`). It is set only by
 * the bootstrap script, never by an environment variable or a hardcoded UID.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as AuthedRequest).user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized — no user found" });
  }

  if (user.admin !== true) {
    return res.status(403).json({ error: "Forbidden — admin access required" });
  }

  return next();
}
