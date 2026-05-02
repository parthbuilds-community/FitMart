export const normalizeProduct = (p) => ({
  ...p,
  id: p.productId ?? p.id,
  productId: p.productId ?? p.id,
});
