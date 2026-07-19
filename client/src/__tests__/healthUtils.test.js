import { describe, it, expect } from "vitest";
import { calculateBMI, getBMICategory } from "../utils/healthUtils";

describe("calculateBMI", () => {
  it("calculates BMI correctly", () => {
    expect(calculateBMI(70, 175)).toBe(22.9);
  });

  it("returns 0 for invalid height", () => {
    expect(calculateBMI(70, 0)).toBe(0);
  });
});

describe("getBMICategory", () => {
  it("returns Normal Weight for BMI 22.9", () => {
    expect(getBMICategory(22.9)).toBe("Normal Weight");
  it("returns Invalid Input for BMI 0", () => {
  expect(getBMICategory(0)).toBe("Invalid Input");
});
  });

  it("returns Underweight for BMI 17", () => {
    expect(getBMICategory(17)).toBe("Underweight");
  });

  it("returns Obese for BMI 35", () => {
    expect(getBMICategory(35)).toBe("Obese");
  });
});
