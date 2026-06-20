// client/src/utils/healthUtils.test.js

import { describe, it, expect } from 'vitest'
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  getRecommendedCategory,
  calculateWeightLossCalories,
  calculateWeightGainCalories,
} from './healthUtils'


// ─────────────────────────────────────────────
// 1. calculateBMI
// Formula: weight / (heightCm/100)^2
// ─────────────────────────────────────────────
describe('calculateBMI', () => {

  it('calculates BMI correctly for a normal person', () => {
    // ARRANGE: 70kg, 175cm
    // MATH: 70 / (1.75 * 1.75) = 70 / 3.0625 = 22.9
    const result = calculateBMI(70, 175)   // ACT
    expect(result).toBe(22.9)              // ASSERT
  })

  it('returns 0 if weight is missing', () => {
    const result = calculateBMI(0, 175)
    expect(result).toBe(0)
  })

  it('returns 0 if height is 0 (avoids divide by zero)', () => {
    const result = calculateBMI(70, 0)
    expect(result).toBe(0)
  })

  it('returns 0 if both values are missing', () => {
    const result = calculateBMI(null, null)
    expect(result).toBe(0)
  })

})


// ─────────────────────────────────────────────
// 2. getBMICategory
// ─────────────────────────────────────────────
describe('getBMICategory', () => {

  it('returns "Invalid Input" for BMI of 0', () => {
    expect(getBMICategory(0)).toBe('Invalid Input')
  })

  it('returns "Underweight" for BMI below 18.5', () => {
    expect(getBMICategory(17)).toBe('Underweight')
  })

  it('returns "Normal Weight" for BMI between 18.5 and 24.9', () => {
    expect(getBMICategory(22)).toBe('Normal Weight')
  })

  it('returns "Overweight" for BMI between 25 and 29.9', () => {
    expect(getBMICategory(27)).toBe('Overweight')
  })

  it('returns "Obese" for BMI 30 or above', () => {
    expect(getBMICategory(35)).toBe('Obese')
  })

  // 🔍 Edge cases — testing the exact boundary values
  it('returns "Normal Weight" at exactly 18.5 (boundary check)', () => {
    expect(getBMICategory(18.5)).toBe('Normal Weight')
  })

  it('returns "Overweight" at exactly 25 (boundary check)', () => {
    expect(getBMICategory(25)).toBe('Overweight')
  })

})


// ─────────────────────────────────────────────
// 3. calculateBMR (Mifflin-St Jeor Equation)
// Male:   10*w + 6.25*h - 5*age + 5
// Female: 10*w + 6.25*h - 5*age - 161
// ─────────────────────────────────────────────
describe('calculateBMR', () => {

  it('calculates BMR correctly for a male', () => {
    // 10*70 + 6.25*175 - 5*25 + 5
    // = 700 + 1093.75 - 125 + 5 = 1673.75
    const result = calculateBMR(70, 175, 25, 'male')
    expect(result).toBe(1673.75)
  })

  it('calculates BMR correctly for a female', () => {
    // 10*60 + 6.25*165 - 5*30 - 161
    // = 600 + 1031.25 - 150 - 161 = 1320.25
    const result = calculateBMR(60, 165, 30, 'female')
    expect(result).toBe(1320.25)
  })

  it('returns 0 if any required value is missing', () => {
    expect(calculateBMR(0, 175, 25, 'male')).toBe(0)
    expect(calculateBMR(70, 0, 25, 'male')).toBe(0)
    expect(calculateBMR(70, 175, 0, 'male')).toBe(0)
  })

})


// ─────────────────────────────────────────────
// 4. calculateTDEE
// Simply: Math.round(bmr * multiplier)
// ─────────────────────────────────────────────
describe('calculateTDEE', () => {

  it('calculates TDEE for a sedentary person (multiplier 1.2)', () => {
    // Math.round(1674 * 1.2) = Math.round(2008.8) = 2009
    const result = calculateTDEE(1674, 1.2)
    expect(result).toBe(2009)
  })

  it('calculates TDEE for a very active person (multiplier 1.725)', () => {
    // Math.round(1674 * 1.725) = Math.round(2887.65) = 2888
    const result = calculateTDEE(1674, 1.725)
    expect(result).toBe(2888)
  })

})


// ─────────────────────────────────────────────
// 5. getRecommendedCategory
// ─────────────────────────────────────────────
describe('getRecommendedCategory', () => {

  it('recommends "Nutrition" for underweight (BMI < 18.5)', () => {
    expect(getRecommendedCategory(16)).toBe('Nutrition')
  })

  it('recommends "Nutrition" for normal weight (BMI 18.5–24.9)', () => {
    expect(getRecommendedCategory(22)).toBe('Nutrition')
  })

  it('recommends "Equipment" for overweight (BMI >= 25)', () => {
    expect(getRecommendedCategory(28)).toBe('Equipment')
  })

  it('recommends "Equipment" for obese (BMI >= 30)', () => {
    expect(getRecommendedCategory(35)).toBe('Equipment')
  })

})


// ─────────────────────────────────────────────
// 6. calculateWeightLossCalories
// ─────────────────────────────────────────────
describe('calculateWeightLossCalories', () => {

  it('returns correct deficit calories for a 2000 kcal TDEE', () => {
    const result = calculateWeightLossCalories(2000)

    expect(result.mild).toBe(1750)      // 2000 - 250
    expect(result.moderate).toBe(1500)  // 2000 - 500
    expect(result.extreme).toBe(1000)   // 2000 - 1000
  })

  it('returns all zeros if TDEE is missing', () => {
    const result = calculateWeightLossCalories(0)

    expect(result).toEqual({ mild: 0, moderate: 0, extreme: 0 })
  })

})


// ─────────────────────────────────────────────
// 7. calculateWeightGainCalories
// ─────────────────────────────────────────────
describe('calculateWeightGainCalories', () => {

  it('returns correct surplus calories for a 2000 kcal TDEE', () => {
    const result = calculateWeightGainCalories(2000)

    expect(result.mild).toBe(2250)      // 2000 + 250
    expect(result.moderate).toBe(2500)  // 2000 + 500
    expect(result.fast).toBe(3000)      // 2000 + 1000
  })

  it('returns all zeros if TDEE is missing', () => {
    const result = calculateWeightGainCalories(0)

    expect(result).toEqual({ mild: 0, moderate: 0, fast: 0 })
  })

})