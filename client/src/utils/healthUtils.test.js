import { describe, it, expect } from 'vitest';
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  getRecommendedCategory,
  calculateWeightLossCalories,
  calculateWeightGainCalories,
} from './healthUtils';

describe('healthUtils', () => {
  describe('calculateBMI', () => {
    it('calculates BMI correctly', () => {
      expect(calculateBMI(70, 175)).toBeCloseTo(22.9, 1);
      expect(calculateBMI(50, 160)).toBeCloseTo(19.5, 1);
    });

    it('returns 0 for invalid inputs', () => {
      expect(calculateBMI(0, 175)).toBe(0);
      expect(calculateBMI(70, 0)).toBe(0);
      expect(calculateBMI(70, -10)).toBe(0);
      expect(calculateBMI(null, undefined)).toBe(0);
    });
  });

  describe('getBMICategory', () => {
    it('returns correct category depending on BMI value', () => {
      expect(getBMICategory(0)).toBe('Invalid Input');
      expect(getBMICategory(-1)).toBe('Invalid Input');
      expect(getBMICategory(16)).toBe('Underweight');
      expect(getBMICategory(18.4)).toBe('Underweight');
      expect(getBMICategory(18.5)).toBe('Normal Weight');
      expect(getBMICategory(24.9)).toBe('Normal Weight');
      expect(getBMICategory(25)).toBe('Overweight');
      expect(getBMICategory(29.9)).toBe('Overweight');
      expect(getBMICategory(30)).toBe('Obese');
      expect(getBMICategory(40)).toBe('Obese');
    });
  });

  describe('calculateBMR', () => {
    it('calculates BMR correctly for males', () => {
      // (10 * 70) + (6.25 * 175) - (5 * 25) + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
      expect(calculateBMR(70, 175, 25, 'male')).toBe(1673.75);
    });

    it('calculates BMR correctly for females', () => {
      // (10 * 60) + (6.25 * 165) - (5 * 30) - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
      expect(calculateBMR(60, 165, 30, 'female')).toBe(1320.25);
    });

    it('returns 0 for missing inputs', () => {
      expect(calculateBMR(null, 175, 25, 'male')).toBe(0);
      expect(calculateBMR(70, null, 25, 'male')).toBe(0);
      expect(calculateBMR(70, 175, null, 'male')).toBe(0);
    });
  });

  describe('calculateTDEE', () => {
    it('calculates TDEE correctly', () => {
      expect(calculateTDEE(1600, 1.2)).toBe(1920);
      expect(calculateTDEE(2000, 1.55)).toBe(3100);
    });
  });

  describe('getRecommendedCategory', () => {
    it('recommends Nutrition for BMI < 18.5', () => {
      expect(getRecommendedCategory(18)).toBe('Nutrition');
    });

    it('recommends Equipment for BMI >= 25', () => {
      expect(getRecommendedCategory(26)).toBe('Equipment');
    });

    it('recommends Nutrition for normal BMI', () => {
      expect(getRecommendedCategory(22)).toBe('Nutrition');
    });
  });

  describe('calculateWeightLossCalories', () => {
    it('calculates weight loss calorie targets correctly', () => {
      const results = calculateWeightLossCalories(2000);
      expect(results.mild).toBe(1750);
      expect(results.moderate).toBe(1500);
      expect(results.extreme).toBe(1000);
    });

    it('returns 0 values if TDEE is missing', () => {
      expect(calculateWeightLossCalories(0)).toEqual({ mild: 0, moderate: 0, extreme: 0 });
    });
  });

  describe('calculateWeightGainCalories', () => {
    it('calculates weight gain calorie targets correctly', () => {
      const results = calculateWeightGainCalories(2000);
      expect(results.mild).toBe(2250);
      expect(results.moderate).toBe(2500);
      expect(results.fast).toBe(3000);
    });

    it('returns 0 values if TDEE is missing', () => {
      expect(calculateWeightGainCalories(0)).toEqual({ mild: 0, moderate: 0, fast: 0 });
    });
  });
});
