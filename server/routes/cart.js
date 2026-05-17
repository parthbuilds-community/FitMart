const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

// Helper: atomically adjust product reserved count (avoids read-modify-write races)
async function adjustReserved(productId, delta) {
  const pid = Number(productId);
  const change = Number(delta);
  if (Number.isNaN(pid) || Number.isNaN(change) || change === 0) {
    throw new Error('Invalid productId or delta');
  }

  if (change > 0) {
    const updated = await Product.findOneAndUpdate(
      {
        productId: pid,
        $or: [
          { stock: null },
          {
            $expr: {
              $lte: [{ $add: [{ $ifNull: ['$reserved', 0] }, change] }, '$stock'],
            },
          },
        ],
      },
      { $inc: { reserved: change } },
      { new: true }
    );
    if (!updated) {
      throw new Error('Reserved update failed (insufficient stock or product not found)');
    }
    return updated;
  }

  const absChange = Math.abs(change);
  const updated = await Product.findOneAndUpdate(
    { productId: pid, reserved: { $gte: absChange } },
    { $inc: { reserved: change } },
    { new: true }
  );
  if (updated) return updated;

  const clamped = await Product.findOneAndUpdate(
    { productId: pid },
    { $set: { reserved: 0 } },
    { new: true }
  );
  if (!clamped) throw new Error('Product not found');
  return clamped;
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
 * @desc    Get or create a cart for the given user
 * @access  Private
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
 * @desc    Add an item to the user's cart and reserve stock; body: { productId, quantity }
 * @access  Private
 */
router.post('/:userId/add', verifyFirebaseToken, async (req, res) => {
  if (!checkOwnership(req, res)) return;

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
router.post('/:userId/remove', verifyFirebaseToken, async (req, res) => {
  if (!checkOwnership(req, res)) return;

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