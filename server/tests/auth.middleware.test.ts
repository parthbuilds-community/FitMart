import express, { type Request } from "express";
import request from "supertest";
import rateLimit from "express-rate-limit";
import { createRequireAuth, type AuthenticatedUser } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";

function buildApp(verifyToken: (token: string) => Promise<AuthenticatedUser>) {
  const app = express();
  const requireAuth = createRequireAuth(verifyToken);
  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get("/private", authLimiter, requireAuth, (req: Request, res) => {
    const user = (req as Request & { user?: AuthenticatedUser }).user;
    res.json({ uid: user?.uid, admin: user?.admin === true });
  });

  app.get("/admin", authLimiter, requireAuth, requireAdmin, (_req, res) => {
    res.json({ ok: true });
  });

  return app;
}

describe("requireAuth", () => {
  const verifiedUser: AuthenticatedUser = {
    uid: "user_1",
    email: "user@example.com",
    email_verified: true,
  };

  it("rejects a request with no bearer token", async () => {
    const app = buildApp(async () => verifiedUser);

    const response = await request(app).get("/private");

    expect(response.status).toBe(401);
  });

  it("rejects a token the verifier refuses", async () => {
    const app = buildApp(async () => {
      throw new Error("bad token");
    });

    const response = await request(app)
      .get("/private")
      .set("Authorization", "Bearer forged");

    expect(response.status).toBe(401);
  });

  it("rejects an unverified email", async () => {
    const app = buildApp(async () => ({ ...verifiedUser, email_verified: false }));

    const response = await request(app)
      .get("/private")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(403);
  });

  it("attaches the verified user for a valid token", async () => {
    const app = buildApp(async () => verifiedUser);

    const response = await request(app)
      .get("/private")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ uid: "user_1", admin: false });
  });

  it("never accepts a development-style dev: token by default", async () => {
    const app = buildApp(async (token) => {
      if (token.startsWith("dev:")) throw new Error("dev tokens are gone");
      return verifiedUser;
    });

    const response = await request(app)
      .get("/private")
      .set("Authorization", "Bearer dev:admin@example.com");

    expect(response.status).toBe(401);
  });
});

describe("requireAdmin", () => {
  it("returns 401 when no user is attached", async () => {
    const app = express();
    app.get("/admin", requireAdmin, (_req, res) => res.json({ ok: true }));

    const response = await request(app).get("/admin");

    expect(response.status).toBe(401);
  });

  it("returns 403 for a user without the admin claim", async () => {
    const app = buildApp(async () => ({
      uid: "user_1",
      email_verified: true,
      admin: false,
    }));

    const response = await request(app)
      .get("/admin")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(403);
  });

  it("allows a user with admin === true", async () => {
    const app = buildApp(async () => ({
      uid: "admin_1",
      email_verified: true,
      admin: true,
    }));

    const response = await request(app)
      .get("/admin")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
