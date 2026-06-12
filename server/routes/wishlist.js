const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

// GET /api/wishlist/:userId
router.get('/:userId', verifyFirebaseToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    if (!wishlist || wishlist.items.length === 0) {
      return res.json({ items: [] });
    }

    const productIds = wishlist.items.map(item => item.productId);
    const products = await Product.find({ productId: { $in: productIds } });

    res.json({ items: products });
  } catch (err) {
    console.error('GET wishlist error:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// POST /api/wishlist/:userId/add
router.post('/:userId/add', verifyFirebaseToken, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.params.userId },
      { $addToSet: { items: { productId } } },
      { new: true, upsert: true }
    );

    res.json({ message: 'Added to wishlist', wishlist });
  } catch (err) {
    console.error('ADD wishlist error:', err);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// POST /api/wishlist/:userId/remove
router.post('/:userId/remove', verifyFirebaseToken, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.params.userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    res.json({ message: 'Removed from wishlist', wishlist });
  } catch (err) {
    console.error('REMOVE wishlist error:', err);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// DELETE /api/wishlist/:userId
router.delete('/:userId', verifyFirebaseToken, async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { items: [] } }
    );
    res.json({ message: 'Wishlist cleared' });
  } catch (err) {
    console.error('CLEAR wishlist error:', err);
    res.status(500).json({ error: 'Failed to clear wishlist' });
  }
});

module.exports = router;