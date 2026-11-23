const request = require('supertest');
const express = require('express');

// Prevent side-effects from Redis client and Firebase during tests by mocking
jest.mock('../lib/cache', () => ({ get: jest.fn(), set: jest.fn(), delPattern: jest.fn(), clearAll: jest.fn(), client: null }));
jest.mock('../middleware/requireAuth', () => ({ requireAuth: (req, res, next) => next() }));
jest.mock('../middleware/requireAdmin', () => ({ requireAdmin: (req, res, next) => next() }));
jest.mock('../middleware/validateRequest', () => (schema) => (req, res, next) => next());

jest.mock('../models/Product', () => ({ find: jest.fn(), countDocuments: jest.fn() }));
const Product = require('../models/Product');
const productsRouter = require('../routes/products');

describe('GET /api/products pagination', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use('/api/products', productsRouter);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    try {
      const cache = require('../lib/cache');
      if (cache && cache.client && typeof cache.client.disconnect === 'function') {
        await cache.client.disconnect();
      }
    } catch (e) {
      // ignore
    }
  });

  test('returns paginated results and meta', async () => {
    const fakeProducts = Array.from({ length: 3 }).map((_, i) => ({ productId: i + 1, name: `p${i + 1}` }));
    Product.find.mockImplementationOnce(() => ({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            lean: () => Promise.resolve(fakeProducts),
          }),
        }),
      }),
    }));
    Product.countDocuments.mockResolvedValueOnce(10);

    const res = await request(app).get('/api/products?page=1&limit=3');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.meta).toMatchObject({ page: 1, limit: 3, total: 10 });
  });

  test('rejects operator-style nested product query keys', async () => {
    const res = await request(app).get('/api/products?category[$ne]=all');
    expect(res.status).toBe(400);
  });

  test('rejects nested product ID values', async () => {
    const res = await request(app).get('/api/products?id[$ne]=1');
    expect(res.status).toBe(400);
  });
});
