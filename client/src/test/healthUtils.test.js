import { describe, it, expect } from 'vitest'
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  getRecommendedCategory,
  calculateWeightLossCalories,
  calculateWeightGainCalories,
} from '../utils/healthUtils'

describe('Health Utilities', () => {
  describe('calculateBMI', () => {
    it('calculates BMI correctly', () => {
      expect(calculateBMI(70, 175)).toBe(22.9)
    })

    it('returns 0 for invalid height', () => {
      expect(calculateBMI(70, 0)).toBe(0)
    })
  })

  describe('getBMICategory', () => {
    it('returns Underweight for BMI below 18.5', () => {
      expect(getBMICategory(17)).toBe('Underweight')
    })

    it('returns Normal Weight for normal BMI', () => {
      expect(getBMICategory(22)).toBe('Normal Weight')
    })

    it('returns Overweight for BMI between 25 and 29.9', () => {
      expect(getBMICategory(27)).toBe('Overweight')
    })

    it('returns Obese for BMI 30 or above', () => {
      expect(getBMICategory(30)).toBe('Obese')
    })

    it('returns Invalid Input for zero BMI', () => {
      expect(getBMICategory(0)).toBe('Invalid Input')
    })
  })

  describe('calculateBMR', () => {
    it('calculates male BMR correctly', () => {
      expect(calculateBMR(70, 175, 25, 'male')).toBe(1673.75)
    })

    it('calculates female BMR correctly', () => {
      expect(calculateBMR(60, 165, 25, 'female')).toBe(1345.25)
    })
  })

  describe('calculateTDEE', () => {
    it('calculates and rounds TDEE correctly', () => {
      expect(calculateTDEE(1688.75, 1.5)).toBe(2533)
    })
  })

  describe('getRecommendedCategory', () => {
    it('recommends Nutrition for underweight users', () => {
      expect(getRecommendedCategory(17)).toBe('Nutrition')
    })

    it('recommends Equipment for overweight users', () => {
      expect(getRecommendedCategory(27)).toBe('Equipment')
    })

    it('recommends Nutrition for normal weight users', () => {
      expect(getRecommendedCategory(22)).toBe('Nutrition')
    })
  })

  describe('calculateWeightLossCalories', () => {
    it('calculates weight loss calorie targets', () => {
      expect(calculateWeightLossCalories(2500)).toEqual({
        mild: 2250,
        moderate: 2000,
        extreme: 1500,
      })
    })

    it('returns zero values for invalid TDEE', () => {
      expect(calculateWeightLossCalories(0)).toEqual({
        mild: 0,
        moderate: 0,
        extreme: 0,
      })
    })
  })

  describe('calculateWeightGainCalories', () => {
    it('calculates weight gain calorie targets', () => {
      expect(calculateWeightGainCalories(2500)).toEqual({
        mild: 2750,
        moderate: 3000,
        fast: 3500,
      })
    })

    it('returns zero values for invalid TDEE', () => {
      expect(calculateWeightGainCalories(0)).toEqual({
        mild: 0,
        moderate: 0,
        fast: 0,
      })
    })
  })
})