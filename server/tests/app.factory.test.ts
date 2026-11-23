import request from "supertest";
import { createApp } from "../app";

jest.mock("../lib/cache", () => ({
  get: jest.fn(),
  set: jest.fn(),
  delPattern: jest.fn(),
  clearAll: jest.fn(),
  client: null,
}));
jest.mock("../middleware/requireAuth", () => ({
  requireAuth: (req: { user?: unknown }, _res: unknown, next: () => void) => {
    req.user = { uid: "user_1", email_verified: true, admin: false };
    next();
  },
}));
jest.mock("../middleware/requireAdmin", () => ({
  requireAdmin: (req: unknown, res: unknown, next: () => void) => next(),
}));
jest.mock("../routes/chat", () => require("express").Router());

describe("createApp", () => {
  it("builds an app without connecting a database or binding a port", async () => {
    const app = createApp();

    expect(typeof app.listen).toBe("function");

    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("FitMart server running");
  });

  it("rejects malformed JSON with a 400", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/api/products")
      .set("Content-Type", "application/json")
      .send("{");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid JSON payload" });
  });

  it("allows a request with no Origin header (non-browser clients)", async () => {
    const app = createApp();

    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("allows the configured local development origin", async () => {
    const app = createApp();

    const response = await request(app).get("/").set("Origin", "http://localhost:5173");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });

  it("rejects an unknown origin", async () => {
    const app = createApp();

    const response = await request(app).get("/").set("Origin", "https://evil.example");

    expect(response.status).toBe(500);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("no longer exposes the demo payment bypass", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/api/payment/demo-success")
      .send({ userId: "user_1" });

    expect(response.status).toBe(404);
  });

  it("no longer exposes the development login route", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/api/dev/login")
      .send({ email: "admin@example.com" });

    expect(response.status).toBe(404);
  });

  it("rejects MongoDB operator objects in userId body fields", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/api/user/login")
      .send({ userId: { $ne: null } });

    expect(response.status).toBe(400);
  });

  it("rejects invalid bug status and pagination values", async () => {
    const app = createApp();

    const statusResponse = await request(app)
      .get("/api/bugs")
      .query({ status: { $ne: null } });
    expect(statusResponse.status).toBe(400);

    const paginationResponse = await request(app)
      .get("/api/bugs")
      .query({ page: "-1" });
    expect(paginationResponse.status).toBe(400);
  });
});
