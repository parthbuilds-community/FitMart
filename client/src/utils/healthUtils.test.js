import { describe, it, expect } from "vitest";
import { calculateBMI, getBMICategory } from "./healthUtils";

describe("healthUtils", () => {
  it("calculates BMI correctly", () => {
    expect(calculateBMI(70, 175)).toBe(22.9);
  });

  it("returns Normal Weight category", () => {
    expect(getBMICategory(22.9)).toBe("Normal Weight");
  });

  it("returns Underweight category", () => {
    expect(getBMICategory(17)).toBe("Underweight");
  });
});