const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

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

/**
 * @route   GET /api/cart/:userId
 */
router.get('/:userId', verifyFirebaseToken, async (req, res) => {
  if (!checkOwnership(req, res)) return;

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
 */
router.post('/:userId/add', verifyFirebaseToken, async (req, res) => {
  if (!checkOwnership(req, res)) return;

  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    // ✅ VALIDATION START
    if (productId == null || quantity == null) {
      return res.status(400).json({ error: 'productId and quantity required' });
    }

    if (typeof productId !== 'number' || Number.isNaN(productId)) {
      return res.status(400).json({ error: 'productId must be a number' });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive integer' });
    }
    // ✅ VALIDATION END

    const qty = quantity;

    const product = await Product.findOne({ productId: productId });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const available = product.stock == null
      ? Infinity
      : (product.stock - (product.reserved || 0));

    if (available < qty) {
      return res.status(400).json({ error: 'Insufficient stock available' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const itemIdx = cart.items.findIndex(i => i.productId === productId);

    if (itemIdx >= 0) {
      cart.items[itemIdx].quantity += qty;
    } else {
      cart.items.push({ productId: productId, quantity: qty });
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
 */
router.post('/:userId/remove', verifyFirebaseToken, async (req, res) => {
  if (!checkOwnership(req, res)) return;

  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    // ✅ VALIDATION START
    if (productId == null || quantity == null) {
      return res.status(400).json({ error: 'productId and quantity required' });
    }

    if (typeof productId !== 'number' || Number.isNaN(productId)) {
      return res.status(400).json({ error: 'productId must be a number' });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive integer' });
    }
    // ✅ VALIDATION END

    const qty = quantity;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const itemIdx = cart.items.findIndex(i => i.productId === productId);
    if (itemIdx === -1) {
      return res.status(404).json({ error: 'Item not in cart' });
    }

    const removeQty = Math.min(cart.items[itemIdx].quantity, qty);

    cart.items[itemIdx].quantity -= removeQty;
    if (cart.items[itemIdx].quantity <= 0) {
      cart.items.splice(itemIdx, 1);
    }

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
 */
router.delete('/:userId', verifyFirebaseToken, async (req, res) => {
  if (!checkOwnership(req, res)) return;

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
