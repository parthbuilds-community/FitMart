const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const UserProfile = require('../models/UserProfile');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

/**
 * @route   POST /api/orders
 * @desc    Creates a new order from explicit items or the user's cart; snapshots product
 *          prices at time of purchase, deducts stock, and clears the user's cart;
 *          Atomically checks and applies discount if eligible.
 *          body: { userId, items?: [{ productId, quantity }], discountApplied?: boolean }
 * @access  Private
 */
router.post('/', verifyFirebaseToken, async (req, res) => {
  const { userId, items, discountApplied = false } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId required' });

  // ownership check — token uid must match the userId in the body
  if (req.user.uid !== userId) {
    return res.status(403).json({ error: 'Forbidden — you can only create orders for yourself' });
  }

  try {
    let orderItems = items;
    if (!orderItems || !orderItems.length) {
      const cart = await Cart.findOne({ userId });
      if (!cart || !cart.items.length) return res.status(400).json({ error: 'Cart is empty' });
      orderItems = cart.items.map(i => ({ productId: i.productId, quantity: i.quantity }));
    }

    // Build order items with price snapshot
    const populated = [];
    let total = 0;
    for (const it of orderItems) {
      const p = await Product.findOne({ productId: Number(it.productId) });
      if (!p) return res.status(400).json({ error: `Product ${it.productId} not found` });
      // Oversell guard - skip check if stock is null (unlimited)
      if (p.stock !== null) {
        const available = p.stock - p.reserved;
        if (available < it.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for ${p.name}. Available: ${available}`
          });
        }
      }
      populated.push({ productId: p.productId, quantity: it.quantity, price: p.price });
      total += p.price * it.quantity;
    }

    // ATOMIC: Check and mark discount as used BEFORE creating order
    let actualDiscountApplied = false;
    if (discountApplied) {
      const profile = await UserProfile.findOneAndUpdate(
        { userId, discountUsed: false },   // only update if not already used
        { $set: { discountUsed: true } },
        { new: true }
      );

      if (profile) {
        actualDiscountApplied = true;
      } else {
        // Discount already used - reject the order
        return res.status(400).json({ 
          error: 'Discount already applied to another order. Cannot apply twice.' 
        });
      }
    }

    // After order is created, deduct stock and reserved for each item
    const order = await Order.create({ userId, items: populated, total, discountApplied: actualDiscountApplied });
    for (const it of orderItems) {
      const p = await Product.findOne({ productId: Number(it.productId) });
      if (p && p.stock !== null) {
        await Product.findOneAndUpdate(
          { productId: p.productId },
          { $inc: { stock: -it.quantity, reserved: -it.quantity } }
        );
      }
    }

    // clear cart (do NOT release reserved - purchasing finalizes reservation)
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/orders/:userId
 * @desc    Returns all orders for a given user, sorted by most recent first
 * @access  Private
 */
router.get('/:userId', verifyFirebaseToken, async (req, res) => {
  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({ error: 'Forbidden — you can only view your own orders' });
  }

  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;