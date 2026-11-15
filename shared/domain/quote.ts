import { z } from "zod";
import { moneySchema } from "./money";

export const QUOTE_STATUSES = [
  "draft",
  "active",
  "expired",
  "consumed",
  "cancelled",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const quoteStatusSchema = z.enum(QUOTE_STATUSES);

export const quoteLineSchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceMinor: moneySchema,
  lineTotalMinor: moneySchema,
});

export type QuoteLine = z.infer<typeof quoteLineSchema>;

export const addressSnapshotSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export type AddressSnapshot = z.infer<typeof addressSnapshotSchema>;

export const checkoutQuoteSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  status: quoteStatusSchema,
  currency: z.literal("INR"),
  lines: z.array(quoteLineSchema).min(1),
  subtotalMinor: moneySchema,
  shippingMinor: moneySchema,
  totalMinor: moneySchema,
  address: addressSnapshotSchema,
  idempotencyKey: z.string().min(1),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export type CheckoutQuote = z.infer<typeof checkoutQuoteSchema>;

/**
 * The client sends an address reference and an idempotency key. It never sends
 * prices, quantities from its own cart math, or a total.
 */
export const createQuoteRequestSchema = z.object({
  addressId: z.string().min(1),
  idempotencyKey: z.string().min(8).max(128),
});

export type CreateQuoteRequest = z.infer<typeof createQuoteRequestSchema>;

/** A quote that can still be paid. */
export function isQuotePayable(status: QuoteStatus): boolean {
  return status === "active";
}
