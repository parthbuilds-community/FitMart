const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const validateCartItemRequest = require('../middleware/validateCartItemRequest');

// Helper: adjust product reserved count
async function adjustReserved(productId, delta) {
  const prod = await Product.findOne({ productId: Number(productId) });
  if (!prod) throw new Error('Product not found');
  prod.reserved = Math.max(0, (prod.reserved || 0) + delta);
  await prod.save();
  return prod;
}

// Helper: check that the token uid matches the userId in the route
function checkOwnership(req, res) {
  if (req.user.uid !== req.params.userId) {
    res.status(403).json({ error: 'Forbidden — you can only access your own cart' });
    return false;
  }
  return true;
}

function ensureOwnership(req, res, next) {
  if (!checkOwnership(req, res)) return;
  next();
}

/**
 * @route   GET /api/cart/:userId
 * @desc    Get or create a cart for the given user
 * @access  Private
 */
router.get('/:userId', verifyFirebaseToken, ensureOwnership, async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/cart/:userId/add
 * @desc    Add an item to the user's cart and reserve stock; body: { productId, quantity }
 * @access  Private
 */
router.post('/:userId/add', verifyFirebaseToken, ensureOwnership, validateCartItemRequest, async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity: qty } = req.validatedCartItem;

    const product = await Product.findOne({ productId });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const available = product.stock == null ? Infinity : (product.stock - (product.reserved || 0));
    if (available < qty) return res.status(400).json({ error: 'Insufficient stock available' });

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const itemIdx = cart.items.findIndex(i => i.productId === productId);
    if (itemIdx >= 0) {
      cart.items[itemIdx].quantity += qty;
    } else {
      cart.items.push({ productId, quantity: qty });
    }

    await adjustReserved(productId, qty);
    await cart.save();
    const fresh = await Cart.findOne({ userId });
    res.json(fresh);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/cart/:userId/remove
 * @desc    Remove an item (or reduce its quantity) from the user's cart and release reserved stock; body: { productId, quantity }
 * @access  Private
 */
router.post('/:userId/remove', verifyFirebaseToken, ensureOwnership, validateCartItemRequest, async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity: qty } = req.validatedCartItem;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const itemIdx = cart.items.findIndex(i => i.productId === productId);
    if (itemIdx === -1) return res.status(404).json({ error: 'Item not in cart' });

    const removeQty = Math.min(cart.items[itemIdx].quantity, qty);
    cart.items[itemIdx].quantity -= removeQty;
    if (cart.items[itemIdx].quantity <= 0) cart.items.splice(itemIdx, 1);

    await adjustReserved(productId, -removeQty);
    await cart.save();
    const fresh = await Cart.findOne({ userId });
    res.json(fresh);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/cart/:userId
 * @desc    Clear all items from the user's cart and release all reserved stock
 * @access  Private
 */
router.delete('/:userId', verifyFirebaseToken, ensureOwnership, async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    for (const item of cart.items) {
      await adjustReserved(item.productId, -item.quantity);
    }

    cart.items = [];
    await cart.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
