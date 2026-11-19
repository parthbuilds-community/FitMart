import {
  QUOTE_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  addMoney,
  asMoney,
  checkQuotePayability,
  checkoutQuoteSchema,
  createQuoteRequestSchema,
  formatMoney,
  isApiErrorEnvelope,
  isQuotePayable,
  moneySchema,
  rupeesToMinor,
} from "@shared/domain";

describe("money", () => {
  it("accepts non-negative integers and rejects everything else", () => {
    expect(asMoney(0)).toBe(0);
    expect(asMoney(1999)).toBe(1999);

    expect(() => asMoney(-1)).toThrow(RangeError);
    expect(() => asMoney(19.99)).toThrow(RangeError);
    expect(() => asMoney(Number.NaN)).toThrow(RangeError);
  });

  it("converts rupees with rounding instead of truncation", () => {
    expect(rupeesToMinor(19.99)).toBe(1999);
    expect(rupeesToMinor(0.1 + 0.2)).toBe(30);
  });

  it("adds only integer minor units", () => {
    expect(addMoney(asMoney(100), asMoney(250))).toBe(350);
    expect(moneySchema.safeParse(10.5).success).toBe(false);
    expect(moneySchema.safeParse(1050).success).toBe(true);
  });

  it("formats integer paise as INR", () => {
    expect(formatMoney(asMoney(199900))).toContain("1,999");
  });
});

describe("domain status unions", () => {
  it("exposes the quote, payment, and order lifecycles", () => {
    expect(QUOTE_STATUSES).toContain("active");
    expect(QUOTE_STATUSES).toContain("consumed");
    expect(PAYMENT_STATUSES).toContain("paid_unfulfilled");
    expect(ORDER_STATUSES).toContain("fulfilled");
  });

  it("treats only active quotes as payable", () => {
    expect(isQuotePayable("active")).toBe(true);
    for (const status of QUOTE_STATUSES.filter((s) => s !== "active")) {
      expect(isQuotePayable(status)).toBe(false);
    }
  });
});

describe("quote boundary schemas", () => {
  const validQuote = {
    id: "quote_1",
    userId: "user_1",
    status: "active",
    currency: "INR",
    lines: [
      {
        productId: 1,
        name: "Whey Protein",
        quantity: 2,
        unitPriceMinor: 249900,
        lineTotalMinor: 499800,
      },
    ],
    subtotalMinor: 499800,
    shippingMinor: 0,
    totalMinor: 499800,
    address: {
      fullName: "Test User",
      phone: "9999999999",
      line1: "1 Test Street",
      city: "Mumbai",
      state: "MH",
      postalCode: "400001",
      country: "IN",
    },
    idempotencyKey: "idem-key-123",
    expiresAt: new Date(),
    createdAt: new Date(),
  };

  it("parses a complete quote", () => {
    const parsed = checkoutQuoteSchema.parse(validQuote);
    expect(parsed.totalMinor).toBe(499800);
  });

  it("rejects float money at the boundary", () => {
    const bad = { ...validQuote, totalMinor: 4998.5 };
    expect(checkoutQuoteSchema.safeParse(bad).success).toBe(false);
  });

  it("requires an idempotency key long enough to be unique", () => {
    expect(createQuoteRequestSchema.safeParse({ addressId: "a1", idempotencyKey: "short" }).success).toBe(false);
    expect(createQuoteRequestSchema.safeParse({ addressId: "a1", idempotencyKey: "long-enough-key" }).success).toBe(true);
  });

  it("rejects any client-supplied amount or total", () => {
    const tampered = {
      addressId: "a1",
      idempotencyKey: "long-enough-key",
      amount: 1,
      totalMinor: 1,
    };
    expect(createQuoteRequestSchema.safeParse(tampered).success).toBe(false);
  });

  it("treats an active but expired quote as unpayable", () => {
    const now = new Date("2026-11-15T12:00:00Z");
    expect(
      checkQuotePayability(
        { status: "active", expiresAt: new Date("2026-11-15T12:15:00Z") },
        now,
      ),
    ).toEqual({ payable: true });
    expect(
      checkQuotePayability(
        { status: "active", expiresAt: new Date("2026-11-15T11:59:59Z") },
        now,
      ),
    ).toEqual({ payable: false, reason: "expired" });
    expect(
      checkQuotePayability(
        { status: "consumed", expiresAt: new Date("2026-11-15T12:15:00Z") },
        now,
      ),
    ).toEqual({ payable: false, reason: "not_active" });
  });
});

describe("api error envelope", () => {
  it("recognises the single error shape", () => {
    expect(isApiErrorEnvelope({ error: { code: "VALIDATION_ERROR", message: "bad input" } })).toBe(true);
    expect(isApiErrorEnvelope({ error: { code: "NOPE", message: "bad" } })).toBe(false);
    expect(isApiErrorEnvelope({ message: "legacy" })).toBe(false);
  });
});
