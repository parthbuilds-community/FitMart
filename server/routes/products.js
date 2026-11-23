const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const crypto = require('crypto');
const cache = require('../lib/cache');

// Your New Constant Import
const { LOW_STOCK_THRESHOLD } = require('../config/constants');

// Parth's New Security & Validation Imports
const { requireAuth } = require('../middleware/requireAuth');
const { requireAdmin } = require('../middleware/requireAdmin');
const validateRequest = require('../middleware/validateRequest');
const { createProductSchema, updateProductSchema } = require('../validation/requestSchemas');

const PRODUCT_SORT_FIELDS = new Set(['productId', 'name', 'brand', 'category', 'price', 'rating', 'createdAt']);
const PRODUCT_FIELDS = new Set([
  'productId', 'name', 'brand', 'category', 'price', 'priceMinor', 'originalPrice',
  'rating', 'reviews', 'badge', 'image', 'stock', 'reserved', 'isActive', 'archivedAt',
  'createdAt', 'updatedAt',
]);
const PRODUCT_UPDATE_FIELDS = new Set([
  'productId', 'name', 'brand', 'category', 'price', 'originalPrice', 'rating',
  'reviews', 'badge', 'image', 'stock', 'reserved', 'isActive', 'archivedAt',
]);

function scalarQuery(value) {
  return typeof value === 'string' ? value : null;
}

function positiveInteger(value, fallback, maximum) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return maximum ? Math.min(parsed, maximum) : parsed;
}

/**
 * @route   GET /api/products
 * @desc    Returns all products sorted by productId in ascending order
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const allowedQueryKeys = new Set([
      'all', 'page', 'limit', 'category', 'search', 'sort', 'fields', 'id', 'ids', 'exclude',
    ]);
    if (Object.keys(req.query).some((key) =>
      key.includes('$') || key.includes('.') || key.includes('[') || !allowedQueryKeys.has(key)
    )) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    // Query parameters
    const all = req.query.all === 'true';
    for (const key of ['all', 'page', 'limit', 'category', 'search', 'sort', 'fields', 'id', 'ids', 'exclude']) {
      if (req.query[key] !== undefined && typeof req.query[key] !== 'string') {
        return res.status(400).json({ error: 'Invalid query parameters' });
      }
    }
    const page = positiveInteger(req.query.page, 1);
    const limit = positiveInteger(req.query.limit, 24, 100);
    const category = scalarQuery(req.query.category);
    const search = scalarQuery(req.query.search);
    const sort = scalarQuery(req.query.sort) || 'productId_asc';
    const fields = scalarQuery(req.query.fields);
    const id = scalarQuery(req.query.id);
    const ids = scalarQuery(req.query.ids);
    const exclude = scalarQuery(req.query.exclude);

    // Build mongoose filter
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (search) filter.$text = { $search: search };
    if (req.query.exclude !== undefined) {
      if (exclude === null) {
        return res.status(400).json({ error: 'Invalid excluded product ID. It must be a number.' });
      }
      const excludeId = Number(exclude);
      if (Number.isInteger(excludeId)) filter.productId = { $ne: excludeId };
      else return res.status(400).json({ error: 'Invalid excluded product ID. It must be a number.' });
    }

    // Projection
    let projection = null;
    if (fields) {
      projection = {};
      fields.split(',').forEach(f => {
        const field = f.trim();
        if (PRODUCT_FIELDS.has(field)) projection[field] = 1;
      });
      if (Object.keys(projection).length === 0) projection = null;
    }

    // Sort mapping
    const separator = sort.lastIndexOf('_');
    const sortField = separator > -1 ? sort.slice(0, separator) : 'productId';
    const sortDir = separator > -1 ? sort.slice(separator + 1) : 'asc';
    const sortMap = { asc: 1, desc: -1 };
    const sortObj = {};
    sortObj[PRODUCT_SORT_FIELDS.has(sortField) ? sortField : 'productId'] =
      sortMap[sortDir] || 1;

    // Single product by productId: GET /api/products?id=2
    if (req.query.id !== undefined) {
      if (id === null) {
        return res.status(400).json({ error: 'Invalid product ID. It must be a number.' });
      }
      const productId = Number(id);
      if (!Number.isInteger(productId)) {
        return res.status(400).json({ error: 'Invalid product ID. It must be a number.' });
      }
      const product = await Product.findOne({ productId }, projection).lean();
      if (!product) return res.status(404).json({ error: 'Product not found' });
      return res.json(product);
    }

    // Multiple products by productId: GET /api/products?ids=1,2,3
    if (req.query.ids !== undefined) {
      if (ids === null) {
        return res.status(400).json({ error: 'Invalid product IDs. They must be numbers.' });
      }
      const productIds = ids.split(',').map(Number);
      if (productIds.some(n => !Number.isInteger(n))) {
        return res.status(400).json({ error: 'Invalid product IDs. They must be numbers.' });
      }
      const products = await Product.find({ ...filter, productId: { $in: productIds } }, projection)
        .sort(sortObj)
        .lean();
      return res.json(products);
    }

    // Backward compatible: return all when ?all=true
    if (all) {
      const products = await Product.find(filter, projection).sort(sortObj).lean();
      return res.json(products);
    }

    // Cache key based on query
    const cacheKeyObj = { page, limit, category, search, sort, fields };
    const cacheKey = `products:${crypto.createHash('sha256').update(JSON.stringify(cacheKeyObj)).digest('hex')}`;

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

    const etag = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
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
  } catch (err) {
    console.error('[products] GET /api/products error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/products/low-stock
 * @desc    Returns all products where available stock (stock - reserved) is below threshold of 5
 * @access  Public
 */

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

  if (!Number.isInteger(productId) || productId <= 0) {
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
router.post('/', requireAuth, requireAdmin, validateRequest(createProductSchema), async (req, res) => {
  try {
    const body = req.body;
    const existing = await Product.findOne({ productId: body.productId });
    if (existing) return res.status(400).json({ error: 'productId already exists' });
    const p = new Product(body);
    await p.save();
    // invalidate product caches
    try { await cache.delPattern('products:'); } catch (e) { }
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
router.put('/:id', requireAuth, requireAdmin, validateRequest(updateProductSchema), async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: 'Invalid product ID. It must be a number.' });
  }

  try {
    const update = {};
    for (const field of PRODUCT_UPDATE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        update[field] = req.body[field];
      }
    }
    // findOneAndUpdate bypasses the model hook, so sync integer paise here.
    if (Object.prototype.hasOwnProperty.call(update, 'price')) {
      update.priceMinor = Math.round(Number(update.price) * 100);
    }
    const updated = await Product.findOneAndUpdate({ productId }, update, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    try { await cache.delPattern('products:'); } catch (e) { }
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

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: 'Invalid product ID. It must be a number.' });
  }
  try {
    const deleted = await Product.findOneAndDelete({ productId });
    try { await cache.delPattern('products:'); } catch (e) { }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
