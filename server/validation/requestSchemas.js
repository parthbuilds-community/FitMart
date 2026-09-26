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
  productId: z.number({
    required_error: "productId is required",
    invalid_type_error: "Expected number, received string"
  }).int().positive(),

  quantity: z.number({
    required_error: "quantity is required",
    invalid_type_error: "Expected number, received string"
  }).int().min(1,{message: "Number must be greater than 0" }).max(99,{message: "Quantity cannot exceed 99" })
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

const workoutExerciseSchema = z.object({
  id: z.string().min(1, 'id is required'),
  name: z.string().min(1, 'name is required'),
  bodyPart: z.string().optional(),
  target: z.string().optional(),
  equipment: z.string().optional(),
  gifUrl: z.string().optional()
}).strict();

const workoutLogBodySchema = z.object({
  date: z.string().min(1, 'date is required'),
  title: z.string().optional(),
  notes: z.string().optional(),
  exercises: z.array(workoutExerciseSchema).optional()
}).strict();

// Shared 24-character hexadecimal ObjectId validator.
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/i, 'must be a 24-character hexadecimal id');

// ── Memberships ─────────────────────────────────────────────────────────────

// Only `planId` is required. `userId` is the admin-only escape hatch for
// enrolling somebody else, so omitting it means "the authenticated user".
const createMembershipBodySchema = z
  .object({
    planId: objectIdSchema,
    userId: z.string().trim().min(1, 'userId cannot be empty').optional(),
  })
  .strict();

// Sort accepts one of the documented membership fields, optionally prefixed with
// "-" to reverse the order (for example `-renewCount`). Unknown fields are
// rejected so a caller cannot ask MongoDB to sort on an arbitrary/unindexed
// path. Default ordering is newest first.
const membershipSortSchema = z
  .string()
  .trim()
  .regex(
    /^-?(createdAt|status|renewCount|expiresAt)$/,
    'sort must be one of createdAt, status, renewCount, expiresAt (prefix with - to reverse)'
  )
  .default('-createdAt');

// Unknown query params are stripped rather than rejected so cache-busting params
// and future additions do not turn into 400s for existing clients.
const listMembershipsQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'page must be 1 or greater').default(1),
  limit: z.coerce.number().int().min(1).max(50, 'limit cannot exceed 50').default(10),
  status: z.enum(['active', 'paused', 'cancelled', 'expired', 'trialing']).optional(),
  sort: membershipSortSchema,
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
  createMembershipSchema: {
    body: createMembershipBodySchema,
  },
  listMembershipsSchema: {
    query: listMembershipsQuerySchema,
  },
  updateWorkoutLogSchema: {
    body: workoutLogBodySchema,
  },
};
