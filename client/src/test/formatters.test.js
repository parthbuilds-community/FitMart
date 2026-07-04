// src/test/formatters.test.js
import { describe, it, expect } from "vitest";
import { fmt } from "../utils/formatters";

describe("fmt (INR currency formatter)", () => {
  it("formats a whole number as INR with ₹ symbol", () => {
    const result = fmt(1000);
    expect(result).toContain("₹");
    expect(result).toContain("1,000");
  });

  it("formats zero correctly", () => {
    const result = fmt(0);
    expect(result).toContain("₹");
    expect(result).toContain("0");
  });

  it("does not include decimal digits (maximumFractionDigits: 0)", () => {
    const result = fmt(999.99);
    expect(result).not.toContain(".");
  });

  it("formats large values with correct Indian comma grouping", () => {
    // 100000 in en-IN format → ₹1,00,000
    const result = fmt(100000);
    expect(result).toContain("₹");
    expect(result).toContain("1,00,000");
  });
});
