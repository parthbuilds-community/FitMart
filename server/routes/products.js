const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const crypto = require('crypto');
const cache = require('../lib/cache');

// Your New Constant Import
const { LOW_STOCK_THRESHOLD } = require('../config/constants');

// Parth's New Security & Validation Imports
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
    // Query parameters
    const all = req.query.all === 'true';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const category = req.query.category;
    const search = req.query.search;
    const sort = req.query.sort || 'productId_asc';
    const fields = req.query.fields; // comma separated

    // Build mongoose filter
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (search) filter.$text = { $search: search };

    // Projection
    let projection = null;
    if (fields) {
      projection = {};
      fields.split(',').forEach(f => { projection[f.trim()] = 1; });
    }

    // Sort mapping
    const [sortField, sortDir] = sort.split('_');
    const sortMap = { asc: 1, desc: -1 };
    const sortObj = {};
    sortObj[sortField || 'productId'] = sortMap[sortDir] || 1;

    // Backward compatible: return all when ?all=true
    if (all) {
      const products = await Product.find(filter, projection).sort(sortObj).lean();
      return res.json(products);
    }

    // Cache key based on query
    const cacheKeyObj = { page, limit, category, search, sort, fields };
    const cacheKey = `products:${crypto.createHash('md5').update(JSON.stringify(cacheKeyObj)).digest('hex')}`;

    // Try cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      const totalCount = (cached.payload && cached.payload.meta && cached.payload.meta.total) ? cached.payload.meta.total : 0;
      res.set('X-Total-Count', String(totalCount));
      res.set('ETag', cached.etag);
      // Conditional request handling
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && ifNoneMatch === cached.etag) return res.status(304).end();
      return res.json(cached.payload);
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter, projection).sort(sortObj).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    const payload = {
      data: products,
      meta: { page, limit, total, totalPages },
      links: {
        next: page < totalPages ? `/api/products?page=${page + 1}&limit=${limit}` : null,
        prev: page > 1 ? `/api/products?page=${page - 1}&limit=${limit}` : null,
      },
    };

    const etag = crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');
    // store in cache
    await cache.set(cacheKey, { payload, etag }, Number(process.env.PRODUCTS_CACHE_TTL || 60));

    res.set('X-Cache', 'MISS');
    res.set('X-Total-Count', String(total));
    res.set('ETag', etag);
    // Link header (RFC5988) for pagination
    const linkParts = [];
    const baseUrl = `/api/products?limit=${limit}`;
    if (page < totalPages) linkParts.push(`<${baseUrl}&page=${page + 1}>; rel="next"`);
    if (page > 1) linkParts.push(`<${baseUrl}&page=${page - 1}>; rel="prev"`);
    if (linkParts.length) res.set('Link', linkParts.join(', '));

    // Conditional request: If client sent If-None-Match
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch === etag) return res.status(304).end();

    return res.json(payload);
  });

/**
 * @route   GET /api/products/low-stock
 * @desc    Returns all products where available stock (stock - reserved) is below threshold of 5
 * @access  Public
 */

router.get('/low-stock', async (req, res) => {
    // only check products where stock is not null
    const products = await Product.find({ stock: { $ne: null } });
    const lowStock = products.filter(p => (p.stock - p.reserved) < LOW_STOCK_THRESHOLD);
    res.json(lowStock);
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

    const product = await Product.findOne({ productId });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  });

/**
 * @route   POST /api/products
 * @desc    Creates a new product; body: full product object including unique productId
 * @access  Private (Admin)
 */
router.post('/', verifyFirebaseToken, verifyAdmin, validateRequest(createProductSchema), async (req, res) => {
    const body = req.body;
    const existing = await Product.findOne({ productId: body.productId });
    if (existing) return res.status(400).json({ error: 'productId already exists' });
    const p = new Product(body);
    await p.save();
    // invalidate product caches
    try { await cache.delPattern('products:'); } catch (e) { }
    res.status(201).json(p);
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

    const updated = await Product.findOneAndUpdate({ productId }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    try { await cache.delPattern('products:'); } catch (e) { }
    res.json(updated);
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
    const deleted = await Product.findOneAndDelete({ productId });
    try { await cache.delPattern('products:'); } catch (e) { }
    res.json({ success: true });
  });

module.exports = router;
