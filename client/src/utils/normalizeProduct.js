/**
 * Normalizes a product object by ensuring consistent ID fields.
 * Handles cases where products may have either 'productId' or 'id' fields.
 * @param {Object} p - Product object to normalize
 * @returns {Object} Normalized product with both 'id' and 'productId' fields set to the same value
 */
export const normalizeProduct = (p) => {
  const normalizedId = p.productId ?? p.id;

  return {
    ...p,
    id: normalizedId,
    productId: normalizedId,
  };
};
