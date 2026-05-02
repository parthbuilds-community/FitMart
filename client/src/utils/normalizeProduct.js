export const normalizeProduct = (p) => {
  const normalizedId = p.productId ?? p.id;

  return {
    ...p,
    id: normalizedId,
    productId: normalizedId,
  };
};