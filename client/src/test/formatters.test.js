import { describe, it, expect } from 'vitest'
import { fmt } from '../utils/formatters'

describe('fmt', () => {
  it('formats a number as Indian Rupees', () => {
    expect(fmt(1000)).toBe('₹1,000')
  })

  it('formats larger amounts correctly', () => {
    expect(fmt(50000)).toBe('₹50,000')
  })

  it('removes decimal places', () => {
    expect(fmt(1299.99)).toBe('₹1,300')
  })

  it('formats zero correctly', () => {
    expect(fmt(0)).toBe('₹0')
  })
})