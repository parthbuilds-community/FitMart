import mongoose, { Schema, type Model } from "mongoose";

/**
 * A persisted quote freezes the commercial terms of one checkout attempt:
 * line names, quantities, unit prices, totals, and the shipping address.
 *
 * It is the single input to payment creation, so the client never sends an
 * amount. See ADR-03 and shared/domain/quote.ts.
 */

export interface QuoteLineRecord {
  productId: number;
  name: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
}

export interface QuoteAddressRecord {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutQuoteRecord {
  userId: string;
  status: "draft" | "active" | "expired" | "consumed" | "cancelled";
  currency: "INR";
  lines: QuoteLineRecord[];
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  address: QuoteAddressRecord;
  idempotencyKey: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const quoteLineSchema = new Schema<QuoteLineRecord>(
  {
    productId: { type: Number, required: true, min: 1 },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: "unitPriceMinor must be an integer" },
    },
    lineTotalMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: "lineTotalMinor must be an integer" },
    },
  },
  { _id: false },
);

const addressSchema = new Schema<QuoteAddressRecord>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false },
);

const checkoutQuoteSchema = new Schema<CheckoutQuoteRecord>(
  {
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["draft", "active", "expired", "consumed", "cancelled"],
      default: "active",
      index: true,
    },
    currency: { type: String, enum: ["INR"], default: "INR" },
    lines: { type: [quoteLineSchema], required: true },
    subtotalMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: "subtotalMinor must be an integer" },
    },
    shippingMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: "shippingMinor must be an integer" },
    },
    totalMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: "totalMinor must be an integer" },
    },
    address: { type: addressSchema, required: true },
    idempotencyKey: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

// A retried request with the same key reuses the existing quote.
checkoutQuoteSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });

export const CheckoutQuote: Model<CheckoutQuoteRecord> =
  (mongoose.models.CheckoutQuote as Model<CheckoutQuoteRecord> | undefined) ??
  mongoose.model<CheckoutQuoteRecord>("CheckoutQuote", checkoutQuoteSchema);

export default CheckoutQuote;
