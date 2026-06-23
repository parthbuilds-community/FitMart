import { describe, it, expect } from "vitest";
import { calculateBMI, getBMICategory } from "./healthUtils";

describe("calculateBMI", () => {
  it("calculates BMI correctly", () => {
    expect(calculateBMI(70, 175)).toBe(22.9);
  });
});

describe("getBMICategory", () => {
  it("returns Normal Weight for BMI 22.9", () => {
    expect(getBMICategory(22.9)).toBe("Normal Weight");
  });
});