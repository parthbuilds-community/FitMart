import { describe, it, expect } from 'vitest';
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateWeightLossCalories,
  calculateWeightGainCalories,
} from './healthUtils';

describe('calculateBMI', () => {
  it('computes BMI from weight (kg) and height (cm)', () => {
    expect(calculateBMI(70, 175)).toBe(22.9);
  });

  it('returns 0 for missing or invalid inputs', () => {
    expect(calculateBMI(0, 175)).toBe(0);
    expect(calculateBMI(70, 0)).toBe(0);
    expect(calculateBMI(null, 175)).toBe(0);
  });
});

describe('getBMICategory', () => {
  it('categorizes BMI per WHO bands', () => {
    expect(getBMICategory(17)).toBe('Underweight');
    expect(getBMICategory(22)).toBe('Normal Weight');
    expect(getBMICategory(27)).toBe('Overweight');
    expect(getBMICategory(32)).toBe('Obese');
  });

  it('flags non-positive BMI as invalid', () => {
    expect(getBMICategory(0)).toBe('Invalid Input');
    expect(getBMICategory(-5)).toBe('Invalid Input');
  });
});

describe('calculateBMR', () => {
  it('applies the Mifflin-St Jeor formula for men', () => {
    expect(calculateBMR(70, 175, 25, 'male')).toBeCloseTo(1673.75);
  });

  it('applies the Mifflin-St Jeor formula for women', () => {
    expect(calculateBMR(60, 165, 25, 'female')).toBeCloseTo(1345.25);
  });
});

describe('calorie target helpers', () => {
  it('derives weight-loss targets from TDEE', () => {
    expect(calculateWeightLossCalories(2500)).toEqual({
      mild: 2250,
      moderate: 2000,
      extreme: 1500,
    });
  });

  it('derives weight-gain targets from TDEE', () => {
    expect(calculateWeightGainCalories(2500)).toEqual({
      mild: 2750,
      moderate: 3000,
      fast: 3500,
    });
  });
});