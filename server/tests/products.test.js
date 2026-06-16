const request = require('supertest');
const express = require('express');

// Prevent side-effects from Redis client and Firebase during tests by mocking
jest.mock('../lib/cache', () => ({ get: jest.fn(), set: jest.fn(), delPattern: jest.fn(), clearAll: jest.fn(), client: null }));
jest.mock('../middleware/verifyFirebaseToken', () => (req, res, next) => next());
jest.mock('../middleware/verifyAdmin', () => (req, res, next) => next());
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

  test('returns results filtered by search query matching name or brand (regex)', async () => {
    Product.find.mockImplementationOnce((filter) => {
      expect(filter).toHaveProperty('$or');
      expect(filter.$or).toEqual([
        { name: { $regex: 'whey', $options: 'i' } },
        { brand: { $regex: 'whey', $options: 'i' } }
      ]);
      return {
        sort: () => ({
          skip: () => ({
            limit: () => ({
              lean: () => Promise.resolve([{ productId: 2, name: 'Whey Protein Isolate', brand: 'NutriCore' }]),
            }),
          }),
        }),
      };
    });
    Product.countDocuments.mockResolvedValueOnce(1);

    const res = await request(app).get('/api/products?search=whey');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Whey Protein Isolate');
  });

  test('escapes special regex characters in search query', async () => {
    Product.find.mockImplementationOnce((filter) => {
      expect(filter).toHaveProperty('$or');
      expect(filter.$or).toEqual([
        { name: { $regex: 'whey\\*', $options: 'i' } },
        { brand: { $regex: 'whey\\*', $options: 'i' } }
      ]);
      return {
        sort: () => ({
          skip: () => ({
            limit: () => ({
              lean: () => Promise.resolve([]),
            }),
          }),
        }),
      };
    });
    Product.countDocuments.mockResolvedValueOnce(0);

    const res = await request(app).get('/api/products?search=whey*');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});
