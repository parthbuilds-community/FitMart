import { describe, expect, it } from "vitest";
import { normalizeProduct } from "./normalizeProduct";

describe("normalizeProduct", () => {
  it("uses productId when available", () => {
    const product = {
      productId: "123",
      name: "Protein Powder",
    };

    expect(normalizeProduct(product)).toEqual({
      productId: "123",
      id: "123",
      name: "Protein Powder",
    });
  });

  it("falls back to id", () => {
    const product = {
      id: "456",
      name: "Dumbbell",
    };

    expect(normalizeProduct(product)).toEqual({
      id: "456",
      productId: "456",
      name: "Dumbbell",
    });
  });
});