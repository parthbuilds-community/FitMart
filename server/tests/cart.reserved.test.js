/**
 * Integration tests for adjustReserved (server/routes/cart.js)
 *
 * Uses mongodb-memory-server to spin up a real in-memory MongoDB instance,
 * so these tests exercise the actual Mongoose + MongoDB query layer including
 * $expr, $inc, $ifNull, and $or operators used in the atomic findOneAndUpdate.
 *
 * Note: This suite is currently skipped in CI because it depends on
 * mongodb-memory-server which requires downloading a MongoDB binary.
 * See: https://github.com/parthbuilds-community/FitMart/issues/631
 */

let mongoose, MongoMemoryServer, adjustReserved;

try {
  mongoose = require('mongoose');
  MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
  adjustReserved = require('../routes/cart').adjustReserved;
} catch (e) {
  // mongodb-memory-server not available — skip the entire suite
  describe('adjustReserved', () => {
    test.skip('requires mongodb-memory-server — install it with: npm install mongodb-memory-server', () => {});
  });
  describe('adjustReserved — edge cases', () => {
    test.skip('requires mongodb-memory-server — install it with: npm install mongodb-memory-server', () => {});
  });
}

// Only reached when mongodb-memory-server is available
const Product = require('../models/Product');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('adjustReserved', () => {

  afterEach(async () => {
    await Product.deleteMany({});
  });

  async function createProduct(overrides = {}) {
    const defaults = {
      productId: 1,
      name: 'Test Product',
      brand: 'TestBrand',
      category: 'Equipment',
      price: 999,
      stock: 5,
      reserved: 0,
    };
    return Product.create({ ...defaults, ...overrides });
  }

  test('increments reserved by delta on a product with available stock', async () => {
    const product = await createProduct({ productId: 1, stock: 5, reserved: 0 });
    const result = await adjustReserved(1, +1);
    expect(result).toBeDefined();
    expect(result.reserved).toBe(1);
    const fresh = await Product.findOne({ productId: 1 });
    expect(fresh.reserved).toBe(1);
  });

  test('throws when reserved already equals stock and delta > 0', async () => {
    await createProduct({ productId: 2, stock: 3, reserved: 3 });
    await expect(adjustReserved(2, +1)).rejects.toThrow('insufficient stock');
    const fresh = await Product.findOne({ productId: 2 });
    expect(fresh.reserved).toBe(3);
  });

  test('throws when reserved is 0 and delta < 0', async () => {
    await createProduct({ productId: 3, stock: 5, reserved: 0 });
    await expect(adjustReserved(3, -1)).rejects.toThrow('reserved count cannot drop below zero');
    const fresh = await Product.findOne({ productId: 3 });
    expect(fresh.reserved).toBe(0);
  });

  test('allows exactly stock-many concurrent increments and rejects the rest', async () => {
    const STOCK = 5;
    const CONCURRENT_CALLS = 10;
    await createProduct({ productId: 4, stock: STOCK, reserved: 0 });

    const results = await Promise.allSettled(
      Array.from({ length: CONCURRENT_CALLS }, () => adjustReserved(4, +1))
    );

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected  = results.filter(r => r.status === 'rejected');

    expect(fulfilled.length).toBe(STOCK);
    expect(rejected.length).toBe(CONCURRENT_CALLS - STOCK);

    for (const r of rejected) {
      expect(r.reason.message).toContain('insufficient stock');
    }

    const fresh = await Product.findOne({ productId: 4 });
    expect(fresh.reserved).toBe(STOCK);
  });

  test('always allows increments when stock is null (unlimited)', async () => {
    await createProduct({ productId: 5, stock: null, reserved: 0 });

    for (let i = 0; i < 100; i++) {
      await expect(adjustReserved(5, +1)).resolves.toBeDefined();
    }

    const fresh = await Product.findOne({ productId: 5 });
    expect(fresh.reserved).toBe(100);
  });

  test('decrements reserved by exactly N on a multi-unit delta', async () => {
    await createProduct({ productId: 6, stock: 10, reserved: 7 });

    const result = await adjustReserved(6, -4);
    expect(result.reserved).toBe(3);

    const fresh = await Product.findOne({ productId: 6 });
    expect(fresh.reserved).toBe(3);
  });
});

describe('adjustReserved — edge cases', () => {

  afterEach(async () => {
    await Product.deleteMany({});
  });

  async function createProduct(overrides = {}) {
    const defaults = {
      productId: 1,
      name: 'Test Product',
      brand: 'TestBrand',
      category: 'Equipment',
      price: 999,
      stock: 5,
      reserved: 0,
    };
    return Product.create({ ...defaults, ...overrides });
  }

  test('throws when productId does not exist in the database', async () => {
    await expect(adjustReserved(999, +1)).rejects.toThrow(
      'product not found'
    );
  });

  test('allows decrement that brings reserved to exactly 0', async () => {
    await createProduct({ productId: 7, stock: 5, reserved: 3 });

    const result = await adjustReserved(7, -3);
    expect(result.reserved).toBe(0);

    const fresh = await Product.findOne({ productId: 7 });
    expect(fresh.reserved).toBe(0);
  });

  test('allows increment that brings reserved to exactly stock', async () => {
    await createProduct({ productId: 8, stock: 5, reserved: 4 });

    const result = await adjustReserved(8, +1);
    expect(result.reserved).toBe(5);

    const fresh = await Product.findOne({ productId: 8 });
    expect(fresh.reserved).toBe(5);
  });

  test('handles documents with no reserved field via $ifNull fallback', async () => {
    await mongoose.connection.collection('products').insertOne({
      productId: 9,
      name: 'Legacy Product',
      brand: 'OldBrand',
      category: 'Equipment',
      price: 500,
      stock: 10,
    });

    const result = await adjustReserved(9, +1);
    expect(result.reserved).toBe(1);
  });

  test('throws when delta is larger in magnitude than current reserved', async () => {
    await createProduct({ productId: 10, stock: 10, reserved: 2 });

    await expect(adjustReserved(10, -5)).rejects.toThrow('reserved count cannot drop below zero');

    const fresh = await Product.findOne({ productId: 10 });
    expect(fresh.reserved).toBe(2);
  });

  test('allows exactly reserved-many concurrent decrements and rejects the rest', async () => {
    const RESERVED = 4;
    const CONCURRENT_CALLS = 8;
    await createProduct({ productId: 11, stock: 10, reserved: RESERVED });

    const results = await Promise.allSettled(
      Array.from({ length: CONCURRENT_CALLS }, () => adjustReserved(11, -1))
    );

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected  = results.filter(r => r.status === 'rejected');

    expect(fulfilled.length).toBe(RESERVED);
    expect(rejected.length).toBe(CONCURRENT_CALLS - RESERVED);

    const fresh = await Product.findOne({ productId: 11 });
    expect(fresh.reserved).toBe(0);
  });
});
