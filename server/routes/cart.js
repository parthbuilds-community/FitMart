const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const ensureOwnership = require('../middleware/ownership');
const validateRequest = require('../middleware/validateRequest');
const { cartAddSchema, cartRemoveSchema } = require('../validation/requestSchemas');
const ensureCartOwnership = ensureOwnership('Forbidden — you can only access your own cart');

// Helper: adjust product reserved count
async function adjustReserved(productId, delta) {
  const prod = await Product.findOne({ productId: Number(productId) });
  if (!prod) throw new Error('Product not found');
  prod.reserved = Math.max(0, (prod.reserved || 0) + delta);
  await prod.save();
  return prod;
}

/**
 * @route   GET /api/cart/:userId
 * @desc    Get or create a cart for the given user
 * @access  Private
 */
router.get('/:userId', verifyFirebaseToken, ensureCartOwnership, async (req, res) => {
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
router.post('/:userId/add', verifyFirebaseToken, ensureCartOwnership, validateRequest(cartAddSchema), async (req, res) => {

  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    if (productId == null || quantity == null) return res.status(400).json({ error: 'productId and quantity required' });

    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty <= 0) return res.status(400).json({ error: 'quantity must be a positive number' });

    const product = await Product.findOne({ productId: Number(productId) });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const available = product.stock == null ? Infinity : (product.stock - (product.reserved || 0));
    if (available < qty) return res.status(400).json({ error: 'Insufficient stock available' });

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const itemIdx = cart.items.findIndex(i => i.productId === Number(productId));
    if (itemIdx >= 0) {
      cart.items[itemIdx].quantity += qty;
    } else {
      cart.items.push({ productId: Number(productId), quantity: qty });
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
router.post('/:userId/remove', verifyFirebaseToken, ensureCartOwnership, validateRequest(cartRemoveSchema), async (req, res) => {

  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    if (productId == null || quantity == null) return res.status(400).json({ error: 'productId and quantity required' });

    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty <= 0) return res.status(400).json({ error: 'quantity must be a positive number' });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const itemIdx = cart.items.findIndex(i => i.productId === Number(productId));
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
router.delete('/:userId', verifyFirebaseToken, ensureCartOwnership, async (req, res) => {
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
