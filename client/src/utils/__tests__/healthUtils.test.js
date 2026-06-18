import { describe, it, expect } from "vitest";
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateWeightLossCalories,
  calculateWeightGainCalories,
  getRecommendedCategory,
} from "../healthUtils";

describe("calculateBMI", () => {
  it("calculates BMI correctly for normal weight", () => {
    expect(calculateBMI(70, 175)).toBe(22.9);
  });

  it("returns 0 for invalid inputs", () => {
    expect(calculateBMI(0, 175)).toBe(0);
    expect(calculateBMI(70, 0)).toBe(0);
    expect(calculateBMI(null, 175)).toBe(0);
    expect(calculateBMI(70, -1)).toBe(0);
  });

  it("rounds to one decimal place", () => {
    const result = calculateBMI(68, 170);
    expect(result.toString()).toMatch(/^\d+\.\d$/);
  });
});

describe("getBMICategory", () => {
  it("returns Underweight for BMI below 18.5", () => {
    expect(getBMICategory(16)).toBe("Underweight");
    expect(getBMICategory(18.4)).toBe("Underweight");
  });

  it("returns Normal Weight for BMI 18.5-24.9", () => {
    expect(getBMICategory(18.5)).toBe("Normal Weight");
    expect(getBMICategory(22)).toBe("Normal Weight");
    expect(getBMICategory(24.9)).toBe("Normal Weight");
  });

  it("returns Overweight for BMI 25-29.9", () => {
    expect(getBMICategory(25)).toBe("Overweight");
    expect(getBMICategory(27.5)).toBe("Overweight");
    expect(getBMICategory(29.9)).toBe("Overweight");
  });

  it("returns Obese for BMI 30+", () => {
    expect(getBMICategory(30)).toBe("Obese");
    expect(getBMICategory(35)).toBe("Obese");
  });

  it("returns Invalid Input for zero or negative", () => {
    expect(getBMICategory(0)).toBe("Invalid Input");
    expect(getBMICategory(-5)).toBe("Invalid Input");
  });
});

describe("calculateBMR", () => {
  it("calculates BMR for male correctly", () => {
    // Male: 10*weight + 6.25*height - 5*age + 5
    const result = calculateBMR(70, 175, 25, "male");
    expect(result).toBe(10 * 70 + 6.25 * 175 - 5 * 25 + 5);
  });

  it("calculates BMR for female correctly", () => {
    // Female: 10*weight + 6.25*height - 5*age - 161
    const result = calculateBMR(60, 165, 30, "female");
    expect(result).toBe(10 * 60 + 6.25 * 165 - 5 * 30 - 161);
  });

  it("returns 0 for missing inputs", () => {
    expect(calculateBMR(0, 175, 25, "male")).toBe(0);
    expect(calculateBMR(70, 0, 25, "male")).toBe(0);
  });
});

describe("calculateTDEE", () => {
  it("calculates TDEE by multiplying BMR by activity multiplier", () => {
    expect(calculateTDEE(1700, 1.55)).toBe(2635);
  });

  it("rounds to integer", () => {
    expect(Number.isInteger(calculateTDEE(1700, 1.375))).toBe(true);
  });
});

describe("calculateWeightLossCalories", () => {
  it("returns correct deficit targets", () => {
    const result = calculateWeightLossCalories(2500);
    expect(result.mild).toBe(2250);
    expect(result.moderate).toBe(2000);
    expect(result.extreme).toBe(1500);
  });

  it("returns zeros for invalid TDEE", () => {
    expect(calculateWeightLossCalories(0)).toEqual({ mild: 0, moderate: 0, extreme: 0 });
  });
});

describe("calculateWeightGainCalories", () => {
  it("returns correct surplus targets", () => {
    const result = calculateWeightGainCalories(2000);
    expect(result.mild).toBe(2250);
    expect(result.moderate).toBe(2500);
    expect(result.fast).toBe(3000);
  });

  it("returns zeros for invalid TDEE", () => {
    expect(calculateWeightGainCalories(0)).toEqual({ mild: 0, moderate: 0, fast: 0 });
  });
});

describe("getRecommendedCategory", () => {
  it("recommends Nutrition for underweight", () => {
    expect(getRecommendedCategory(16)).toBe("Nutrition");
  });

  it("recommends Equipment for overweight and obese", () => {
    expect(getRecommendedCategory(25)).toBe("Equipment");
    expect(getRecommendedCategory(30)).toBe("Equipment");
  });

  it("recommends Nutrition for normal weight", () => {
    expect(getRecommendedCategory(22)).toBe("Nutrition");
  });
});
