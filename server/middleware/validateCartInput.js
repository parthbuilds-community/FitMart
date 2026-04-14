const validateCartInput = (req, res, next) => {
  let { productId, quantity } = req.body;

  // Check required fields
  if (productId === undefined || quantity === undefined) {
    return res.status(400).json({
      error: "productId and quantity are required",
    });
  }

  // Convert to number
  productId = Number(productId);
  quantity = Number(quantity);

  // Validate productId
  if (!Number.isInteger(productId)) {
    return res.status(400).json({
      error: "productId must be an integer",
    });
  }

  // Validate quantity
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      error: "quantity must be a positive integer",
    });
  }

  // overwrite cleaned values (IMPORTANT)
  req.body.productId = productId;
  req.body.quantity = quantity;

  next();
};

module.exports = validateCartInput;
