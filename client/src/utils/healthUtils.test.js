import { describe, it, expect } from "vitest";
import {
  calculateWeightLossCalories,
  calculateWeightGainCalories,
} from "./healthUtils";

describe("healthUtils", () => {
  it("calculates weight loss calories correctly", () => {
    expect(calculateWeightLossCalories(2000)).toEqual({
      mild: 1750,
      moderate: 1500,
      extreme: 1000,
    });
  });

  it("calculates weight gain calories correctly", () => {
    expect(calculateWeightGainCalories(2000)).toEqual({
      mild: 2250,
      moderate: 2500,
      fast: 3000,
    });
  });
});