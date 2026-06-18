import { describe, it, expect } from "vitest";
import { normalizeProduct } from "./normalizeProduct";

describe("normalizeProduct", () => {
  it("uses productId when available", () => {
    const product = {
      productId: "123",
      name: "Protein Powder",
    };

    const result = normalizeProduct(product);

    expect(result.id).toBe("123");
    expect(result.productId).toBe("123");
  });

  it("falls back to id when productId is missing", () => {
    const product = {
      id: "456",
      name: "Creatine",
    };

    const result = normalizeProduct(product);

    expect(result.id).toBe("456");
    expect(result.productId).toBe("456");
  });
});