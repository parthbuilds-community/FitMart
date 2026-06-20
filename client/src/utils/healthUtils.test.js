import { describe, it, expect } from "vitest";
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateWeightLossCalories,
} from "./healthUtils";

describe("healthUtils", () => {
  it("calculates BMI correctly", () => {
    expect(calculateBMI(70, 175)).toBe(22.9);
  });

  it("returns correct BMI category", () => {
    expect(getBMICategory(17)).toBe("Underweight");
    expect(getBMICategory(22)).toBe("Normal Weight");
    expect(getBMICategory(27)).toBe("Overweight");
    expect(getBMICategory(35)).toBe("Obese");
  });

  it("calculates BMR correctly", () => {
    expect(calculateBMR(70, 175, 25, "male")).toBe(1673.75);
  });

  it("calculates weight loss calories", () => {
    expect(calculateWeightLossCalories(2500)).toEqual({
      mild: 2250,
      moderate: 2000,
      extreme: 1500,
    });
  });
});