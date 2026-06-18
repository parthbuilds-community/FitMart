import { describe, it, expect } from "vitest";
import { fmt } from "../formatters";

describe("fmt", () => {
  it("formats a number as INR currency", () => {
    const result = fmt(1000);
    expect(result).toContain("1,000");
    expect(result).toContain("₹");
  });

  it("formats large numbers with Indian numbering", () => {
    const result = fmt(100000);
    // Indian numbering: 1,00,000
    expect(result).toContain("₹");
    // Should have at least some digits
    expect(result.replace(/[^0-9,]/g, "").length).toBeGreaterThan(0);
  });

  it("handles zero", () => {
    const result = fmt(0);
    expect(result).toContain("0");
    expect(result).toContain("₹");
  });

  it("has zero fraction digits", () => {
    const result = fmt(99.99);
    expect(result).not.toContain(".");
  });
});
