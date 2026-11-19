import type { Response } from "express";
import type { ApiErrorCode } from "../../shared/domain/api";

/**
 * Sends the shared error envelope: { error: { code, message, details? } }.
 * New Phase 1 routes use this shape; legacy routes are migrated as they are
 * rewritten.
 */
export function sendApiError(
  res: Response,
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): Response {
  return res.status(status).json({
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  });
}
