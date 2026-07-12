import { describe, it, expect } from 'vitest';
import { calculateBMI, getBMICategory } from './healthUtils';

describe('calculateBMI', () => {
  it('calculates BMI from weight (kg) and height (cm)', () => {
    expect(calculateBMI(70, 175)).toBeCloseTo(22.9, 1);
  });

  it('returns 0 for missing or invalid input', () => {
    expect(calculateBMI(0, 175)).toBe(0);
    expect(calculateBMI(70, 0)).toBe(0);
    expect(calculateBMI(70, -10)).toBe(0);
  });
});

describe('getBMICategory', () => {
  it('classifies BMI values into the correct WHO category', () => {
    expect(getBMICategory(17)).toBe('Underweight');
    expect(getBMICategory(22)).toBe('Normal Weight');
    expect(getBMICategory(27)).toBe('Overweight');
    expect(getBMICategory(32)).toBe('Obese');
  });

  it('flags non-positive BMI as invalid input', () => {
    expect(getBMICategory(0)).toBe('Invalid Input');
    expect(getBMICategory(-5)).toBe('Invalid Input');
  });
});
