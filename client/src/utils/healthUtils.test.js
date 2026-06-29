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

describe('calculateBMI', () => {
  it('calculates BMI correctly for a normal-weight person', () => {
    // 70 kg, 175 cm → 70 / 1.75² ≈ 22.9
    expect(calculateBMI(70, 175)).toBe(22.9);
  });

  it('calculates BMI for an underweight person', () => {
    // 50 kg, 180 cm → 50 / 1.80² ≈ 15.4
    expect(calculateBMI(50, 180)).toBe(15.4);
  });

  it('calculates BMI for an overweight person', () => {
    // 85 kg, 170 cm → 85 / 1.70² ≈ 29.4
    expect(calculateBMI(85, 170)).toBe(29.4);
  });

  it('calculates BMI for an obese person', () => {
    // 110 kg, 165 cm → 110 / 1.65² ≈ 40.4
    expect(calculateBMI(110, 165)).toBe(40.4);
  });

  it('returns 0 when weight is falsy', () => {
    expect(calculateBMI(0, 175)).toBe(0);
    expect(calculateBMI(null, 175)).toBe(0);
  });

  it('returns 0 when height is falsy or zero', () => {
    expect(calculateBMI(70, 0)).toBe(0);
    expect(calculateBMI(70, null)).toBe(0);
  });
});

describe('getBMICategory', () => {
  it('returns "Invalid Input" for zero or negative BMI', () => {
    expect(getBMICategory(0)).toBe('Invalid Input');
    expect(getBMICategory(-5)).toBe('Invalid Input');
  });

  it('returns "Underweight" for BMI < 18.5', () => {
    expect(getBMICategory(17.5)).toBe('Underweight');
    expect(getBMICategory(18.4)).toBe('Underweight');
  });

  it('returns "Normal Weight" for 18.5 <= BMI < 25', () => {
    expect(getBMICategory(18.5)).toBe('Normal Weight');
    expect(getBMICategory(22)).toBe('Normal Weight');
    expect(getBMICategory(24.9)).toBe('Normal Weight');
  });

  it('returns "Overweight" for 25 <= BMI < 30', () => {
    expect(getBMICategory(25)).toBe('Overweight');
    expect(getBMICategory(27.3)).toBe('Overweight');
    expect(getBMICategory(29.9)).toBe('Overweight');
  });

  it('returns "Obese" for BMI >= 30', () => {
    expect(getBMICategory(30)).toBe('Obese');
    expect(getBMICategory(35)).toBe('Obese');
  });
});

describe('calculateBMR', () => {
  it('calculates BMR for a male using Mifflin-St Jeor', () => {
    // Male: 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
    expect(calculateBMR(70, 175, 25, 'male')).toBe(1673.75);
  });

  it('calculates BMR for a female using Mifflin-St Jeor', () => {
    // Female: 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
    expect(calculateBMR(60, 165, 30, 'female')).toBe(1320.25);
  });

  it('returns 0 when any input is falsy', () => {
    expect(calculateBMR(0, 175, 25, 'male')).toBe(0);
    expect(calculateBMR(70, 0, 25, 'male')).toBe(0);
    expect(calculateBMR(70, 175, 0, 'male')).toBe(0);
  });
});

describe('calculateTDEE', () => {
  it('calculates TDEE by multiplying BMR by activity multiplier', () => {
    // Sedentary (1.2): 1673.75 * 1.2 = 2008.5 → rounded to 2009
    expect(calculateTDEE(1673.75, 1.2)).toBe(2009);
  });

  it('handles moderate activity multiplier', () => {
    // Moderate (1.55): 1673.75 * 1.55 = 2594.3125 → rounded to 2594
    expect(calculateTDEE(1673.75, 1.55)).toBe(2594);
  });
});

describe('getRecommendedCategory', () => {
  it('recommends "Nutrition" for underweight BMI', () => {
    expect(getRecommendedCategory(17)).toBe('Nutrition');
  });

  it('recommends "Nutrition" for normal BMI', () => {
    expect(getRecommendedCategory(22)).toBe('Nutrition');
  });

  it('recommends "Equipment" for overweight BMI', () => {
    expect(getRecommendedCategory(27)).toBe('Equipment');
  });

  it('recommends "Equipment" for obese BMI', () => {
    expect(getRecommendedCategory(32)).toBe('Equipment');
  });
});

describe('calculateWeightLossCalories', () => {
  it('returns zero targets when TDEE is 0', () => {
    expect(calculateWeightLossCalories(0)).toEqual({ mild: 0, moderate: 0, extreme: 0 });
  });

  it('calculates deficit targets from TDEE', () => {
    const tdee = 2500;
    const result = calculateWeightLossCalories(tdee);
    expect(result.mild).toBe(2250);    // 2500 - 250
    expect(result.moderate).toBe(2000); // 2500 - 500
    expect(result.extreme).toBe(1500); // 2500 - 1000
  });
});

describe('calculateWeightGainCalories', () => {
  it('returns zero targets when TDEE is 0', () => {
    expect(calculateWeightGainCalories(0)).toEqual({ mild: 0, moderate: 0, fast: 0 });
  });

  it('calculates surplus targets from TDEE', () => {
    const tdee = 2500;
    const result = calculateWeightGainCalories(tdee);
    expect(result.mild).toBe(2750);    // 2500 + 250
    expect(result.moderate).toBe(3000); // 2500 + 500
    expect(result.fast).toBe(3500);    // 2500 + 1000
  });
});
