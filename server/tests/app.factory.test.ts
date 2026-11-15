import request from "supertest";
import { createApp } from "../app";

jest.mock("../lib/cache", () => ({
  get: jest.fn(),
  set: jest.fn(),
  delPattern: jest.fn(),
  clearAll: jest.fn(),
  client: null,
}));
jest.mock("../middleware/verifyFirebaseToken", () => (req: unknown, res: unknown, next: () => void) => next());
jest.mock("../middleware/verifyAdmin", () => (req: unknown, res: unknown, next: () => void) => next());
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
});
