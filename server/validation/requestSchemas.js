const { z } = require('zod');

const userIdParamsSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
});

const productIdParamSchema = z.object({
  id: z.coerce.number().finite().int().positive('id must be a positive integer'),
});

const productIdSchema = z.coerce.number().finite().int().positive('productId must be a positive integer');
const quantitySchema = z.coerce.number().finite().int().positive('quantity must be a positive integer');
const nonNegativeNumberSchema = z.coerce.number().finite().min(0, 'must be zero or greater');
const nonNegativeIntegerSchema = z.coerce.number().finite().int().min(0, 'must be a non-negative integer');

const nullableNonNegativeNumberSchema = z
  .union([z.null(), nonNegativeNumberSchema])
  .optional();

const nullableNonNegativeIntegerSchema = z
  .union([z.null(), nonNegativeIntegerSchema])
  .optional();

const nullableStringSchema = z
  .union([z.string(), z.null()])
  .optional();

const cartItemSchema = z.object({
  productId: productIdSchema,
  quantity: quantitySchema,
}).strict();

const productFieldsSchema = z.object({
  productId: productIdSchema,
  name: z.string().trim().min(1, 'name is required'),
  brand: z.string().optional(),
  category: z.string().optional(),
  price: z.coerce.number().finite().positive('price must be a positive number'),
  originalPrice: nullableNonNegativeNumberSchema,
  rating: nonNegativeNumberSchema.optional(),
  reviews: nonNegativeIntegerSchema.optional(),
  badge: nullableStringSchema,
  image: z.string().optional(),
  stock: nullableNonNegativeIntegerSchema,
  reserved: nonNegativeIntegerSchema.optional(),
}).strict();

const productUpdateBodySchema = productFieldsSchema
  .partial()
  .refine(body => Object.keys(body).length > 0, {
    message: 'At least one product field is required',
  });

module.exports = {
  cartAddSchema: {
    params: userIdParamsSchema,
    body: cartItemSchema,
  },
  cartRemoveSchema: {
    params: userIdParamsSchema,
    body: cartItemSchema,
  },
  createOrderSchema: {
    body: z.object({
      userId: z.string().min(1, 'userId is required'),
      items: z.array(cartItemSchema).optional(),
    }).strict(),
  },
  createProductSchema: {
    body: productFieldsSchema,
  },
  updateProductSchema: {
    params: productIdParamSchema,
    body: productUpdateBodySchema,
  },
};
