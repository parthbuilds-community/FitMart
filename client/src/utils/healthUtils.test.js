import { describe, it, expect } from 'vitest';
import { calculateBMI, getBMICategory } from './healthUtils';

describe('Health Utilities (BMI Calculations)', () => {
  
  describe('calculateBMI', () => {
    it('calculates BMI correctly given valid weight and height', () => {
      // 70kg and 175cm should equal a BMI of roughly 22.9
      expect(calculateBMI(70, 175)).toBe(22.9);
    });

    it('returns 0 if invalid or missing inputs are provided', () => {
      expect(calculateBMI(0, 175)).toBe(0);
      expect(calculateBMI(70, 0)).toBe(0);
      expect(calculateBMI(null, null)).toBe(0);
    });
  });

  describe('getBMICategory', () => {
    it('returns the correct category for different BMI ranges', () => {
      expect(getBMICategory(17)).toBe("Underweight");
      expect(getBMICategory(22.5)).toBe("Normal Weight");
      expect(getBMICategory(27)).toBe("Overweight");
      expect(getBMICategory(32)).toBe("Obese");
    });

    it('returns "Invalid Input" for a BMI of 0 or less', () => {
      expect(getBMICategory(0)).toBe("Invalid Input");
      expect(getBMICategory(-5)).toBe("Invalid Input");
    });
  });

});