const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const { createOrder } = require('../services/orderService');

/**
 * @route   POST /api/orders
 * @desc    Creates a new order from explicit items or the user's cart; snapshots product
 *          prices at time of purchase, deducts stock, and clears the user's cart;
 *          body: { userId, items?: [{ productId, quantity }] }
 * @access  Private
 */
router.post('/', verifyFirebaseToken, async (req, res) => {
  const { userId, items } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId required' });

  // ownership check — token uid must match the userId in the body
  if (req.user.uid !== userId) {
    return res.status(403).json({ error: 'Forbidden — you can only create orders for yourself' });
  }

  try {
    const order = await createOrder(userId, items);
    res.status(201).json(order);
  } catch (err) {
    console.error('Order creation error:', err.message);
    if (
      err.message === 'Cart is empty' ||
      err.message.includes('not found') ||
      err.message.includes('Insufficient stock')
    ) {
      return res.status(400).json({ error: err.message });
    }
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