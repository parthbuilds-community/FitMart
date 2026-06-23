import { describe, it, expect } from "vitest";
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateWeightLossCalories,
  calculateWeightGainCalories,
} from "./healthUtils";

describe("Health Utilities", () => {
  it("calculates BMI correctly", () => {
    expect(calculateBMI(70, 175)).toBe(22.9);
  });

  it("returns Normal Weight category", () => {
    expect(getBMICategory(22.9)).toBe("Normal Weight");
  });

  it("calculates BMR for males", () => {
    expect(calculateBMR(70, 175, 25, "male")).toBe(1673.75);
  });

  it("calculates TDEE correctly", () => {
    expect(calculateTDEE(1673.75, 1.55)).toBe(2594);
  });

  it("calculates weight loss calories", () => {
    expect(calculateWeightLossCalories(2500)).toEqual({
      mild: 2250,
      moderate: 2000,
      extreme: 1500,
    });
  });

  it("calculates weight gain calories", () => {
    expect(calculateWeightGainCalories(2500)).toEqual({
      mild: 2750,
      moderate: 3000,
      fast: 3500,
    });
  });
});