import mongoose from "mongoose";
import type { ApiErrorCode } from "../../shared/domain/api";
import {
  addMoney,
  asMoney,
  multiplyMoney,
  rupeesToMinor,
  type Money,
} from "../../shared/domain/money";
import {
  assertQuotePayable,
  QuoteNotPayableError,
  type CreateQuoteRequest,
} from "../../shared/domain/quote";
import {
  CheckoutQuote,
  type CheckoutQuoteRecord,
  type QuoteAddressRecord,
  type QuoteLineRecord,
} from "../models/CheckoutQuote";
import { QUOTE_TTL_MS } from "../config/constants";

// Legacy CommonJS models, typed at the boundary in this file.
const UserProfile = require("../models/UserProfile");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

export interface QuoteResult extends CheckoutQuoteRecord {
  _id: mongoose.Types.ObjectId;
}

export class QuoteError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "QuoteError";
  }
}

interface ProductLike {
  productId: number;
  name: string;
  price: number;
  priceMinor?: number | null;
  stock?: number | null;
  reserved?: number | null;
  isActive?: boolean;
}

interface AddressLike {
  id?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

interface ProfileLike {
  name?: string;
  email?: string;
  phone?: string;
  addresses?: AddressLike[];
}

interface CartLike {
  items?: Array<{ productId: number; quantity: number }>;
}

function requireQueryString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new QuoteError("VALIDATION_ERROR", 400, `${label} must be a string`);
  }
  return value;
}

function required(value: string | undefined, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new QuoteError("VALIDATION_ERROR", 400, `Address is missing ${label}`);
  }
  return value.trim();
}

function toAddressSnapshot(profile: ProfileLike, address: AddressLike): QuoteAddressRecord {
  const fullName = (profile.name || profile.email || "").trim();
  if (!fullName) {
    throw new QuoteError("VALIDATION_ERROR", 400, "Profile is missing a name or email");
  }

  return {
    fullName,
    phone: required(address.phone || profile.phone, "a phone number"),
    line1: required(address.line1, "line1"),
    ...(address.line2 && address.line2.trim() ? { line2: address.line2.trim() } : {}),
    city: required(address.city, "city"),
    state: required(address.state, "state"),
    postalCode: required(address.zip, "a postal code"),
    country: required(address.country, "country"),
  };
}

/** Reads integer paise from the product, falling back to a rounded rupee price. */
function unitPriceFor(product: ProductLike): Money {
  const minor = Number(product.priceMinor);
  if (Number.isInteger(minor) && minor >= 0) {
    return asMoney(minor);
  }

  const rupees = Number(product.price);
  if (!Number.isFinite(rupees) || rupees < 0) {
    throw new QuoteError(
      "INTERNAL_ERROR",
      500,
      `Product ${product.productId} has no valid price`,
    );
  }

  return rupeesToMinor(rupees);
}

function quantityByProduct(cart: CartLike): Map<number, number> {
  const quantities = new Map<number, number>();

  for (const item of cart.items ?? []) {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    if (!Number.isInteger(productId) || productId <= 0) continue;
    if (!Number.isInteger(quantity) || quantity <= 0) continue;
    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }

  return quantities;
}

/**
 * Creates (or returns) an active quote for the authenticated user.
 *
 * Prices, names, stock checks, and totals come from the database. The request
 * carries only an address reference and an idempotency key.
 */
export async function createQuote(
  userId: string,
  input: CreateQuoteRequest,
): Promise<QuoteResult> {
  const safeUserId = requireQueryString(userId, "userId");
  const safeAddressId = requireQueryString(input.addressId, "addressId");
  const safeIdempotencyKey = requireQueryString(input.idempotencyKey, "idempotencyKey");

  const existing = await CheckoutQuote.findOne({
    userId: safeUserId,
    idempotencyKey: safeIdempotencyKey,
  }).lean();

  if (existing) {
    return existing as unknown as QuoteResult;
  }

  const profile: ProfileLike | null = await UserProfile.findOne({ userId: safeUserId }).lean();
  if (!profile) {
    throw new QuoteError("NOT_FOUND", 404, "Profile not found");
  }

  const address = (profile.addresses ?? []).find((entry) => entry.id === safeAddressId);
  if (!address) {
    // A quote can only use an address stored on the caller's own profile.
    throw new QuoteError("NOT_FOUND", 404, "Address not found");
  }

  const cart: CartLike | null = await Cart.findOne({ userId: safeUserId }).lean();
  const quantities = quantityByProduct(cart ?? {});
  if (quantities.size === 0) {
    throw new QuoteError("CONFLICT", 409, "Cart is empty");
  }

  const products: ProductLike[] = await Product.find({
    productId: { $in: [...quantities.keys()] },
  }).lean();
  const byProductId = new Map(products.map((product) => [product.productId, product]));

  const lines: QuoteLineRecord[] = [];

  for (const [productId, quantity] of quantities) {
    const product = byProductId.get(productId);
    if (!product) {
      throw new QuoteError("NOT_FOUND", 404, `Product ${productId} not found`);
    }

    if (product.isActive === false) {
      throw new QuoteError("CONFLICT", 409, `${product.name} is no longer available`);
    }

    if (product.stock != null) {
      const available = Math.max(0, Number(product.stock) - Number(product.reserved ?? 0));
      if (quantity > available) {
        throw new QuoteError(
          "INSUFFICIENT_STOCK",
          409,
          `Insufficient stock for ${product.name}. Available: ${available}`,
        );
      }
    }

    const unitPriceMinor = unitPriceFor(product);
    lines.push({
      productId,
      name: product.name,
      quantity,
      unitPriceMinor,
      lineTotalMinor: multiplyMoney(unitPriceMinor, quantity),
    });
  }

  const subtotalMinor = addMoney(...lines.map((line) => asMoney(line.lineTotalMinor)));
  const shippingMinor = asMoney(0); // ADR-03: no shipping or discounts in v2.0.0
  const totalMinor = addMoney(subtotalMinor, shippingMinor);
  const addressSnapshot = toAddressSnapshot(profile, address);
  const now = Date.now();

  try {
    const created = await CheckoutQuote.findOneAndUpdate(
      { userId: safeUserId, idempotencyKey: safeIdempotencyKey },
      {
        $setOnInsert: {
          userId: safeUserId,
          status: "active",
          currency: "INR",
          lines,
          subtotalMinor,
          shippingMinor,
          totalMinor,
          address: addressSnapshot,
          idempotencyKey: safeIdempotencyKey,
          expiresAt: new Date(now + Number(QUOTE_TTL_MS)),
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    ).lean();

    return created as unknown as QuoteResult;
  } catch (error) {
    // Concurrent retries can race past the initial lookup; the unique index
    // makes one insert win and the loser reads the winner's quote.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      const winner = await CheckoutQuote.findOne({
        userId: safeUserId,
        idempotencyKey: safeIdempotencyKey,
      }).lean();
      if (winner) return winner as unknown as QuoteResult;
    }
    throw error;
  }
}

/** Loads a quote that belongs to the caller. */
export async function getQuoteForUser(
  quoteId: string,
  userId: string,
): Promise<QuoteResult> {
  const safeQuoteId = requireQueryString(quoteId, "quoteId");
  const safeUserId = requireQueryString(userId, "userId");
  if (!mongoose.isValidObjectId(safeQuoteId)) {
    throw new QuoteError("NOT_FOUND", 404, "Quote not found");
  }

  const quote = await CheckoutQuote.findOne({ _id: safeQuoteId, userId: safeUserId }).lean();
  if (!quote) {
    throw new QuoteError("NOT_FOUND", 404, "Quote not found");
  }

  return quote as unknown as QuoteResult;
}

/**
 * Loads a quote and refuses it unless it is active and unexpired. Payment
 * creation calls this; an expired quote is marked expired on the way out so
 * repeated attempts fail deterministically.
 */
export async function getPayableQuote(
  quoteId: string,
  userId: string,
  now: Date = new Date(),
): Promise<QuoteResult> {
  const quote = await getQuoteForUser(quoteId, userId);

  try {
    assertQuotePayable(quote, now);
  } catch (error) {
    if (error instanceof QuoteNotPayableError && error.reason === "expired") {
      await CheckoutQuote.updateOne(
        { _id: quote._id, status: "active" },
        { $set: { status: "expired" } },
      );
      throw new QuoteError("QUOTE_EXPIRED", 410, "Quote has expired");
    }

    if (error instanceof QuoteNotPayableError) {
      throw new QuoteError("CONFLICT", 409, "Quote is not payable");
    }

    throw error;
  }

  return quote;
}
