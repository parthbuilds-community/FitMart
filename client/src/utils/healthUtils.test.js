import { describe, it, expect } from "vitest";
import {
  calculateBMI,
  getBMICategory,
  calculateWeightLossCalories,
} from "./healthUtils";

describe("Health Utils", () => {
  it("calculates BMI correctly", () => {
    expect(calculateBMI(70, 175)).toBe(22.9);
  });

  it("returns correct BMI category", () => {
    expect(getBMICategory(22.9)).toBe("Normal Weight");
    expect(getBMICategory(17)).toBe("Underweight");
    expect(getBMICategory(28)).toBe("Overweight");
    expect(getBMICategory(35)).toBe("Obese");
  });

  it("calculates weight loss calorie targets", () => {
    expect(calculateWeightLossCalories(2500)).toEqual({
      mild: 2250,
      moderate: 2000,
      extreme: 1500,
    });
  });
});