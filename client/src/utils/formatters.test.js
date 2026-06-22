import { describe, it, expect } from 'vitest';
import { fmt } from './formatters';

describe('fmt', () => {
  it('formats a number as Indian currency', () => {
    expect(fmt(1000)).toBe('₹1,000');
  });

  it('formats large numbers correctly', () => {
    expect(fmt(25000)).toBe('₹25,000');
  });
});