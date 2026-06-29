import { describe, it, expect } from 'vitest';
import { fmt } from './formatters';

describe('fmt', () => {
  it('formats a positive number as INR currency', () => {
    expect(fmt(1499)).toBe('₹1,499');
  });

  it('formats zero correctly', () => {
    expect(fmt(0)).toBe('₹0');
  });

  it('formats large numbers with Indian grouping', () => {
    // Indian numbering: 1,00,000 (one lakh)
    expect(fmt(100000)).toBe('₹1,00,000');
  });

  it('rounds fractional amounts to zero decimal places', () => {
    expect(fmt(1499.99)).toBe('₹1,500');
  });

  it('handles small values', () => {
    expect(fmt(10)).toBe('₹10');
  });
});
