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
 * prices, quantities from its own cart math, or a total. Strict parsing rejects
 * a tampering attempt with `VALIDATION_ERROR` instead of silently dropping it.
 */
export const createQuoteRequestSchema = z
  .object({
    addressId: z.string().min(1),
    idempotencyKey: z.string().min(8).max(128),
  })
  .strict();

export type CreateQuoteRequest = z.infer<typeof createQuoteRequestSchema>;

/** A quote that can still be paid. */
export function isQuotePayable(status: QuoteStatus): boolean {
  return status === "active";
}

/**
 * A quote is payable only while it is active and before it expires. Status and
 * time are checked together so an `active` quote with a past `expiresAt` cannot
 * slip through.
 */
export type QuotePayabilityReason = "expired" | "not_active";

export type QuotePayability =
  | { payable: true }
  | { payable: false; reason: QuotePayabilityReason };

export function checkQuotePayability(
  quote: Pick<CheckoutQuote, "status" | "expiresAt">,
  now: Date = new Date(),
): QuotePayability {
  if (quote.status !== "active") {
    return { payable: false, reason: "not_active" };
  }

  if (quote.expiresAt.getTime() <= now.getTime()) {
    return { payable: false, reason: "expired" };
  }

  return { payable: true };
}

export class QuoteNotPayableError extends Error {
  constructor(readonly reason: QuotePayabilityReason) {
    super(reason === "expired" ? "Quote has expired" : "Quote is not active");
    this.name = "QuoteNotPayableError";
  }
}

declare const payableQuoteBrand: unique symbol;

/**
 * A quote that has passed the runtime payability check. Nothing constructs one
 * directly; only `assertQuotePayable` narrows a quote to this type, so the
 * payment path cannot accept an unchecked quote by accident.
 */
export type PayableQuote = CheckoutQuote & {
  status: "active";
  readonly [payableQuoteBrand]: "PayableQuote";
};

export function assertQuotePayable(
  quote: Pick<CheckoutQuote, "status" | "expiresAt">,
  now: Date = new Date(),
): asserts quote is PayableQuote {
  const result = checkQuotePayability(quote, now);
  if (!result.payable) {
    throw new QuoteNotPayableError(result.reason);
  }
}

