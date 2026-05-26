Security Guidelines — FitMart

Purpose
- Document server-side input validation and prompt safety measures for the AI chat endpoint (`/api/chat`).

Input validation
- Message must be a non-empty string and is capped at 500 characters.
- Requests are validated with a strict schema (no extra fields allowed).
- Invalid requests return HTTP 400 with a short list of validation errors.

Additional enforcement
- The server enforces a request body size limit via `express.json({ limit: "10kb" })`. Oversized JSON bodies may be rejected by the parser (HTTP 413).
- A global error handler maps parser/body-size errors to HTTP 413 with a `Payload too large` message.

Sanitization rules
- Disallowed control characters are removed (null bytes, unusual unicode control codes), while keeping normal printable characters, tabs, and newlines.
- Multiple consecutive newlines are collapsed to a maximum of two (`\n\n`).
- Excessive whitespace is collapsed.
- Fenced code block markers (``` ) are neutralized to reduce instruction injection vectors.
- Common role-override / prompt-injection phrases (e.g., "ignore previous instructions", "you are now", "act as") are replaced with a neutral token `[redacted]`.

Prompt construction safety
- The system maintains a strong system persona (`SYSTEM_PROMPT`) describing the fitness assistant role and allowed topics.
- An additional explicit safety instruction (`SAFETY_INSTRUCTION`) is prepended to the user prompt to tell the model not to follow any instructions embedded in the user's content.
- User content is wrapped with clear delimiters:

  [USER INPUT START]
  {user content}
  [USER INPUT END]

  This signals to the model that the enclosed text is data, not instructions.

Rate limiting and DoS prevention
- Keep server-side rate limiting enabled (see `express-rate-limit` in `server/package.json`).
- Consider per-IP and per-user rate limits for `/api/chat` to reduce abuse and token-cost exposure.

Development & CORS
- During development the server allows all origins for convenience. To explicitly enable that behavior in other environments set the environment variable `ALLOW_ALL_ORIGINS=true`.
- For production deployments, ensure `ALLOWED_ORIGIN` is set and `ALLOW_ALL_ORIGINS` is not enabled.

Runtime behavior and fallbacks
- If the upstream generative model call errors with HTTP 429 (rate limit), the route falls back to an internal curated response for common fitness topics.
- API key errors or unrelated model errors may also be caught; fallback responses are used where appropriate to avoid exposing raw model errors to end users.

Reporting security issues
- If you discover a security issue related to the chat or prompt handling, please report it to the repository maintainers via a private channel or to the security contact listed in `CONTRIBUTING.md`.

Notes for reviewers
- See `server/routes/chat.js` for the implementation of validation and sanitization.
- Tests to perform (recommended):
  1) Empty input → expect HTTP 400.
  2) Message over 500 characters → expect HTTP 400 and error explaining the max length.
  3) Injection attempts ("Ignore all instructions...") → the message is sanitized and neutralized; the model receives the system prompt and safety instruction first and user input inside delimiters.
  4) Oversized JSON (over `10kb`) → expect HTTP 413 `Payload too large`.
  5) Requests from cross-origin frontends: in development all origins are allowed by default; check `ALLOW_ALL_ORIGINS` and `ALLOWED_ORIGIN` in `server/index.js`.

These measures implement defense-in-depth for prompt safety and cost control when interacting with generative models.
