import { z } from "zod";

export const API_ERROR_CODES = [
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INSUFFICIENT_STOCK",
  "QUOTE_EXPIRED",
  "PAYMENT_FAILED",
  "RATE_LIMITED",
  "PAYLOAD_TOO_LARGE",
  "INTERNAL_ERROR",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export const apiErrorCodeSchema = z.enum(API_ERROR_CODES);

export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
  requestId?: string;
}

/** The single error shape every API route must return. */
export interface ApiErrorEnvelope {
  error: ApiErrorBody;
}

/** The single success shape for routes that return a payload. */
export interface ApiSuccessEnvelope<T> {
  data: T;
  requestId?: string;
}

export const apiErrorEnvelopeSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string().min(1),
    details: z.unknown().optional(),
    requestId: z.string().min(1).optional(),
  }),
});

export function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return apiErrorEnvelopeSchema.safeParse(value).success;
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  extra: Omit<ApiErrorBody, "code" | "message"> = {},
): ApiErrorEnvelope {
  return { error: { code, message, ...extra } };
}
