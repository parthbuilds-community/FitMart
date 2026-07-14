// server/tests/orderService.test.js
//
// Unit tests for the orderService business logic layer.
// All Mongoose models are mocked so tests run purely in memory.

jest.mock("../models/Order", () => ({ create: jest.fn() }));
jest.mock("../models/Cart", () => ({ findOne: jest.fn(), findOneAndUpdate: jest.fn() }));
jest.mock("../models/Product", () => ({ findOne: jest.fn(), findOneAndUpdate: jest.fn() }));

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { createOrder } = require("../services/orderService");

const USER_ID = "firebase-uid-123";

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeProduct(overrides = {}) {
  return {
    productId: 101,
    name: "Test Product",
    price: 49.99,
    stock: 10,
    reserved: 0,
    ...overrides,
  };
}

function makeCartItem(overrides = {}) {
  return { productId: 101, quantity: 2, ...overrides };
}

function makeOrderDoc(overrides = {}) {
  return {
    _id: "order-abc-123",
    userId: USER_ID,
    items: [{ productId: 101, quantity: 2, price: 49.99 }],
    total: 99.98,
    status: "created",
    ...overrides,
  };
}

// ── Setup / teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ── createOrder – with explicit items ───────────────────────────────────────

describe("createOrder with explicit items", () => {
  test("creates an order from explicit items and deducts stock", async () => {
    const product = makeProduct();
    const orderDoc = makeOrderDoc();

    Product.findOne.mockResolvedValue(product);
    Order.create.mockResolvedValue(orderDoc);
    Cart.findOneAndUpdate.mockResolvedValue({});

    const items = [{ productId: 101, quantity: 2 }];
    const result = await createOrder(USER_ID, items);

    expect(result).toBe(orderDoc);
    expect(Product.findOne).toHaveBeenCalledWith({ productId: 101 });
    expect(Order.create).toHaveBeenCalledWith({
      userId: USER_ID,
      items: [{ productId: 101, quantity: 2, price: 49.99 }],
      total: 99.98,
    });
    // Stock deduction: stock was 10, reserved was 0, we bought 2
    expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      { productId: 101 },
      {
        $inc: { stock: -2 },
        $set: { reserved: 0 },
      }
    );
    expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: USER_ID },
      { items: [] }
    );
  });

  test("creates an order with multiple items", async () => {
    const productA = makeProduct({ productId: 1, name: "A", price: 10, stock: 5 });
    const productB = makeProduct({ productId: 2, name: "B", price: 20, stock: 5 });
    const orderDoc = makeOrderDoc({
      items: [
        { productId: 1, quantity: 1, price: 10 },
        { productId: 2, quantity: 2, price: 20 },
      ],
      total: 50,
    });

    // Returns different products on each call.
    // 4 calls total: 2 price lookups + 2 stock-deduction lookups
    Product.findOne
      .mockResolvedValueOnce(productA)
      .mockResolvedValueOnce(productB)
      .mockResolvedValueOnce(productA)
      .mockResolvedValueOnce(productB);
    Order.create.mockResolvedValue(orderDoc);
    Cart.findOneAndUpdate.mockResolvedValue({});

    const items = [
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 2 },
    ];

    const result = await createOrder(USER_ID, items);

    expect(result).toBe(orderDoc);
    expect(Product.findOne).toHaveBeenCalledTimes(4); // 2 price lookups + 2 stock-deduction lookups
    expect(Order.create).toHaveBeenCalledWith({
      userId: USER_ID,
      items: [
        { productId: 1, quantity: 1, price: 10 },
        { productId: 2, quantity: 2, price: 20 },
      ],
      total: 50,
    });
  });

  test("throws when a product is not found", async () => {
    Product.findOne.mockResolvedValue(null);

    const items = [{ productId: 999, quantity: 1 }];

    await expect(createOrder(USER_ID, items)).rejects.toThrow(
      "Product 999 not found"
    );
    expect(Order.create).not.toHaveBeenCalled();
  });

  test("throws when stock is insufficient", async () => {
    const product = makeProduct({ stock: 2, reserved: 1 }); // available = 1
    Product.findOne.mockResolvedValue(product);

    const items = [{ productId: 101, quantity: 2 }];

    await expect(createOrder(USER_ID, items)).rejects.toThrow(
      "Insufficient stock for Test Product. Available: 1"
    );
    expect(Order.create).not.toHaveBeenCalled();
  });

  test("does not check stock when stock is null (unlimited)", async () => {
    const product = makeProduct({ stock: null, reserved: 0 });
    const orderDoc = makeOrderDoc();
    Product.findOne.mockResolvedValue(product);
    Order.create.mockResolvedValue(orderDoc);
    Cart.findOneAndUpdate.mockResolvedValue({});

    const items = [{ productId: 101, quantity: 1000 }];

    const result = await createOrder(USER_ID, items);
    expect(result).toBe(orderDoc);
    expect(Order.create).toHaveBeenCalled();
  });

  test("does not deduct stock when stock is null (unlimited)", async () => {
    const product = makeProduct({ stock: null, reserved: 0 });
    const orderDoc = makeOrderDoc();
    Product.findOne.mockResolvedValue(product);
    Order.create.mockResolvedValue(orderDoc);
    Cart.findOneAndUpdate.mockResolvedValue({});

    const items = [{ productId: 101, quantity: 2 }];
    await createOrder(USER_ID, items);

    // Should not call findOneAndUpdate for stock deduction on unlimited items
    // Note: Cart.findOneAndUpdate is called to clear cart, check that ONLY
    // the cart update was called (not product deduction)
    expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test("reserved never goes negative in stock deduction", async () => {
    // Product has reserved=1 but we decrease it by 2 → should clamp to 0
    const product = makeProduct({ stock: 10, reserved: 1 });
    const orderDoc = makeOrderDoc();
    Product.findOne.mockResolvedValue(product);
    Order.create.mockResolvedValue(orderDoc);
    Cart.findOneAndUpdate.mockResolvedValue({});

    const items = [{ productId: 101, quantity: 2 }];
    await createOrder(USER_ID, items);

    // reserved should be max(0, 1 - 2) = 0
    expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      { productId: 101 },
      {
        $inc: { stock: -2 },
        $set: { reserved: 0 },
      }
    );
  });
});

// ── createOrder – from cart ─────────────────────────────────────────────────

describe("createOrder from cart", () => {
  test("creates an order from the user's cart when items are omitted", async () => {
    const product = makeProduct();
    const orderDoc = makeOrderDoc();
    const cart = { userId: USER_ID, items: [makeCartItem()] };

    Cart.findOne.mockResolvedValue(cart);
    Product.findOne.mockResolvedValue(product);
    Order.create.mockResolvedValue(orderDoc);
    Cart.findOneAndUpdate.mockResolvedValue({});

    const result = await createOrder(USER_ID);

    expect(result).toBe(orderDoc);
    expect(Cart.findOne).toHaveBeenCalledWith({ userId: USER_ID });
    expect(Order.create).toHaveBeenCalled();
  });

  test("throws when the cart does not exist", async () => {
    Cart.findOne.mockResolvedValue(null);

    await expect(createOrder(USER_ID)).rejects.toThrow("Cart is empty");
    expect(Order.create).not.toHaveBeenCalled();
  });

  test("throws when the cart is empty", async () => {
    Cart.findOne.mockResolvedValue({ userId: USER_ID, items: [] });

    await expect(createOrder(USER_ID)).rejects.toThrow("Cart is empty");
    expect(Order.create).not.toHaveBeenCalled();
  });

  test("throws when items array is explicitly passed but empty", async () => {
    // Empty array → !orderItems.length is truthy → falls back to cart lookup
    Cart.findOne.mockResolvedValue(null);

    await expect(createOrder(USER_ID, [])).rejects.toThrow("Cart is empty");
  });

  test("uses cart items when items = null", async () => {
    const product = makeProduct();
    const orderDoc = makeOrderDoc();
    const cart = { userId: USER_ID, items: [makeCartItem()] };

    Cart.findOne.mockResolvedValue(cart);
    Product.findOne.mockResolvedValue(product);
    Order.create.mockResolvedValue(orderDoc);
    Cart.findOneAndUpdate.mockResolvedValue({});

    const result = await createOrder(USER_ID, null);

    expect(result).toBe(orderDoc);
    expect(Cart.findOne).toHaveBeenCalled();
  });
});

// ── Stock deduction details ─────────────────────────────────────────────────

describe("stock deduction on checkout", () => {
  test("deducts stock for each unique product in the order", async () => {
    const product = makeProduct({ stock: 5, reserved: 2 });
    const orderDoc = makeOrderDoc();
    const cart = { userId: USER_ID, items: [makeCartItem()] };

    Cart.findOne.mockResolvedValue(cart);
    Product.findOne.mockResolvedValue(product);
    Order.create.mockResolvedValue(orderDoc);
    Cart.findOneAndUpdate.mockResolvedValue({});

    await createOrder(USER_ID);

    // Product.findOneAndUpdate should be called with:
    // $inc: { stock: -2 } and $set: { reserved: max(0, 2 - 2) = 0 }
    expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      { productId: 101 },
      {
        $inc: { stock: -2 },
        $set: { reserved: 0 },
      }
    );
  });

  test("clears the cart after successful order", async () => {
    const product = makeProduct();
    const orderDoc = makeOrderDoc();
    const cart = { userId: USER_ID, items: [makeCartItem()] };

    Cart.findOne.mockResolvedValue(cart);
    Product.findOne.mockResolvedValue(product);
    Order.create.mockResolvedValue(orderDoc);
    Cart.findOneAndUpdate.mockResolvedValue({});

    await createOrder(USER_ID);

    expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: USER_ID },
      { items: [] }
    );
  });
});

// ── Error propagation ───────────────────────────────────────────────────────

describe("error propagation", () => {
  test("throws when Order.create fails", async () => {
    Product.findOne.mockResolvedValue(makeProduct());
    Order.create.mockRejectedValue(new Error("Database write failed"));

    const items = [{ productId: 101, quantity: 1 }];
    await expect(createOrder(USER_ID, items)).rejects.toThrow(
      "Database write failed"
    );
  });

  test("throws when Cart.findOneAndUpdate fails", async () => {
    const product = makeProduct();
    const orderDoc = makeOrderDoc();
    Product.findOne.mockResolvedValue(product);
    Order.create.mockResolvedValue(orderDoc);
    Cart.findOneAndUpdate.mockRejectedValue(new Error("Cart update failed"));

    const items = [{ productId: 101, quantity: 1 }];
    await expect(createOrder(USER_ID, items)).rejects.toThrow(
      "Cart update failed"
    );
  });
});
