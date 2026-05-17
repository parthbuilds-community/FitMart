function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPositiveInteger(value) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function validateCartItemRequest(req, res, next) {
  const { productId, quantity } = req.body || {};

  if (productId == null) {
    return res.status(400).json({ error: 'productId is required' });
  }

  if (!isFiniteNumber(productId)) {
    return res.status(400).json({ error: 'productId must be a number' });
  }

  if (quantity == null) {
    return res.status(400).json({ error: 'quantity is required' });
  }

  if (!isPositiveInteger(quantity)) {
    return res.status(400).json({ error: 'quantity must be a positive integer greater than 0' });
  }

  req.validatedCartItem = { productId, quantity };
  next();
}

module.exports = validateCartItemRequest;
