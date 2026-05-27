const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

/**
 * Atomically adjusts Product.reserved by `delta` using a single findOneAndUpdate.
 *
 * Invariants enforced at the DB level:
 *   - reserved + delta >= 0  (reserved never goes negative)
 *   - reserved + delta <= stock  (never exceeds finite stock)
 *
 * Throws if the product is not found or if either invariant would be violated.
 *
 * @param {number}          productId - The product's numeric productId field
 * @param {number}          delta     - Amount to add (positive) or subtract (negative)
 * @param {ClientSession|null} [session=null] - Optional Mongoose session for transaction support
 * @returns {Promise<Product>} The updated product document
 */
// Atomic: check + increment happen in one findOneAndUpdate — no separate read needed.
async function adjustReserved(productId, delta, session = null) {
  // Always enforce: reserved + delta must be >= 0
  const filter = {
    productId: Number(productId),
    $expr: {
      $gte: [
        { $add: [{ $ifNull: ['$reserved', 0] }, delta] },
        0,
      ],
    },
  };

  // When adding to reserved, also enforce: reserved + delta must be <= stock
  // Skip this cap for unlimited products (stock === null)
  if (delta > 0) {
    filter.$or = [
      { stock: null },
      {
        $expr: {
          $lte: [
            { $add: [{ $ifNull: ['$reserved', 0] }, delta] },
            '$stock',
          ],
        },
      },
    ];
  }

  const updated = await Product.findOneAndUpdate(
    filter,
    { $inc: { reserved: delta } },
    {
      new: true,
      ...(session ? { session } : {}),
    }
  );

  if (!updated) {
    const reason = delta > 0
      ? 'insufficient stock or product not found'
      : 'reserved count cannot drop below zero or product not found';
    throw new Error(`Failed to adjust reserved stock: ${reason}`);
  }

  return updated;
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
