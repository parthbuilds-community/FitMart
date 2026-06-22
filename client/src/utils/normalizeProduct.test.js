import { describe, it, expect } from 'vitest'
import { normalizeProduct } from './normalizeProduct'

describe('normalizeProduct', () => {
  it('uses productId when available', () => {
    const product = {
      productId: '123',
      name: 'Protein'
    }

    const result = normalizeProduct(product)

    expect(result.id).toBe('123')
    expect(result.productId).toBe('123')
  })
})