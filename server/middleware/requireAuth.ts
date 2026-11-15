import type { NextFunction, Request, Response } from "express";
import admin from "../firebaseAdmin";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  email_verified?: boolean;
  admin?: boolean;
  [claim: string]: unknown;
}

export type TokenVerifier = (token: string) => Promise<AuthenticatedUser>;

export type AuthedRequest = Request & { user?: AuthenticatedUser };

const verifyWithFirebase: TokenVerifier = (token) =>
  admin.auth().verifyIdToken(token) as unknown as Promise<AuthenticatedUser>;

/**
 * Builds the authentication middleware. Tests pass a fake verifier instead of
 * relying on a development bypass.
 */
export function createRequireAuth(verifyToken: TokenVerifier = verifyWithFirebase) {
  return async function requireAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized — no token provided" });
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      return res.status(401).json({ error: "Unauthorized — no token provided" });
    }

    try {
      const user = await verifyToken(token);

      if (!user.email_verified) {
        return res.status(403).json({ error: "Forbidden — email not verified" });
      }

      (req as AuthedRequest).user = user;
      return next();
    } catch {
      return res.status(401).json({ error: "Unauthorized — invalid or expired token" });
    }
  };
}

/** The production middleware: always verifies against Firebase. */
export const requireAuth = createRequireAuth();
