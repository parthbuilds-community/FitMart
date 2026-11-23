import fs from "node:fs";
import express from "express";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

import quotesRouter from "../routes/quotes";
import { CheckoutQuote } from "../models/CheckoutQuote";
import { createQuote, getPayableQuote, QuoteError } from "../services/quoteService";

const Product = require("../models/Product");
const Cart = require("../models/Cart");
const UserProfile = require("../models/UserProfile");

jest.mock("../middleware/requireAuth", () => ({
  requireAuth: (
    req: { headers: Record<string, string | string[] | undefined>; user?: unknown },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: () => void,
  ) => {
    const uid = String(req.headers["x-test-uid"] ?? "");
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized — no token provided" });
    }
    req.user = { uid, email_verified: true, admin: false };
    return next();
  },
}));

const app = express();
app.use(express.json());
app.use("/api/quotes", quotesRouter);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  const windowsMongod = "C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe";
  if (process.platform === "win32" && fs.existsSync(windowsMongod)) {
    process.env.MONGOMS_SYSTEM_BINARY = windowsMongod;
  }

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([
    CheckoutQuote.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    UserProfile.deleteMany({}),
  ]);
});

async function seedUser(userId: string, addressId: string) {
  return UserProfile.create({
    userId,
    name: "Test User",
    email: `${userId}@example.com`,
    phone: "9999999999",
    addresses: [
      {
        id: addressId,
        line1: "1 Test Street",
        city: "Mumbai",
        state: "MH",
        zip: "400001",
        country: "IN",
        phone: "9999999999",
      },
    ],
  });
}

async function seedProduct(overrides: Record<string, unknown> = {}) {
  return Product.create({
    productId: 1,
    name: "Whey Protein",
    price: 1999.99,
    stock: 10,
    reserved: 0,
    ...overrides,
  });
}

async function seedCart(userId: string, items: Array<{ productId: number; quantity: number }>) {
  return Cart.create({ userId, items });
}

function postQuote(userId: string | null, body: Record<string, unknown>) {
  const call = request(app).post("/api/quotes");
  return userId ? call.set("x-test-uid", userId).send(body) : call.send(body);
}

const validBody = { addressId: "addr_a", idempotencyKey: "idem-key-0001" };

describe("POST /api/quotes", () => {
  it("rejects an unauthenticated request", async () => {
    const response = await postQuote(null, validBody);

    expect(response.status).toBe(401);
  });

  it("builds totals from the database and stores integer paise", async () => {
    await seedUser("user_a", "addr_a");
    await seedProduct();
    await seedCart("user_a", [{ productId: 1, quantity: 2 }]);

    const response = await postQuote("user_a", validBody);

    expect(response.status).toBe(201);
    const quote = response.body.data;

    expect(quote.status).toBe("active");
    expect(quote.currency).toBe("INR");
    expect(quote.lines).toHaveLength(1);
    expect(quote.lines[0]).toMatchObject({
      productId: 1,
      name: "Whey Protein",
      quantity: 2,
      unitPriceMinor: 199999,
      lineTotalMinor: 399998,
    });
    expect(quote.subtotalMinor).toBe(399998);
    expect(quote.shippingMinor).toBe(0);
    expect(quote.totalMinor).toBe(399998);
    expect(Number.isInteger(quote.totalMinor)).toBe(true);
    expect(quote.address).toMatchObject({
      fullName: "Test User",
      postalCode: "400001",
      country: "IN",
    });
  });

  it("rejects a client-supplied amount instead of trusting it", async () => {
    await seedUser("user_a", "addr_a");
    await seedProduct();
    await seedCart("user_a", [{ productId: 1, quantity: 1 }]);

    const response = await postQuote("user_a", {
      ...validBody,
      amount: 1,
      totalMinor: 1,
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(await CheckoutQuote.countDocuments()).toBe(0);
  });

  it("rejects MongoDB operator objects in idempotency keys", async () => {
    const response = await postQuote("user_a", {
      addressId: "addr_a",
      idempotencyKey: { $ne: null },
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects operator objects passed directly to the quote service", async () => {
    await expect(
      createQuote({ $ne: null } as unknown as string, {
        addressId: "addr_a",
        idempotencyKey: "idem-key-0001",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      status: 400,
    });

    await expect(
      createQuote("user_a", {
        addressId: "addr_a",
        idempotencyKey: { $ne: null } as unknown as string,
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      status: 400,
    });
  });

  it("is idempotent for the same idempotency key", async () => {
    await seedUser("user_a", "addr_a");
    await seedProduct();
    await seedCart("user_a", [{ productId: 1, quantity: 1 }]);

    const first = await postQuote("user_a", validBody);
    const second = await postQuote("user_a", validBody);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.data.id).toBe(first.body.data.id);
    expect(await CheckoutQuote.countDocuments()).toBe(1);
  });

  it("cannot use another user's address", async () => {
    await seedUser("user_a", "addr_a");
    await seedUser("user_b", "addr_b");
    await seedProduct();
    await seedCart("user_b", [{ productId: 1, quantity: 1 }]);

    const response = await postQuote("user_b", {
      addressId: "addr_a",
      idempotencyKey: "idem-key-user-b",
    });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
    expect(await CheckoutQuote.countDocuments()).toBe(0);
  });

  it("refuses a quote when stock is insufficient", async () => {
    await seedUser("user_a", "addr_a");
    await seedProduct({ stock: 2 });
    await seedCart("user_a", [{ productId: 1, quantity: 5 }]);

    const response = await postQuote("user_a", validBody);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("INSUFFICIENT_STOCK");
    expect(await CheckoutQuote.countDocuments()).toBe(0);
  });

  it("refuses an archived product", async () => {
    await seedUser("user_a", "addr_a");
    await seedProduct({ isActive: false });
    await seedCart("user_a", [{ productId: 1, quantity: 1 }]);

    const response = await postQuote("user_a", validBody);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
  });

  it("refuses an empty cart", async () => {
    await seedUser("user_a", "addr_a");
    await seedProduct();

    const response = await postQuote("user_a", validBody);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
  });

  it("freezes the price snapshot when the product changes later", async () => {
    await seedUser("user_a", "addr_a");
    const product = await seedProduct({ price: 100 });
    await seedCart("user_a", [{ productId: 1, quantity: 2 }]);

    const created = await postQuote("user_a", validBody);
    expect(created.body.data.totalMinor).toBe(20000);

    product.price = 1;
    await product.save();

    const read = await request(app)
      .get(`/api/quotes/${created.body.data.id}`)
      .set("x-test-uid", "user_a");

    expect(read.status).toBe(200);
    expect(read.body.data.totalMinor).toBe(20000);
    expect(read.body.data.lines[0].unitPriceMinor).toBe(10000);
  });
});

describe("GET /api/quotes/:quoteId", () => {
  it("returns an active quote to its owner", async () => {
    await seedUser("user_a", "addr_a");
    await seedProduct();
    await seedCart("user_a", [{ productId: 1, quantity: 1 }]);
    const created = await postQuote("user_a", validBody);

    const response = await request(app)
      .get(`/api/quotes/${created.body.data.id}`)
      .set("x-test-uid", "user_a");

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(created.body.data.id);
  });

  it("hides another user's quote", async () => {
    await seedUser("user_a", "addr_a");
    await seedUser("user_b", "addr_b");
    await seedProduct();
    await seedCart("user_a", [{ productId: 1, quantity: 1 }]);
    const created = await postQuote("user_a", validBody);

    const response = await request(app)
      .get(`/api/quotes/${created.body.data.id}`)
      .set("x-test-uid", "user_b");

    expect(response.status).toBe(404);
  });

  it("refuses an expired quote and marks it expired", async () => {
    await seedUser("user_a", "addr_a");
    await seedProduct();
    await seedCart("user_a", [{ productId: 1, quantity: 1 }]);
    const created = await postQuote("user_a", validBody);
    const quoteId = created.body.data.id;

    await CheckoutQuote.updateOne(
      { _id: quoteId },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );

    const response = await request(app)
      .get(`/api/quotes/${quoteId}`)
      .set("x-test-uid", "user_a");

    expect(response.status).toBe(410);
    expect(response.body.error.code).toBe("QUOTE_EXPIRED");

    const stored = await CheckoutQuote.findById(quoteId).lean();
    expect(stored?.status).toBe("expired");
  });

  it("service refuses an expired quote before payment", async () => {
    await seedUser("user_a", "addr_a");
    await seedProduct();
    await seedCart("user_a", [{ productId: 1, quantity: 1 }]);
    const created = await postQuote("user_a", validBody);

    await CheckoutQuote.updateOne(
      { _id: created.body.data.id },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );

    await expect(getPayableQuote(created.body.data.id, "user_a")).rejects.toMatchObject({
      code: "QUOTE_EXPIRED",
      status: 410,
    } satisfies Partial<QuoteError>);
  });
});
