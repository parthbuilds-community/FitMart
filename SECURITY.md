# Security Policy

FitMart is an open-source project that handles real user authentication, payment flows, and personal data. We take security seriously and appreciate the community's help in keeping it safe for everyone.

---

## 📌 Table of Contents

- [Supported Versions](#-supported-versions)
- [Reporting a Vulnerability](#-reporting-a-vulnerability)
- [What to Include in Your Report](#-what-to-include-in-your-report)
- [Response Process](#-response-process)
- [Scope](#-scope)
- [Out of Scope](#-out-of-scope)
- [Security Best Practices for Contributors](#-security-best-practices-for-contributors)
- [Known Security Controls](#-known-security-controls)
- [AI Chat Security & Prompt Safety](#-ai-chat-security--prompt-safety)
- [Disclosure Policy](#-disclosure-policy)

---

## 🔢 Supported Versions

FitMart is currently in active development. Security fixes are applied to the latest version on the `main` branch only.

| Branch / Version | Supported |
|---|---|
| `main` (latest) | ✅ Yes |
| Older forks / branches | ❌ No |

---

## 🚨 Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.** Doing so exposes the flaw to everyone before it can be fixed.

Instead, report vulnerabilities through one of these private channels:

- **GitHub Private Advisory:** Go to the [Security tab](https://github.com/parthbuilds-community/FitMart/security/advisories/new) of the repository and open a new private advisory *(recommended)*.
- **Email:** Send a detailed report to **parthnarkarofficial@gmail.com** with the subject line `[FitMart Security] <brief description>`.

---

## 📋 What to Include in Your Report

A good vulnerability report helps us triage and fix the issue quickly. Please include as many of the following as possible:

- **Description** — A clear explanation of the vulnerability and its nature (e.g., authentication bypass, data exposure, injection).
- **Affected component** — Which part of the codebase is affected (e.g., `/api/payment/verify-payment`, Firebase token handling, the bug reporting endpoint, or the AI chat endpoint).
- **Steps to reproduce** — A minimal, reliable sequence of steps to trigger the issue.
- **Proof of concept** — A curl command, screenshot, or short script demonstrating the vulnerability (where safe to share).
- **Potential impact** — What an attacker could achieve by exploiting this (e.g., access another user's orders, bypass payment verification, exfiltrate user emails, prompt injection into the AI chat).
- **Suggested fix** — If you have one, we'd love to hear it — though it's not required.

---

## 🔄 Response Process

We aim to handle reports according to the following timeline:

| Stage | Target Timeframe |
|---|---|
| Initial acknowledgement | Within 3 business days |
| Triage and severity assessment | Within 7 days |
| Fix developed and tested | Within 14–30 days (depending on severity) |
| Fix deployed to `main` | As soon as it's ready and tested |
| Credit given (if desired) | At time of disclosure |

If you haven't received an acknowledgement within 3 business days, please follow up via email.

We will keep you informed throughout the process and let you know when the fix is live. We ask that you give us reasonable time to patch the issue before any public disclosure.

---

## 🎯 Scope

The following components are in scope for vulnerability reports:

### Backend (Node.js / Express)

- **Authentication middleware** — Firebase Admin SDK token verification (`server/middleware/verifyFirebaseToken.js`), including token forgery or bypass
- **Payment flow** — Razorpay order creation and HMAC signature verification (`server/routes/payment.js`); any bypass that allows orders to be marked `paid` without a valid Razorpay signature
- **API endpoints** — Any endpoint that leaks data it shouldn't, allows unauthorized access, or is vulnerable to injection (NoSQL injection via Mongoose, etc.)
- **AI Chat endpoint** — Prompt injection, instruction overrides, role-playing manipulations, or any attempt to bypass safety measures in `/api/chat` (see [AI Chat Security](#-ai-chat-security--prompt-safety) section for details)
- **Rate limiting** — Bypasses to the API, payment, or chat rate limiters
- **Cart and order logic** — Stock reservation manipulation, price tampering during checkout
- **Email services** — Any way to trigger unsolicited bulk emails or forge the sender identity
- **Bug reporting endpoint** — Injection or privilege escalation via the `/api/bugs` route
- **Admin-only routes** — Any way a non-admin user can access `/admin/*` data or actions

### Frontend (React / Vite)

- **Route guards** — Bypassing `AdminRoute` or `NonAdminRoute` to access protected pages
- **Client-side secrets** — Any `.env` variable that should not be public but is accidentally exposed
- **XSS** — Cross-site scripting via unsanitized user content rendered in the UI

### Data & Infrastructure

- **MongoDB** — Any query or payload that results in unauthorized data access or deletion
- **Firebase** — Misconfiguration that allows unauthorized Firebase Auth actions
- **Exposed credentials** — API keys, secrets, or service account credentials accidentally committed to the repository

---

## 🚫 Out of Scope

The following are **not** considered valid security reports for this project:

- Vulnerabilities in third-party services (Firebase, Razorpay, MongoDB Atlas, Google Gemini, RapidAPI) — report those to the respective vendors
- Issues that only affect local development environments (e.g., no HTTPS on `localhost`)
- Missing security headers beyond what is already handled by Helmet
- Rate limiting configurations that are intentionally lenient for demo purposes
- The demo payment bypass button (`/api/payment/demo-success`) — it is intentionally present for testing and documented as such
- Self-XSS or attacks that require the victim to already have admin access
- Theoretical vulnerabilities with no demonstrated impact
- Social engineering attacks
- Denial of service via resource exhaustion without a practical exploit
- Prompt injection that relies solely on manipulating the fallback response mechanism without bypassing core safety controls (see defense-in-depth measures in [AI Chat Security](#-ai-chat-security--prompt-safety))

---

## 🛡️ Security Best Practices for Contributors

If you're contributing code, please follow these practices to keep FitMart secure:

**Environment Variables**
- Never hardcode API keys, secrets, or credentials in source code
- Never commit `.env` files — they are gitignored for a reason
- Only client-safe Firebase config keys belong in `VITE_*` variables; service account credentials must stay server-side only
- Always document new environment variables in `README.md` and mark them as optional/required appropriately

**Authentication**
- Use the `verifyFirebaseToken` middleware for any endpoint that requires a logged-in user
- Never trust `userId` values from the request body for privileged actions — always derive identity from the verified Firebase token (`req.user`)
- Admin actions must verify that the requesting user's UID matches `ADMIN_UID`

**Input Validation**
- Always validate required fields before processing — return a clear `400` error for missing or malformed input
- Never pass unsanitized user input directly into a MongoDB query
- Never pass unsanitized user input into logs, emails, or HTML output
- For AI chat endpoints, apply additional sanitization (control character removal, prompt injection neutralization) — see [AI Chat Security](#-ai-chat-security--prompt-safety)

**Payment Security**
- Always verify Razorpay payments server-side using HMAC-SHA256 — never trust the client to report payment success
- Never expose `RAZORPAY_KEY_SECRET` to the frontend
- Remove or gate the demo payment bypass (`POST /api/payment/demo-success`) before any production deployment

**Sensitive Data**
- The request logger automatically redacts `password`, `token`, `secret`, and `apiKey` fields — keep this list updated if you add new sensitive fields
- Never log full request bodies in production if they may contain PII (emails, addresses, phone numbers)
- User emails stored in `UserProfile` are used only for transactional emails — do not expose them through unauthenticated API responses

**Dependencies**
- Keep dependencies up to date; run `npm audit` periodically
- Do not add dependencies with known critical vulnerabilities

---

## 🔐 Known Security Controls

Here is a summary of the security measures already in place in FitMart:

| Control | Implementation |
|---|---|
| Authentication | Firebase Admin SDK token verification on protected routes |
| Payment verification | HMAC-SHA256 signature verification server-side |
| HTTP security headers | `helmet` middleware applied globally |
| Rate limiting | `express-rate-limit`: 100 req/15 min (API), 20 req/15 min (payment routes) |
| CORS | Allowlist-based origin validation; rejects unknown origins |
| Request body size | Capped at `10kb` to mitigate payload flooding |
| Request logging | Colored structured logger with automatic redaction of sensitive keys |
| ETag disabled | Prevents conditional 304 responses leaking cached sensitive data |
| Cache-Control | `no-store` header set on all `/api` responses |
| Admin route guarding | UID-based guard on both client (React) and server (Admin SDK) |
| No secrets in client | Service account credentials strictly server-side only |

---

## 🤖 AI Chat Security & Prompt Safety

The AI chat endpoint (`/api/chat`) implements defense-in-depth measures for prompt safety and cost control when interacting with generative models. See `server/routes/chat.js` for the complete implementation.

### Purpose

Document server-side input validation and prompt safety measures for the AI chat endpoint (`/api/chat`).

### Input Validation

- Message must be a non-empty string and is capped at 500 characters.
- Requests are validated with a strict schema (no extra fields allowed).
- Invalid requests return HTTP 400 with a short list of validation errors.

### Additional Enforcement

- The server enforces a request body size limit via `express.json({ limit: "10kb" })`. Oversized JSON bodies may be rejected by the parser (HTTP 413).
- A global error handler maps parser/body-size errors to HTTP 413 with a `Payload too large` message.

### Sanitization Rules

Disallowed control characters are removed (null bytes, unusual unicode control codes), while keeping normal printable characters, tabs, and newlines:
- Multiple consecutive newlines are collapsed to a maximum of two (`\n\n`).
- Excessive whitespace is collapsed.
- Fenced code block markers (```) are neutralized to reduce instruction injection vectors.
- Common role-override / prompt-injection phrases (e.g., "ignore previous instructions", "you are now", "act as") are replaced with a neutral token `[redacted]`.

### Prompt Construction Safety

The system maintains a strong system persona (`SYSTEM_PROMPT`) describing the fitness assistant role and allowed topics:
- An additional explicit safety instruction (`SAFETY_INSTRUCTION`) is prepended to the user prompt to tell the model not to follow any instructions embedded in the user's content.
- User content is wrapped with clear delimiters:

  `[USER INPUT START]`
  `{user content}`
  `[USER INPUT END]`

  This signals to the model that the enclosed text is data, not instructions.

### Rate Limiting and DoS Prevention

- Keep server-side rate limiting enabled (see `express-rate-limit` in `server/package.json`).
- Consider per-IP and per-user rate limits for `/api/chat` to reduce abuse and token-cost exposure.

### Development & CORS

- During development the server allows all origins for convenience. To explicitly enable that behavior in other environments set the environment variable `ALLOW_ALL_ORIGINS=true`.
- For production deployments, ensure `ALLOWED_ORIGIN` is set and `ALLOW_ALL_ORIGINS` is not enabled.

### Runtime Behavior and Fallbacks

- If the upstream generative model call errors with HTTP 429 (rate limit), the route falls back to an internal curated response for common fitness topics.
- API key errors or unrelated model errors may also be caught; fallback responses are used where appropriate to avoid exposing raw model errors to end users.

### Reporting Security Issues

If you discover a security issue related to the chat or prompt handling, please report it to the repository maintainers via a private channel or to the security contact listed in this document.

### Notes for Reviewers

- See `server/routes/chat.js` for the implementation of validation and sanitization.
- Tests to perform (recommended):
  1. Empty input → expect HTTP 400.
  2. Message over 500 characters → expect HTTP 400 and error explaining the max length.
  3. Injection attempts ("Ignore all instructions...") → the message is sanitized and neutralized; the model receives the system prompt and safety instruction first and user input inside delimiters.
  4. Oversized JSON (over `10kb`) → expect HTTP 413 `Payload too large`.
  5. Requests from cross-origin frontends: in development all origins are allowed by default; check `ALLOW_ALL_ORIGINS` and `ALLOWED_ORIGIN` in `server/index.js`.

These measures implement defense-in-depth for prompt safety and cost control when interacting with generative models.

---

## 📢 Disclosure Policy

FitMart follows a **coordinated disclosure** model:

1. You report the vulnerability privately.
2. We acknowledge, triage, and fix it.
3. We notify you when the fix is deployed.
4. You may publish your findings publicly after the fix is live, with credit to you if you wish.

We will never take legal action against researchers who discover and report vulnerabilities in good faith, following this policy.

---

Thank you for helping keep FitMart and its users safe. Security researchers and contributors who responsibly disclose issues are a vital part of open-source software. We genuinely appreciate it. 🙏

---

<div align="center">

Made with ❤️ by [Parth Narkar](https://github.com/parthnarkar) and the [Parth Builds Community](https://www.instagram.com/parth.builds/)

</div>