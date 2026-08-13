import { describe, expect, it } from "vitest";
import { calculateBMI, getBMICategory } from "./healthUtils";

describe("health utilities", () => {
  it("calculates BMI from kilograms and centimetres", () => {
    expect(calculateBMI(70, 175)).toBe(22.9);
  });

  it("classifies BMI values using WHO categories", () => {
    expect(getBMICategory(22.9)).toBe("Normal Weight");
    expect(getBMICategory(31)).toBe("Obese");
  });
});