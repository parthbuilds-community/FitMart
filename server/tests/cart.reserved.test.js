/**
 * Integration tests for adjustReserved (server/routes/cart.js)
 *
 * Uses mongodb-memory-server to spin up a real in-memory MongoDB instance,
 * so these tests exercise the actual Mongoose + MongoDB query layer including
 * $expr, $inc, $ifNull, and $or operators used in the atomic findOneAndUpdate.
 *
 * Run with: npm run test:cart
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// The function under test — exported from cart.js in Step 5
const { adjustReserved } = require('../routes/cart');

// Product model — used to seed and inspect documents in tests
const Product = require('../models/Product');

let mongoServer;

beforeAll(async () => {
  // Start the in-memory MongoDB server
  // This downloads the MongoDB binary on first run (~10–30 seconds)
  // Subsequent runs use a cached binary and start in < 1 second
  process.env.MONGOMS_SYSTEM_BINARY = 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect Mongoose to the in-memory server
  // useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 7+
  // but are harmless if included for compatibility
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Disconnect and stop the in-memory server after all tests complete
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('adjustReserved', () => {

  afterEach(async () => {
    // Clean up the Product collection between tests
    // This ensures each test starts with a known clean state
    // and tests do not interfere with each other
    await Product.deleteMany({});
  });

  /**
   * Creates a Product document in the test database.
   *
   * @param {object} overrides - Fields to override from defaults
   * @returns {Promise<Product>} The created Product document
   */
  async function createProduct(overrides = {}) {
    const defaults = {
      productId: 1,          // numeric, matches the schema type
      name: 'Test Product',
      brand: 'TestBrand',
      category: 'Equipment',
      price: 999,
      stock: 5,              // default: finite stock of 5
      reserved: 0,           // default: nothing reserved
    };
  
    return Product.create({ ...defaults, ...overrides });
  }

  // ─────────────────────────────────────────────
  // TEST 1 — Basic single increment
  // ─────────────────────────────────────────────
  test('increments reserved by delta on a product with available stock', async () => {
    // Arrange: product with stock=5, reserved=0
    const product = await createProduct({ productId: 1, stock: 5, reserved: 0 });

    // Act: add 1 to reserved
    const result = await adjustReserved(1, +1);

    // Assert: returned document has reserved=1
    expect(result).toBeDefined();
    expect(result.reserved).toBe(1);

    // Also verify the database state directly (not just the returned doc)
    const fresh = await Product.findOne({ productId: 1 });
    expect(fresh.reserved).toBe(1);
  });

  // ─────────────────────────────────────────────
  // TEST 2 — Upper bound: reserved already equals stock
  // ─────────────────────────────────────────────
  test('throws when reserved already equals stock and delta > 0', async () => {
    // Arrange: product fully reserved (reserved == stock)
    await createProduct({ productId: 2, stock: 3, reserved: 3 });

    // Act + Assert: adding 1 more should throw
    await expect(adjustReserved(2, +1)).rejects.toThrow('insufficient stock');

    // Verify database was NOT modified (reserved stays at 3)
    const fresh = await Product.findOne({ productId: 2 });
    expect(fresh.reserved).toBe(3);
  });

  // ─────────────────────────────────────────────
  // TEST 3 — Lower bound: reserved is already 0
  // ─────────────────────────────────────────────
  test('throws when reserved is 0 and delta < 0', async () => {
    // Arrange: product with nothing reserved
    await createProduct({ productId: 3, stock: 5, reserved: 0 });

    // Act + Assert: removing 1 should throw
    await expect(adjustReserved(3, -1)).rejects.toThrow('reserved already at 0');

    // Verify database was NOT modified
    const fresh = await Product.findOne({ productId: 3 });
    expect(fresh.reserved).toBe(0);
  });

  // ─────────────────────────────────────────────
  // TEST 4 — Concurrency: exactly 5 of 10 concurrent adds succeed on stock=5
  // ─────────────────────────────────────────────
  test('allows exactly stock-many concurrent increments and rejects the rest', async () => {
    // Arrange: product with stock=5, reserved=0
    const STOCK = 5;
    const CONCURRENT_CALLS = 10;
    await createProduct({ productId: 4, stock: STOCK, reserved: 0 });

    // Act: fire 10 concurrent +1 calls simultaneously
    // Promise.allSettled waits for ALL to complete (fulfilled or rejected)
    const results = await Promise.allSettled(
      Array.from({ length: CONCURRENT_CALLS }, () => adjustReserved(4, +1))
    );

    // Assert: count fulfilled (succeeded) and rejected (failed)
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected  = results.filter(r => r.status === 'rejected');

    expect(fulfilled.length).toBe(STOCK);           // exactly 5 should succeed
    expect(rejected.length).toBe(CONCURRENT_CALLS - STOCK); // exactly 5 should fail

    // Assert: all rejections are for the right reason (insufficient stock, not bugs)
    for (const r of rejected) {
      expect(r.reason.message).toContain('insufficient stock');
    }

    // Assert: final database state — reserved must equal exactly stock (5)
    // This is the definitive proof that no double-counting occurred
    const fresh = await Product.findOne({ productId: 4 });
    expect(fresh.reserved).toBe(STOCK);
  });

  // ─────────────────────────────────────────────
  // TEST 5 — Unlimited stock: stock=null never blocks adds
  // ─────────────────────────────────────────────
  test('always allows increments when stock is null (unlimited)', async () => {
    // Arrange: product with null stock (unlimited inventory)
    await createProduct({ productId: 5, stock: null, reserved: 0 });

    // Act: add 100 units — far more than any finite stock would allow
    for (let i = 0; i < 100; i++) {
      // Each call should succeed without throwing
      await expect(adjustReserved(5, +1)).resolves.toBeDefined();
    }

    // Assert: reserved is now 100 — all increments were applied
    const fresh = await Product.findOne({ productId: 5 });
    expect(fresh.reserved).toBe(100);
  });

  // ─────────────────────────────────────────────
  // TEST 6 — Multi-unit decrement: reserved decreases by exactly N
  // ─────────────────────────────────────────────
  test('decrements reserved by exactly N on a multi-unit delta', async () => {
    // Arrange: product with stock=10, reserved=7 (7 units currently in carts)
    await createProduct({ productId: 6, stock: 10, reserved: 7 });

    // Act: release 4 units (e.g. user removes 4 items from their cart)
    const result = await adjustReserved(6, -4);

    // Assert: reserved is now 3
    expect(result.reserved).toBe(3);

    // Verify DB directly
    const fresh = await Product.findOne({ productId: 6 });
    expect(fresh.reserved).toBe(3);
  });

}); // end describe('adjustReserved')

describe('adjustReserved — edge cases', () => {

  afterEach(async () => {
    await Product.deleteMany({});
  });

  /**
   * Creates a Product document in the test database.
   *
   * @param {object} overrides - Fields to override from defaults
   * @returns {Promise<Product>} The created Product document
   */
  async function createProduct(overrides = {}) {
    const defaults = {
      productId: 1,          // numeric, matches the schema type
      name: 'Test Product',
      brand: 'TestBrand',
      category: 'Equipment',
      price: 999,
      stock: 5,              // default: finite stock of 5
      reserved: 0,           // default: nothing reserved
    };
  
    return Product.create({ ...defaults, ...overrides });
  }

  // EDGE CASE A — Product not found
  test('throws when productId does not exist in the database', async () => {
    // No product created — collection is empty

    await expect(adjustReserved(999, +1)).rejects.toThrow(
      'adjustReserved failed for productId 999'
    );
  });

  // EDGE CASE B — Decrement exactly to zero (boundary condition)
  test('allows decrement that brings reserved to exactly 0', async () => {
    await createProduct({ productId: 7, stock: 5, reserved: 3 });

    const result = await adjustReserved(7, -3);

    expect(result.reserved).toBe(0);

    const fresh = await Product.findOne({ productId: 7 });
    expect(fresh.reserved).toBe(0);
  });

  // EDGE CASE C — Increment to exactly stock (boundary condition)
  test('allows increment that brings reserved to exactly stock', async () => {
    await createProduct({ productId: 8, stock: 5, reserved: 4 });

    // Adding 1 more brings reserved to exactly 5 (= stock) — should succeed
    const result = await adjustReserved(8, +1);

    expect(result.reserved).toBe(5);

    const fresh = await Product.findOne({ productId: 8 });
    expect(fresh.reserved).toBe(5);
  });

  // EDGE CASE D — Document missing reserved field ($ifNull fallback)
  // This simulates a product inserted BEFORE Task 2 added default: 0
  test('handles documents with no reserved field via $ifNull fallback', async () => {
    // Insert a raw document bypassing Mongoose validators
    // to simulate a pre-Task-2 document with no reserved field
    await mongoose.connection.collection('products').insertOne({
      productId: 9,
      name: 'Legacy Product',
      brand: 'OldBrand',
      category: 'Equipment',
      price: 500,
      stock: 10,
      // NO reserved field — simulates pre-migration document
    });

    // adjustReserved should treat missing reserved as 0 via $ifNull
    const result = await adjustReserved(9, +1);

    // reserved should now be 1 (0 + 1)
    expect(result.reserved).toBe(1);
  });

  // EDGE CASE E — Large delta decrement that would go below zero
  test('throws when delta is larger in magnitude than current reserved', async () => {
    // reserved=2, trying to release 5 — should throw
    await createProduct({ productId: 10, stock: 10, reserved: 2 });

    await expect(adjustReserved(10, -5)).rejects.toThrow('reserved already at 0');

    // reserved must be unchanged
    const fresh = await Product.findOne({ productId: 10 });
    expect(fresh.reserved).toBe(2);
  });

  // EDGE CASE F — Concurrent decrements: only reserved-many succeed
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

    // reserved must be exactly 0 after all valid decrements applied
    const fresh = await Product.findOne({ productId: 11 });
    expect(fresh.reserved).toBe(0);
  });

});
