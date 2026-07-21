import { describe, it, expect } from 'vitest';
import { normalizeProduct } from './normalizeProduct';

describe('normalizeProduct', () => {
  it('mirrors productId into id when only productId is present', () => {
    const result = normalizeProduct({ productId: 42, name: 'Dumbbell' });
    expect(result.id).toBe(42);
    expect(result.productId).toBe(42);
  });

  it('mirrors id into productId when only id is present', () => {
    const result = normalizeProduct({ id: 7, name: 'Yoga Mat' });
    expect(result.id).toBe(7);
    expect(result.productId).toBe(7);
  });

  it('prefers productId when both fields are already present', () => {
    const result = normalizeProduct({ id: 1, productId: 2 });
    expect(result.id).toBe(2);
    expect(result.productId).toBe(2);
  });

  it('preserves other fields on the product', () => {
    const result = normalizeProduct({ productId: 5, name: 'Kettlebell', price: 1999 });
    expect(result).toMatchObject({ name: 'Kettlebell', price: 1999 });
  });
});