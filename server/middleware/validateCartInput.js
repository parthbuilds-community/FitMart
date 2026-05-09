const validateCartInput = (req, res, next) => {
  let { productId, quantity } = req.body;

  // Check required fields
  if (productId === undefined || quantity === undefined) {
    return res.status(400).json({
      error: "productId and quantity are required",
    });
  }

  // Convert values to numbers
  productId = Number(productId);
  quantity = Number(quantity);

  // Validate productId
  if (Number.isNaN(productId) || !Number.isInteger(productId)) {
    return res.status(400).json({
      error: "productId must be an integer",
    });
  }

  // Validate quantity
  if (Number.isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      error: "quantity must be a positive integer",
    });
  }

  // Save cleaned values back to req.body
  req.body.productId = productId;
  req.body.quantity = quantity;

  next();
};

module.exports = validateCartInput;