import { describe, expect, it } from "vitest";
import { calculateBMI, getBMICategory } from "./healthUtils";

describe("calculateBMI", () => {
	it("returns 0 for invalid input", () => {
		expect(calculateBMI(0, 170)).toBe(0);
		expect(calculateBMI(70, 0)).toBe(0);
		expect(calculateBMI(undefined, 170)).toBe(0);
	});

	it("calculates BMI with one decimal precision", () => {
		expect(calculateBMI(70, 175)).toBe(22.9);
		expect(calculateBMI(90, 180)).toBe(27.8);
	});
});

describe("getBMICategory", () => {
	it("maps BMI values to categories", () => {
		expect(getBMICategory(0)).toBe("Invalid Input");
		expect(getBMICategory(17.9)).toBe("Underweight");
		expect(getBMICategory(22.0)).toBe("Normal Weight");
		expect(getBMICategory(27.0)).toBe("Overweight");
		expect(getBMICategory(32.5)).toBe("Obese");
	});
});
