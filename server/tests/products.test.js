const request = require('supertest');
const express = require('express');
const router = require('../routes/products');

// Mock the Product model
jest.mock('../models/Product', () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  find: jest.fn(),
}));

// Mock middleware
jest.mock('../middleware/verifyFirebaseToken', () => (req, res, next) => next());
jest.mock('../middleware/verifyAdmin', () => (req, res, next) => next());
jest.mock('../middleware/validateRequest', () => () => (req, res, next) => next());

const Product = require('../models/Product');

const app = express();
app.use(express.json());
app.use('/api/products', router);

describe('Product ID Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products/:id', () => {
    it('should return 400 for non-numeric ID', async () => {
      const res = await request(app).get('/api/products/abc');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid product ID');
    });

    it('should return 400 for float ID', async () => {
      const res = await request(app).get('/api/products/1.5');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid product ID');
    });

    it('should return 400 for negative ID', async () => {
      const res = await request(app).get('/api/products/-1');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid product ID');
    });

    it('should return 400 for empty string ID', async () => {
      const res = await request(app).get('/api/products/');
      expect(res.status).toBe(400);
    });

    it('should return 404 for valid ID with no matching product', async () => {
      Product.findOne.mockResolvedValue(null);
      const res = await request(app).get('/api/products/42');
      expect(res.status).toBe(404);
    });

    it('should return product for valid numeric ID', async () => {
      const mockProduct = { productId: 42, name: 'Test Product' };
      Product.findOne.mockResolvedValue(mockProduct);
      const res = await request(app).get('/api/products/42');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProduct);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should return 400 for non-numeric ID', async () => {
      const res = await request(app).put('/api/products/abc').send({ name: 'Updated' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid product ID');
    });

    it('should return 400 for NaN-producing input like "abc123"', async () => {
      const res = await request(app).put('/api/products/abc123').send({ name: 'Updated' });
      expect(res.status).toBe(400);
    });

    it('should return 404 for valid ID with no matching product', async () => {
      Product.findOneAndUpdate.mockResolvedValue(null);
      const res = await request(app).put('/api/products/42').send({ name: 'Updated' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should return 400 for non-numeric ID', async () => {
      const res = await request(app).delete('/api/products/xyz');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid product ID');
    });

    it('should return 400 for path traversal attempt', async () => {
      const res = await request(app).delete('/api/products/..%2F..%2Fetc');
      expect(res.status).toBe(400);
    });

    it('should return 404 for valid ID with no matching product', async () => {
      Product.findOneAndDelete.mockResolvedValue(null);
      const res = await request(app).delete('/api/products/99');
      expect(res.status).toBe(404);
    });

    it('should return success for valid ID with existing product', async () => {
      const mockProduct = { productId: 99, name: 'ToDelete' };
      Product.findOneAndDelete.mockResolvedValue(mockProduct);
      const res = await request(app).delete('/api/products/99');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
