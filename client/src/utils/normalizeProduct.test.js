import { describe, it, expect } from "vitest";
import { normalizeProduct } from "./normalizeProduct";

describe("normalizeProduct", () => {
  it("uses productId when available", () => {
    const product = {
      productId: "abc123",
      name: "Protein Powder",
    };

    const result = normalizeProduct(product);

    expect(result.id).toBe("abc123");
    expect(result.productId).toBe("abc123");
  });

  it("falls back to id when productId is missing", () => {
    const product = {
      id: "xyz789",
      name: "Dumbbell",
    };

    const result = normalizeProduct(product);

    expect(result.id).toBe("xyz789");
    expect(result.productId).toBe("xyz789");
  });

  it("preserves existing product properties", () => {
    const product = {
      id: "123",
      name: "Yoga Mat",
      price: 999,
    };

    const result = normalizeProduct(product);

    expect(result.name).toBe("Yoga Mat");
    expect(result.price).toBe(999);
  });
});