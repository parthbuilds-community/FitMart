import { z } from "zod";
import { moneySchema } from "./money";

export const PAYMENT_STATUSES = [
  "created",
  "pending",
  "captured",
  "failed",
  "refunded",
  "paid_unfulfilled",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);

export const paymentAttemptSchema = z.object({
  id: z.string().min(1),
  quoteId: z.string().min(1),
  userId: z.string().min(1),
  provider: z.literal("razorpay"),
  providerOrderId: z.string().min(1),
  providerPaymentId: z.string().min(1).optional(),
  status: paymentStatusSchema,
  amountMinor: moneySchema,
  currency: z.literal("INR"),
  refundId: z.string().min(1).optional(),
  failureReason: z.string().min(1).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type PaymentAttempt = z.infer<typeof paymentAttemptSchema>;

/** Statuses that mean the provider has taken money. */
export function isCapturedStatus(status: PaymentStatus): boolean {
  return status === "captured" || status === "paid_unfulfilled" || status === "refunded";
}

/** Statuses that can still move to a terminal state. */
export function isOpenStatus(status: PaymentStatus): boolean {
  return status === "created" || status === "pending";
}
