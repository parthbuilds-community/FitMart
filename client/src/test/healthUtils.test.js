// src/test/healthUtils.test.js
import { describe, it, expect } from "vitest";
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateWeightLossCalories,
  calculateWeightGainCalories,
} from "../utils/healthUtils";

describe("calculateBMI", () => {
  it("calculates BMI correctly for normal weight", () => {
    // 70 kg, 175 cm → 70 / (1.75)^2 = 22.9
    expect(calculateBMI(70, 175)).toBeCloseTo(22.9, 1);
  });

  it("returns 0 for missing or zero inputs", () => {
    expect(calculateBMI(0, 175)).toBe(0);
    expect(calculateBMI(70, 0)).toBe(0);
    expect(calculateBMI(null, 175)).toBe(0);
  });
});

describe("getBMICategory", () => {
  it("returns Underweight for BMI < 18.5", () => {
    expect(getBMICategory(17)).toBe("Underweight");
  });

  it("returns Normal Weight for BMI 18.5–24.9", () => {
    expect(getBMICategory(22)).toBe("Normal Weight");
  });

  it("returns Overweight for BMI 25–29.9", () => {
    expect(getBMICategory(27)).toBe("Overweight");
  });

  it("returns Obese for BMI >= 30", () => {
    expect(getBMICategory(32)).toBe("Obese");
  });

  it("returns Invalid Input for BMI <= 0", () => {
    expect(getBMICategory(0)).toBe("Invalid Input");
  });
});

describe("calculateBMR", () => {
  it("calculates BMR correctly for male", () => {
    // Male: 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
    expect(calculateBMR(70, 175, 25, "male")).toBeCloseTo(1673.75, 0);
  });

  it("calculates BMR correctly for female", () => {
    // Female: 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
    expect(calculateBMR(60, 165, 30, "female")).toBeCloseTo(1320.25, 0);
  });

  it("returns 0 for missing inputs", () => {
    expect(calculateBMR(0, 175, 25, "male")).toBe(0);
    expect(calculateBMR(70, 0, 25, "male")).toBe(0);
    expect(calculateBMR(70, 175, 0, "male")).toBe(0);
  });
});

describe("calculateWeightLossCalories", () => {
  it("returns correct calorie deficits for a 2000 kcal TDEE", () => {
    const result = calculateWeightLossCalories(2000);
    expect(result.mild).toBe(1750);
    expect(result.moderate).toBe(1500);
    expect(result.extreme).toBe(1000);
  });

  it("returns zeros when TDEE is falsy", () => {
    expect(calculateWeightLossCalories(0)).toEqual({ mild: 0, moderate: 0, extreme: 0 });
  });
});

describe("calculateWeightGainCalories", () => {
  it("returns correct calorie surpluses for a 2000 kcal TDEE", () => {
    const result = calculateWeightGainCalories(2000);
    expect(result.mild).toBe(2250);
    expect(result.moderate).toBe(2500);
    expect(result.fast).toBe(3000);
  });

  it("returns zeros when TDEE is falsy", () => {
    expect(calculateWeightGainCalories(0)).toEqual({ mild: 0, moderate: 0, fast: 0 });
  });
});
