import { z } from "zod";
import { addressSnapshotSchema } from "./quote";
import { moneySchema } from "./money";

export const ORDER_STATUSES = [
  "created",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const orderLineSchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceMinor: moneySchema,
  lineTotalMinor: moneySchema,
});

export type OrderLine = z.infer<typeof orderLineSchema>;

/**
 * An order keeps immutable copies of the commercial terms. Product edits,
 * price changes, and archiving must never rewrite an existing order.
 */
export const orderSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().min(1),
  userId: z.string().min(1),
  quoteId: z.string().min(1),
  paymentAttemptId: z.string().min(1),
  status: orderStatusSchema,
  lines: z.array(orderLineSchema).min(1),
  subtotalMinor: moneySchema,
  shippingMinor: moneySchema,
  totalMinor: moneySchema,
  currency: z.literal("INR"),
  address: addressSnapshotSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Order = z.infer<typeof orderSchema>;

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return status === "fulfilled" || status === "cancelled" || status === "refunded";
}
