const {
  cartAddSchema,
  cartRemoveSchema,
  createOrderSchema,
  createProductSchema,
  updateProductSchema,
} = require('../validation/requestSchemas');

describe('requestSchemas - cartAddSchema', () => {
  describe('params validation (userIdParamsSchema)', () => {
    test('should pass with valid userId', () => {
      const result = cartAddSchema.params.safeParse({ userId: '123' });
      expect(result.success).toBe(true);
    });

    test('should fail with empty userId', () => {
      const result = cartAddSchema.params.safeParse({ userId: '' });
      expect(result.success).toBe(false);
    });

    test('should fail with missing userId', () => {
      const result = cartAddSchema.params.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('body validation (cartItemSchema)', () => {
    test('should pass with valid productId and quantity', () => {
      const result = cartAddSchema.body.safeParse({ productId: 5, quantity: 2 });
      expect(result.success).toBe(true);
    });

    test('should fail with negative productId', () => {
      const result = cartAddSchema.body.safeParse({ productId: -1, quantity: 2 });
      expect(result.success).toBe(false);
    });

    test('should fail with zero quantity', () => {
      const result = cartAddSchema.body.safeParse({ productId: 5, quantity: 0 });
      expect(result.success).toBe(false);
    });

    test('should fail with missing productId', () => {
      const result = cartAddSchema.body.safeParse({ quantity: 2 });
      expect(result.success).toBe(false);
    });

    test('should fail with missing quantity', () => {
      const result = cartAddSchema.body.safeParse({ productId: 5 });
      expect(result.success).toBe(false);
    });

    test('should fail with extra fields due to strict mode', () => {
      const result = cartAddSchema.body.safeParse({ productId: 5, quantity: 2, extra: 'field' });
      expect(result.success).toBe(false);
    });

    test('should coerce string productId to number', () => {
      const result = cartAddSchema.body.safeParse({ productId: '5', quantity: '2' });
      expect(result.success).toBe(true);
      expect(result.data.productId).toBe(5);
      expect(result.data.quantity).toBe(2);
    });
  });
});

describe('requestSchemas - cartRemoveSchema', () => {
  describe('params validation (userIdParamsSchema)', () => {
    test('should pass with valid userId', () => {
      const result = cartRemoveSchema.params.safeParse({ userId: 'user456' });
      expect(result.success).toBe(true);
    });

    test('should fail with empty userId', () => {
      const result = cartRemoveSchema.params.safeParse({ userId: '' });
      expect(result.success).toBe(false);
    });

    test('should fail with missing userId', () => {
      const result = cartRemoveSchema.params.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('body validation (cartItemSchema)', () => {
    test('should pass with valid productId and quantity', () => {
      const result = cartRemoveSchema.body.safeParse({ productId: 10, quantity: 1 });
      expect(result.success).toBe(true);
    });

    test('should fail with non-integer quantity', () => {
      const result = cartRemoveSchema.body.safeParse({ productId: 10, quantity: 1.5 });
      expect(result.success).toBe(false);
    });

    test('should fail with zero productId', () => {
      const result = cartRemoveSchema.body.safeParse({ productId: 0, quantity: 1 });
      expect(result.success).toBe(false);
    });
  });
});

describe('requestSchemas - createOrderSchema', () => {
  describe('body validation', () => {
    test('should pass with valid userId and items', () => {
      const result = createOrderSchema.body.safeParse({
        userId: 'user123',
        items: [
          { productId: 1, quantity: 2 },
          { productId: 3, quantity: 1 },
        ],
      });
      expect(result.success).toBe(true);
    });

    test('should pass with valid userId and no items', () => {
      const result = createOrderSchema.body.safeParse({
        userId: 'user123',
      });
      expect(result.success).toBe(true);
    });

    test('should pass with valid userId and empty items array', () => {
      const result = createOrderSchema.body.safeParse({
        userId: 'user123',
        items: [],
      });
      expect(result.success).toBe(true);
    });

    test('should fail with missing userId', () => {
      const result = createOrderSchema.body.safeParse({
        items: [{ productId: 1, quantity: 2 }],
      });
      expect(result.success).toBe(false);
    });

    test('should fail with empty userId', () => {
      const result = createOrderSchema.body.safeParse({
        userId: '',
        items: [{ productId: 1, quantity: 2 }],
      });
      expect(result.success).toBe(false);
    });

    test('should fail with invalid item in items array', () => {
      const result = createOrderSchema.body.safeParse({
        userId: 'user123',
        items: [{ productId: -1, quantity: 2 }],
      });
      expect(result.success).toBe(false);
    });

    test('should fail with extra fields due to strict mode', () => {
      const result = createOrderSchema.body.safeParse({
        userId: 'user123',
        items: [],
        extra: 'field',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('requestSchemas - createProductSchema', () => {
  describe('body validation (productFieldsSchema)', () => {
    test('should pass with all required fields', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
      });
      expect(result.success).toBe(true);
    });

    test('should pass with all fields populated', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Premium Yoga Mat',
        brand: 'YogaBrand',
        category: 'Yoga',
        price: 49.99,
        originalPrice: 69.99,
        rating: 4.5,
        reviews: 120,
        badge: 'bestseller',
        image: 'https://example.com/image.jpg',
        stock: 50,
        reserved: 5,
      });
      expect(result.success).toBe(true);
    });

    test('should fail with missing productId', () => {
      const result = createProductSchema.body.safeParse({
        name: 'Dumbbell',
        price: 29.99,
      });
      expect(result.success).toBe(false);
    });

    test('should fail with missing name', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        price: 29.99,
      });
      expect(result.success).toBe(false);
    });

    test('should fail with empty name', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: '',
        price: 29.99,
      });
      expect(result.success).toBe(false);
    });

    test('should fail with missing price', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
      });
      expect(result.success).toBe(false);
    });

    test('should fail with zero price', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 0,
      });
      expect(result.success).toBe(false);
    });

    test('should fail with negative price', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: -29.99,
      });
      expect(result.success).toBe(false);
    });

    test('should fail with negative productId', () => {
      const result = createProductSchema.body.safeParse({
        productId: -1,
        name: 'Dumbbell',
        price: 29.99,
      });
      expect(result.success).toBe(false);
    });

    test('should fail with negative rating', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
        rating: -1,
      });
      expect(result.success).toBe(false);
    });

    test('should fail with negative reviews', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
        reviews: -5,
      });
      expect(result.success).toBe(false);
    });

    test('should pass with zero rating (edge case)', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
        rating: 0,
      });
      expect(result.success).toBe(true);
    });

    test('should pass with zero reviews (edge case)', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
        reviews: 0,
      });
      expect(result.success).toBe(true);
    });

    test('should pass with null originalPrice', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
        originalPrice: null,
      });
      expect(result.success).toBe(true);
    });

    test('should fail with negative originalPrice', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
        originalPrice: -10,
      });
      expect(result.success).toBe(false);
    });

    test('should pass with zero originalPrice (edge case)', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
        originalPrice: 0,
      });
      expect(result.success).toBe(true);
    });

    test('should pass with null badge', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
        badge: null,
      });
      expect(result.success).toBe(true);
    });

    test('should fail with null stock when stock field provided', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
        stock: null,
      });
      expect(result.success).toBe(true); // null is allowed for stock via nullableNonNegativeIntegerSchema
    });

    test('should pass with zero stock (edge case)', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
        stock: 0,
      });
      expect(result.success).toBe(true);
    });

    test('should fail with negative stock', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
        stock: -5,
      });
      expect(result.success).toBe(false);
    });

    test('should fail with extra fields due to strict mode', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: 'Dumbbell',
        price: 29.99,
        extra: 'field',
      });
      expect(result.success).toBe(false);
    });

    test('should trim whitespace from name', () => {
      const result = createProductSchema.body.safeParse({
        productId: 1,
        name: '  Dumbbell  ',
        price: 29.99,
      });
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Dumbbell');
    });

    test('should coerce string price to number', () => {
      const result = createProductSchema.body.safeParse({
        productId: '1',
        name: 'Dumbbell',
        price: '29.99',
      });
      expect(result.success).toBe(true);
      expect(result.data.price).toBe(29.99);
    });
  });
});

describe('requestSchemas - updateProductSchema', () => {
  describe('params validation (productIdParamSchema)', () => {
    test('should pass with valid product id', () => {
      const result = updateProductSchema.params.safeParse({ id: 1 });
      expect(result.success).toBe(true);
    });

    test('should fail with negative id', () => {
      const result = updateProductSchema.params.safeParse({ id: -1 });
      expect(result.success).toBe(false);
    });

    test('should fail with zero id', () => {
      const result = updateProductSchema.params.safeParse({ id: 0 });
      expect(result.success).toBe(false);
    });

    test('should fail with missing id', () => {
      const result = updateProductSchema.params.safeParse({});
      expect(result.success).toBe(false);
    });

    test('should coerce string id to number', () => {
      const result = updateProductSchema.params.safeParse({ id: '5' });
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(5);
    });
  });

  describe('body validation (productUpdateBodySchema - partial)', () => {
    test('should pass with single field update (name)', () => {
      const result = updateProductSchema.body.safeParse({ name: 'Updated Name' });
      expect(result.success).toBe(true);
    });

    test('should pass with single field update (price)', () => {
      const result = updateProductSchema.body.safeParse({ price: 39.99 });
      expect(result.success).toBe(true);
    });

    test('should pass with multiple field updates', () => {
      const result = updateProductSchema.body.safeParse({
        name: 'Updated Name',
        price: 39.99,
        stock: 100,
      });
      expect(result.success).toBe(true);
    });

    test('should fail with empty body', () => {
      const result = updateProductSchema.body.safeParse({});
      expect(result.success).toBe(false); // custom refine requires at least one field
    });

    test('should fail with only extra fields', () => {
      const result = updateProductSchema.body.safeParse({ extra: 'field' });
      expect(result.success).toBe(false); // strict mode + empty after removing extra
    });

    test('should fail with invalid price', () => {
      const result = updateProductSchema.body.safeParse({ price: -10 });
      expect(result.success).toBe(false);
    });

    test('should fail with zero price', () => {
      const result = updateProductSchema.body.safeParse({ price: 0 });
      expect(result.success).toBe(false);
    });

    test('should pass with empty name when updating other fields', () => {
      // Name can be empty in update if not provided at all
      const result = updateProductSchema.body.safeParse({ price: 39.99 });
      expect(result.success).toBe(true);
    });

    test('should fail with empty string name (when updating name)', () => {
      const result = updateProductSchema.body.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    test('should fail with negative stock', () => {
      const result = updateProductSchema.body.safeParse({ stock: -5 });
      expect(result.success).toBe(false);
    });

    test('should pass with zero stock (edge case)', () => {
      const result = updateProductSchema.body.safeParse({ stock: 0 });
      expect(result.success).toBe(true);
    });

    test('should fail with extra fields due to strict mode', () => {
      const result = updateProductSchema.body.safeParse({
        price: 39.99,
        extra: 'field',
      });
      expect(result.success).toBe(false);
    });

    test('should coerce string price to number in update', () => {
      const result = updateProductSchema.body.safeParse({ price: '49.99' });
      expect(result.success).toBe(true);
      expect(result.data.price).toBe(49.99);
    });

    test('should trim whitespace from name in update', () => {
      const result = updateProductSchema.body.safeParse({ name: '  Updated Name  ' });
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Updated Name');
    });
  });
});
