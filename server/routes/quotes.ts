import express, { type Response } from "express";
import { createQuoteRequestSchema } from "../../shared/domain/quote";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { sendApiError } from "../utils/apiError";
import {
  createQuote,
  getPayableQuote,
  QuoteError,
  type QuoteResult,
} from "../services/quoteService";

const router = express.Router();

function serializeQuote(quote: QuoteResult) {
  return {
    id: quote._id.toString(),
    userId: quote.userId,
    status: quote.status,
    currency: quote.currency,
    lines: quote.lines.map((line) => ({
      productId: line.productId,
      name: line.name,
      quantity: line.quantity,
      unitPriceMinor: line.unitPriceMinor,
      lineTotalMinor: line.lineTotalMinor,
    })),
    subtotalMinor: quote.subtotalMinor,
    shippingMinor: quote.shippingMinor,
    totalMinor: quote.totalMinor,
    address: quote.address,
    idempotencyKey: quote.idempotencyKey,
    expiresAt: quote.expiresAt,
    createdAt: quote.createdAt,
  };
}

function handleError(res: Response, error: unknown): Response {
  if (error instanceof QuoteError) {
    return sendApiError(res, error.status, error.code, error.message);
  }

  console.error("Quote route error:", error);
  return sendApiError(res, 500, "INTERNAL_ERROR", "Something went wrong");
}

/**
 * POST /api/quotes
 * Body: { addressId, idempotencyKey }
 *
 * Prices and totals are read from the database. A body that carries an amount,
 * total, or line prices fails validation instead of being trusted.
 */
router.post("/", requireAuth, async (req, res) => {
  const user = (req as AuthedRequest).user;
  if (!user) {
    return sendApiError(res, 401, "UNAUTHORIZED", "Unauthorized — no user found");
  }

  const parsed = createQuoteRequestSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return sendApiError(res, 400, "VALIDATION_ERROR", "Invalid quote request", parsed.error.issues);
  }

  try {
    const quote = await createQuote(user.uid, parsed.data);
    return res.status(201).json({ data: serializeQuote(quote) });
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * GET /api/quotes/:quoteId
 *
 * Returns an active, unexpired quote owned by the caller. Expired quotes
 * return 410 QUOTE_EXPIRED; consumed or cancelled quotes return 409.
 */
router.get("/:quoteId", requireAuth, async (req, res) => {
  const user = (req as AuthedRequest).user;
  if (!user) {
    return sendApiError(res, 401, "UNAUTHORIZED", "Unauthorized — no user found");
  }

  try {
    const quote = await getPayableQuote(String(req.params.quoteId), user.uid);
    return res.json({ data: serializeQuote(quote) });
  } catch (error) {
    return handleError(res, error);
  }
});

export const quotesRouter = router;
export default router;
