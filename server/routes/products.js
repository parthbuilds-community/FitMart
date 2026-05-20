const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const validateRequest = require('../middleware/validateRequest');
const { createProductSchema, updateProductSchema } = require('../validation/requestSchemas');

/**
 * @route   GET /api/products
 * @desc    Returns all products sorted by productId in ascending order
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ productId: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/products/low-stock
 * @desc    Returns all products where available stock (stock - reserved) is below threshold of 5
 * @access  Public
 */
// GET /api/products/low-stock - get products with low stock
const LOW_STOCK_THRESHOLD = 5;

router.get('/low-stock', async (req, res) => {
  try {
    // only check products where stock is not null
    const products = await Product.find({ stock: { $ne: null } });
    const lowStock = products.filter(p => (p.stock - p.reserved) < LOW_STOCK_THRESHOLD);
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Returns a single product by its productId
 * @access  Public
 */
// GET /api/products/:id - get product by productId
router.get('/:id', async (req, res) => {
  const productId = Number(req.params.id);

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID. It must be a number.' });
  }

  try {
    const product = await Product.findOne({ productId });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/products
 * @desc    Creates a new product; body: full product object including unique productId
 * @access  Private (Admin)
 */
router.post('/', verifyFirebaseToken, verifyAdmin, validateRequest(createProductSchema), async (req, res) => {
  try {
    const body = req.body;
    const existing = await Product.findOne({ productId: body.productId });
    if (existing) return res.status(400).json({ error: 'productId already exists' });
    const p = new Product(body);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Updates an existing product by productId; body: fields to update
 * @access  Private (Admin)
 */
router.put('/:id', verifyFirebaseToken, verifyAdmin, validateRequest(updateProductSchema), async (req, res) => {
  const productId = Number(req.params.id);

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID. It must be a number.' });
  }
  
  try {
    const updated = await Product.findOneAndUpdate({ productId }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Deletes a product by its productId
 * @access  Private (Admin)
 */

router.delete('/:id', verifyFirebaseToken, verifyAdmin, async (req, res) => {
  const productId = Number(req.params.id);

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID. It must be a number.' });
  }
  try {
    const deleted = await Product.findOneAndDelete({ productId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
