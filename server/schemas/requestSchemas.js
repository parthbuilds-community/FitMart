const { z } = require("zod");

const cartMutationBodySchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
});

const createOrderBodySchema = z.object({
  userId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
      })
    )
    .optional(),
});

const createProductBodySchema = z
  .object({
    productId: z.coerce.number().int().positive(),
    name: z.string().min(1),
    price: z.coerce.number().positive(),
    brand: z.string().optional(),
    category: z.string().optional(),
    stock: z.coerce.number().int().nonnegative().nullable().optional(),
    image: z.string().optional(),
    originalPrice: z.coerce.number().positive().nullable().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    reviews: z.coerce.number().int().nonnegative().optional(),
  })
  .passthrough();

const updateProductBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    price: z.coerce.number().positive().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    stock: z.coerce.number().int().nonnegative().nullable().optional(),
    image: z.string().optional(),
    originalPrice: z.coerce.number().positive().nullable().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    reviews: z.coerce.number().int().nonnegative().optional(),
  })
  .strict();

module.exports = {
  cartMutationBodySchema,
  createOrderBodySchema,
  createProductBodySchema,
  updateProductBodySchema,
};
