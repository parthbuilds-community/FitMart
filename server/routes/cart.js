const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const validateRequest = require('../middleware/validateRequest');
const { cartAddSchema, cartRemoveSchema } = require('../validation/requestSchemas');
const cartService = require('../services/cartService');

// Helper: check that the token uid matches the userId in the route
function checkOwnership(req, res) {
  if (req.user.uid !== req.params.userId) {
    res.status(403).json({ error: 'Forbidden — you can only access your own cart' });
    return false;
  }
  return true;
}

/**
 * @route   GET /api/cart/:userId
 * @desc    Get or create a cart for the given user
 * @access  Private
 */
router.get('/:userId', verifyFirebaseToken, async (req, res, next) => {
  if (!checkOwnership(req, res)) return;

  try {
    const cart = await cartService.getCart(req.params.userId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/cart/:userId/add
 * @desc    Add an item to the user's cart and reserve stock; body: { productId, quantity }
 * @access  Private
 */
router.post('/:userId/add', verifyFirebaseToken, validateRequest(cartAddSchema), async (req, res, next) => {
  if (!checkOwnership(req, res)) return;

  try {
    const result = await cartService.addToCart(req.params.userId, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/cart/:userId/remove
 * @desc    Remove an item (or reduce its quantity) from the user's cart and release reserved stock; body: { productId, quantity }
 * @access  Private
 */
router.post('/:userId/remove', verifyFirebaseToken, validateRequest(cartRemoveSchema), async (req, res, next) => {
  if (!checkOwnership(req, res)) return;

  try {
    const result = await cartService.removeFromCart(req.params.userId, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/cart/:userId
 * @desc    Clear all items from the user's cart and release all reserved stock
 * @access  Private
 */
router.delete('/:userId', verifyFirebaseToken, async (req, res, next) => {
  if (!checkOwnership(req, res)) return;

  try {
    const result = await cartService.clearCart(req.params.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Router-level error handler to map service errors to HTTP responses
router.use((err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

module.exports = router;
