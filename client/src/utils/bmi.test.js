import { describe, it, expect } from "vitest";

const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

describe("calculateBMI", () => {
  it("calculates BMI correctly", () => {
    expect(calculateBMI(70, 175)).toBeCloseTo(22.86, 1);
  });
});