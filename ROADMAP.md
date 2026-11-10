# FitMart Implementation Roadmap

> **Status:** Phase 0 proposal — awaiting maintainer approval  
> **Last updated:** 2026-11-10  
> **Product definition:** [`docs/PRODUCT.md`](./docs/PRODUCT.md)  
> **v1.0 scope:** [`docs/SCOPE.md`](./docs/SCOPE.md)  
> **This document is the single source of truth for implementation order.**  
> **It supersedes `docs/NEW_PLAN.md`.** The "Fitness Membership OS" direction is retired.

---

## 0. How to use this roadmap

- Phases are ordered by dependency and risk, not by novelty.
- A phase is complete only when its acceptance criteria and exit gate are satisfied.
- No application code changes begin until the maintainer approves Phase 0.
- No feature work outside `docs/SCOPE.md` is accepted before v1.0.
- Every task that changes the money path must add or update tests that prove the invariant.
- Removing a feature includes removing its model, route, page, component, navigation, environment variables, dependencies, seed data, tests, and documentation.
- If a task reveals a correctness issue that invalidates a later phase, stop and update the roadmap before proceeding.

### Status legend

| Status | Meaning |
|---|---|
| Proposed | Defined but not started |
| In progress | Actively being implemented |
| Blocked | Waiting on a dependency or decision |
| Complete | Acceptance criteria and exit gate satisfied |

---

## 1. Baseline (verified before Phase 0)

The audit was performed against the repository at commit `f77dac4` on 2026-11-10.

| Check | Result |
|---|---|
| Git working tree | Clean |
| Server tests | 78 passed / 3 suites |
| Client production build | Passed; 1,598.00 kB JS (444.71 kB gzip) |
| Client lint | Failed: `TypeError: Cannot read properties of undefined (reading 'recommended')` |
| Server route files | 16 |
| Mongoose models | 8 |
| Client pages | 24 |
| Client components | 24 |
| Approximate source size | ~19,300 lines across 114 JS/JSX files |

These numbers are the comparison point for v1.0. The target is not a specific line count; it is a smaller surface with stronger guarantees.

### Current defects this roadmap must resolve

- `payment/create-order` trusts a client-supplied `amount` and `userId`.
- `payment/verify-payment` verifies the HMAC but does not verify the amount, currency, or provider state against the quote.
- Order creation is non-transactional and uses the current cart after payment creation.
- Cart reservation has no expiry; abandoned carts strand stock.
- `payment/clear-cart` bypasses the atomic `adjustReserved()` helper.
- Orders do not snapshot the shipping address or pricing breakdown.
- Rewards routes lack ownership checks and allow arbitrary point minting.
- Admin authorization relies on environment UIDs and a hardcoded frontend fallback.
- Development token bypasses exist in client and server.
- `demo-success` creates paid orders without a real payment.
- Product ratings, testimonials, GitHub fallback stats, and mocked distances are presented as real.
- README claims capabilities (for example PWA) that are not implemented.
- Client lint crashes; CI does not run lint or client tests.
- Money-path tests cover Zod and cart reservation, but not payment, order, or expiry invariants.

---

## 2. Architectural decisions requiring approval

These are the decisions that shape every phase. Each records the choice, the reason, the alternatives considered, and the trade-off accepted.

### ADR-01 — Position FitMart as a commerce reference, not a live store

**Decision:** FitMart is a correctness-first open-source MERN commerce reference. The storefront demonstrates a real workflow; it does not claim real customers, revenue, or production operation.

**Why:** The repository cannot compete as a general fitness marketplace and does not need to. A narrow, defensible thesis prevents feature sprawl and makes every engineering decision legible.

**Alternatives considered:** a real retail store, a fitness membership platform, a kitchen-sink learning project.

**Trade-off accepted:** Some commercially useful features (reviews, promotions, returns, tax, shipping integrations) are excluded. The project is optimized for engineering evaluation and learning, not for shopper acquisition.

---

### ADR-02 — Carts express intent; checkout quotes own inventory reservations

**Decision:** Adding to a cart does not reserve stock. A short-lived `CheckoutQuote` reserves stock only when the customer starts checkout.

**Why:** Reserving on every cart add creates an unbounded inventory leak. A reservation is valuable only when the customer is actively trying to pay, and it should have an expiry. This reduces write load, removes abandoned-cart stock stranding, and concentrates concurrency in one place.

**Alternatives considered:**

1. Reserve on cart add with a cart TTL and sweeper.
2. Do not reserve at all; validate and decrement stock only after payment.
3. Reserve at checkout (chosen).

**Trade-off accepted:** A product can sell out while it sits in someone's cart. The UI must make that explicit. Quote creation can fail with `INSUFFICIENT_STOCK`, and the customer must refresh the cart. This is a better failure than silently holding stock forever.

---

### ADR-03 — Pricing is server-authoritative and stored in integer paise

**Decision:** Every price, subtotal, and total is an integer in paise. A persisted `CheckoutQuote` is the single source of truth for the amount sent to the payment provider. The client sends a quote ID, never an amount.

**Why:** Client-computed totals are tamperable. Floating-point money produces rounding drift. A quote fixes the commercial terms, gives the payment and order services one input, and makes amount reconciliation unambiguous.

**Alternatives considered:** client totals, recalculation inside the payment route, decimal strings, a separate pricing service.

**Trade-off accepted:** Introducing a quote adds a state machine and expiry handling. There is no promotion engine in v1.0; the quote contains subtotal, zero shipping, and total. Adding discounts later requires a new ADR and new concurrency tests.

---

### ADR-04 — Use MongoDB transactions and require a replica set

**Decision:** Quote reservation, order commit, stock decrement, payment-state transition, and audit writes that must agree use a MongoDB transaction. Local development, Docker, and tests run MongoDB as a replica set.

**Why:** The alternative is a best-effort sequence that leaves stock, payments, and orders inconsistent when a process crashes between writes. The business invariant "a paid order consumes exactly the reserved stock and exists exactly once" spans multiple documents.

**Alternatives considered:**

1. Multiple independent writes with compensating cleanup.
2. Embedding all inventory state in one document (not viable for many carts/quotes).
3. A relational database with stronger constraints.
4. MongoDB transactions (chosen).

**Trade-off accepted:** MongoDB standalone does not support transactions. The repository must document and package a replica set. Transactions add latency and require retry handling for transient errors. This is the correct cost for the invariant.

---

### ADR-05 — Payment state is provider-authoritative; client verification is a fast path

**Decision:** A `PaymentAttempt` records the provider order and payment state. The Razorpay webhook is the reliable source of truth. The client `verify-payment` call uses the same idempotent capture handler for immediate feedback. Both verify the signature, amount, currency, and provider state.

**Why:** A browser tab can close after payment. A webhook can arrive before or after the client callback. A client-only callback is not a payment system. One capture handler means one set of invariants, regardless of which path arrives first.

**Alternatives considered:** client callback only, webhook only, polling the provider, trusting the checkout modal.

**Trade-off accepted:** The server needs a raw-body webhook route, event deduplication, a provider adapter, and refund compensation. That is materially more code than a demo, but it is the point of the project.

---

### ADR-06 — Admin authorization uses a Firebase custom claim

**Decision:** Admin capability is a server-verified Firebase custom claim (`admin: true`). A documented bootstrap script grants the claim. The frontend reads the claim only for navigation convenience; every admin API enforces it on the server.

**Why:** Environment UIDs and hardcoded frontend constants are brittle and unsafe. Custom claims travel with the ID token, avoid a database lookup on every admin request, and work across instances.

**Alternatives considered:** a role field in `UserProfile`, an environment allowlist, an external identity provider, full RBAC with permissions.

**Trade-off accepted:** A claim change requires the user to refresh their token. Custom claims are coarse; v1.0 has one admin role, not granular permissions. That is appropriate for this scope.

---

### ADR-07 — Use a service layer, but not a repository layer

**Decision:** Route handlers own HTTP concerns; services own business operations; Mongoose models are used directly inside services. No generic repository abstraction.

**Why:** The current business logic is trapped in route handlers. A service boundary makes the money path testable and keeps HTTP details out of domain logic. A repository layer would add indirection without a real requirement to swap databases.

**Alternatives considered:** keep logic in routes, full clean architecture with repositories, microservices.

**Trade-off accepted:** Services depend on Mongoose. A database swap would require refactoring. That is acceptable for a MERN reference and avoids premature abstraction.

---

### ADR-08 — One API contract with stable error codes and idempotency

**Decision:** Successful responses return the resource or `{ data, meta }` for lists. Errors return `{ error: { code, message, details? }, requestId }`. State-changing operations that can be retried define idempotency semantics.

**Why:** Mixed `{error}`, `{success}`, and `{message}` shapes force every client to guess. Stable codes let the frontend distinguish validation, conflict, stock, expiry, authorization, and provider failures. Idempotency prevents duplicate quotes, payments, and orders.

**Alternatives considered:** keep the current mixed shapes, use GraphQL, use tRPC, return HTTP status only.

**Trade-off accepted:** This is a breaking API change before v1.0. Clients and tests must be updated together. The error envelope adds a small amount of response structure.

---

### ADR-09 — Keep JavaScript, validate with Zod, document with JSDoc

**Decision:** Do not rewrite the project in TypeScript for v1.0. Use Zod schemas at every HTTP boundary, JSDoc typedefs for important service contracts, and tests to enforce behavior.

**Why:** Runtime validation is what protects the API. A TypeScript migration would consume the entire roadmap and add little to the money-path guarantees. The codebase is already JavaScript and can be made explicit without a rewrite.

**Alternatives considered:** full TypeScript migration, shared generated client/server types, OpenAPI code generation.

**Trade-off accepted:** Less compile-time safety and more discipline required. If the project later grows, a TypeScript migration can be considered as a v2 decision, not a v1.0 detour.

---

### ADR-10 — Use React Query for server state; do not add Redux

**Decision:** A small authenticated API client plus TanStack Query owns server state. Local UI state stays in component state or context. No Redux, Zustand, or global store.

**Why:** Almost all client state is server state: products, cart, quote, orders, admin data. React Query provides caching, invalidation, retries, and loading/error states without a custom store. The current per-page `fetch` calls duplicate logic and drift.

**Alternatives considered:** Redux Toolkit, Zustand, SWR, continuing with ad hoc `fetch`.

**Trade-off accepted:** Query keys and cache invalidation require discipline. Auth token changes must invalidate or reset queries. The client is not a real-time collaborative app, so a global event store is unnecessary.

---

### ADR-11 — Redis is optional; in-memory cache is the default

**Decision:** The catalog may use a cache abstraction. The default local/reference mode uses an in-memory cache. Redis is an optional adapter for multi-instance deployments. Stock availability, quotes, payments, and orders are never served from cache.

**Why:** A reference repository should run without extra infrastructure. Caching public catalog reads is useful but not correctness-critical. Caching inventory or payment state would create the exact inconsistency the project is trying to teach against.

**Alternatives considered:** require Redis, remove caching entirely, cache everything.

**Trade-off accepted:** In-memory cache is per-process and unsuitable for horizontal scaling. Redis remains optional and must be documented as such. Catalog cache invalidation on admin writes is mandatory.

---

### ADR-12 — Order-confirmation email is best effort, not transactional infrastructure

**Decision:** After a successful order commit, send an env-gated order-confirmation email. Record the attempt on the order. A failure is logged and visible to admin; it does not roll back the order. No queue, worker, or outbox in v1.0.

**Why:** Email is useful but not part of the money invariant. Adding BullMQ or a transactional outbox would add operational surface without protecting inventory, payment, or order correctness.

**Alternatives considered:** transactional outbox with a worker, BullMQ, no email at all.

**Trade-off accepted:** Delivery is not guaranteed. This is explicitly documented. If email becomes a product requirement, it gets its own ADR and infrastructure.

---

### ADR-13 — Archive products instead of deleting them

**Decision:** Products are soft-deactivated with `isActive: false` and `archivedAt`. Order lines retain snapshots and remain readable. Hard delete is not exposed in the admin API.

**Why:** Deleting a product breaks historical references and encourages accidental data loss. Archiving preserves order history while removing the product from the storefront.

**Alternatives considered:** hard delete, cascade delete orders (unacceptable), immutable product versions.

**Trade-off accepted:** Queries must filter `isActive` for storefront reads. Admin views need an "include archived" option. Storage grows, which is irrelevant at this scale.

---

### ADR-14 — Compensate captured-but-unfulfillable payments with an idempotent refund

**Decision:** If a payment is captured but the quote is expired, consumed, or the order transaction cannot commit, record the payment as `paid_unfulfilled`, surface it to admin, and initiate an idempotent provider refund. The payment attempt stores the refund reference.

**Why:** A customer must not be charged for an order that cannot exist. Ignoring this case makes the payment state machine dishonest.

**Alternatives considered:** manual support only, block all payments until stock is guaranteed (not possible with external checkout), ignore the edge case (unacceptable).

**Trade-off accepted:** The payment adapter needs a refund capability, and refunds must be tested. The reference deployment uses test-mode payments, but the logic is structured for production use.

---

### ADR-15 — Deliberately do not add PWA, microservices, Kubernetes, or a queue

**Decision:** v1.0 does not include PWA/offline support, microservices, Kubernetes, event streaming, or a job queue.

**Why:** Each adds operational and conceptual surface without strengthening the transactional spine. The project is a reference, not a platform. The absence is documented rather than hidden behind a badge.

**Alternatives considered:** add them for resume value, add a queue for email/webhooks, deploy with Kubernetes.

**Trade-off accepted:** The project does not demonstrate those technologies. It demonstrates something more valuable: a small system with defended invariants.

---

## 3. Phase overview

| Phase | Outcome | Exit gate |
|---|---|---|
| 0 | Product and scope frozen; baseline recorded | Maintainer approves all three documents |
| 1 | Money path is server-authoritative, atomic, idempotent, and recoverable | Payment/order/inventory invariant suite passes |
| 2 | Second product removed; repository is commerce-only | No removed feature remains in code, deps, routes, or docs |
| 3 | Commerce architecture and admin truth consolidated | Storefront and admin use one contract and one data source |
| 4 | Verification, operations, and security are production-grade | CI, Docker, tests, observability, threat model green |
| 5 | Documentation and release evidence complete | v1.0 criteria met; tag published |
| 6 | Project enters maintenance mode | Support policy and stop conditions active |

---

## 4. Phase 0 — Decision freeze and baseline

**Status:** Proposed  
**Dependencies:** Repository audit complete.

### Phase objective

Freeze the product identity, v1.0 scope, and implementation order before any application code changes.

### What to do

Create and approve `docs/PRODUCT.md`, `docs/SCOPE.md`, and `ROADMAP.md`; record the current baseline; mark the old membership plan as retired; triage open issues and pull requests against the new scope.

### Why it matters

The repository's biggest historical problem is uncontrolled scope. A written, mutually consistent product/scope/roadmap set is the control mechanism. Without it, the next contributor PR reopens the kitchen sink.

### Technical considerations

- The documents must describe the actual repository, not an imagined future product.
- The roadmap must remain implementation-ready: every task has a dependency and acceptance criteria.
- The old plan must not remain an alternative source of truth.
- Issue/PR triage is part of the decision, not cleanup for later.

### Acceptance criteria

- `docs/PRODUCT.md` defines thesis, users, workflows, boundaries, and success criteria.
- `docs/SCOPE.md` defines retain/refactor/remove/non-goals and required engineering capabilities.
- `ROADMAP.md` defines every phase and task with objective, work, rationale, technical considerations, acceptance, and dependencies.
- The three documents agree on terminology, scope, and sequence.
- `docs/NEW_PLAN.md` is marked superseded or archived.
- Baseline commands and results are recorded.
- Open issues and PRs have a disposition.
- No application code, dependency, or feature has been changed.

### Dependencies

- Repository audit (complete).

### Tasks

#### 0.1 — Approve the product definition

- **Objective:** Establish FitMart as a correctness-first commerce reference.
- **What to do:** Review and approve `docs/PRODUCT.md`.
- **Why it matters:** Every later trade-off depends on this identity.
- **Technical considerations:** The product must remain a single-store reference, not a live store or membership platform.
- **Acceptance criteria:** Maintainer approval recorded; no unresolved product-direction questions.
- **Dependencies:** Audit complete.

#### 0.2 — Approve the v1.0 scope

- **Objective:** Freeze what is in and out.
- **What to do:** Review and approve `docs/SCOPE.md`, including retained, refactored, and removed capabilities.
- **Why it matters:** Prevents feature PRs from re-expanding the surface.
- **Technical considerations:** Removed features must include their data models, dependencies, and documentation.
- **Acceptance criteria:** Maintainer approval; removal list accepted; non-goals accepted.
- **Dependencies:** 0.1.

#### 0.3 — Approve the roadmap and retire the old plan

- **Objective:** Make `ROADMAP.md` the only implementation sequence.
- **What to do:** Review and approve this document; add a superseded banner to `docs/NEW_PLAN.md` or move it to an archive folder.
- **Why it matters:** Two competing plans will recreate scope drift.
- **Technical considerations:** No code should be written against `NEW_PLAN.md` after approval.
- **Acceptance criteria:** `NEW_PLAN.md` clearly marked retired; roadmap linked from README and contributing docs.
- **Dependencies:** 0.1, 0.2.

#### 0.4 — Record the baseline and freeze feature merges

- **Objective:** Preserve a reproducible before-state.
- **What to do:** Run and record server tests, client build, client lint, and repository status. Pause feature merges until Phase 1 tasks are ready.
- **Why it matters:** The baseline proves what changed and prevents regressions from being attributed to the rewrite.
- **Technical considerations:** Build artifact size and lint failure are signals, not release gates yet.
- **Acceptance criteria:** Baseline table in this roadmap matches the repository; working tree is clean; maintainers agree on the freeze.
- **Dependencies:** 0.3.

#### 0.5 — Triage issues and pull requests

- **Objective:** Align open work with the new scope.
- **What to do:** Apply the disposition appendix in Section 8; close removed-feature work; redirect valid work to roadmap tasks; identify one canonical PR per cluster.
- **Why it matters:** 91 open issues and 215 open PRs create a false impression of an active, contradictory roadmap.
- **Technical considerations:** Do not merge old PRs blindly. Many touch code that will be deleted or rewritten.
- **Acceptance criteria:** Every open item is retained, redirected, or closed; no duplicate canonical PR remains; labels reflect the new scope.
- **Dependencies:** 0.3.

### Phase exit gate

The maintainer approves all three documents and the issue/PR disposition. No implementation starts before this gate.

---

## 5. Phase 1 — Make the money path trustworthy

**Status:** Proposed  
**Dependencies:** Phase 0 approved.

### Phase objective

Make catalog → cart → quote → payment → order → admin state server-authoritative, atomic where required, idempotent, and recoverable. Remove unsafe shortcuts before building new UI.

### What to do

Replace the existing cart reservation and payment/order flow with a quote-based checkout, a reservation lifecycle, a payment attempt state machine, a shared capture handler, and a transactional order commit. Replace admin auth bypasses with claims.

### Why it matters

This is the project's reason to exist. A beautiful storefront on top of a client-trusted, non-atomic payment path is not a commerce reference.

### Technical considerations

- MongoDB transactions require a replica set. Phase 1 tests may use `MongoMemoryReplSet`; Docker/local setup is completed in Phase 4.
- Keep the existing `adjustReserved()` idea, but scope it to the quote service and preserve the database-level guards.
- Do not expose provider errors directly to clients.
- Do not merge payment work with UI work. The server invariants must be testable independently.
- The existing `demo-success` and dev-token paths are removed, not merely environment-gated.

### Acceptance criteria

- The client cannot set the amount charged.
- A quote reserves inventory atomically and expires.
- Abandoned quotes release stock.
- Concurrent checkouts cannot oversell.
- Signature verification, amount reconciliation, and webhook deduplication are implemented.
- Duplicate capture attempts create exactly one order.
- A paid-but-unfulfillable payment is recorded and refunded idempotently.
- Orders contain immutable line, price, address, and total snapshots.
- Admin access requires a verified custom claim.
- No unsafe auth/payment bypass exists.
- The money-path invariant suite passes.

### Dependencies

- Phase 0.
- Approval of ADR-02 through ADR-06 and ADR-14.

### Tasks

#### 1.1 — Remove auth and payment bypasses; establish admin claims

- **Objective:** Eliminate unsafe access paths and make admin identity trustworthy.
- **What to do:** Add `admin: true` Firebase custom claims and a documented bootstrap script; add `requireAuth` and `requireAdmin` middleware; update the frontend guard to read the claim from the ID token; delete `demo-success`, `devAuth`, `DevAdminLogin`, `/dev-login`, `dev_token`, `DEV_ADMIN_EMAIL`/`DEV_ADMIN_UID` shortcuts, the hardcoded UID fallback, and the allow-all CORS branch.
- **Why it matters:** The current system can be entered through development shortcuts and a public demo payment route. No amount of downstream correctness matters if the front door is open.
- **Technical considerations:** Custom claims require a token refresh after being granted. The frontend guard is a convenience; the server must enforce claims on every admin route. Tests should inject a fake verifier rather than reusing a production bypass. CORS should allow only configured origins plus localhost in development.
- **Acceptance criteria:** No admin UID is present in the client bundle; no dev-token code path exists; `/api/payment/demo-success` is absent or returns 404 in every environment; admin routes return 401/403 without the claim and 200 with it; CORS rejects unknown origins; tests cover all cases.
- **Dependencies:** Phase 0; ADR-06.

#### 1.2 — Introduce the checkout quote and integer money

- **Objective:** Make the server the only author of prices and totals.
- **What to do:** Add `CheckoutQuote` with line snapshots, subtotal, shipping, total, currency, address snapshot, status, expiry, and idempotency key. Convert product prices and order amounts to integer paise (`priceMinor`, `totalMinor`, `lineTotalMinor`). Add a quote service that validates the cart, address ownership, product activity, and stock before persisting. Remove discounts from v1.0.
- **Why it matters:** The current checkout computes totals in the browser and sends `amount` to the server. That is the root cause of amount tampering and quote/order drift.
- **Technical considerations:** Use integer arithmetic only. Freeze line names, unit prices, quantities, and totals at quote time. Store the address as a snapshot on the quote and later on the order. Quote creation should be idempotent by client key so a retry does not create two reservations. Do not add a promotion engine; v1.0 has no discounts.
- **Acceptance criteria:** Quote totals are computed from database products; a client-supplied amount is ignored or rejected; a quote cannot be created for another user's address; expired quotes cannot be paid; money fields are integers; tests cover rounding, tampering, and address ownership.
- **Dependencies:** 1.1; ADR-03.

#### 1.3 — Implement the reservation lifecycle

- **Objective:** Hold stock only for an active checkout and release it reliably.
- **What to do:** Remove `adjustReserved()` calls from cart add/remove. Reserve all quote lines in one transaction using atomic guarded updates (`reserved + qty <= stock`, `reserved >= 0`). Add quote expiry and an idempotent sweeper that releases reservations. Add admin stock adjustments that respect active reservations. Update seed data so `reserved` matches real active quotes (normally zero).
- **Why it matters:** The current cart holds stock forever, and the payment path releases it with non-atomic writes. Both can strand or corrupt inventory.
- **Technical considerations:** `findOneAndUpdate` with `$expr` guards is still the right primitive. Multi-line reservation needs a transaction; otherwise a partial reservation can occur. Do not use MongoDB TTL as the only expiry mechanism; TTL is best-effort and does not run application logic. The sweeper must be safe to run concurrently and repeatedly. Single-instance interval is acceptable for the reference deployment; document the future worker/cron path.
- **Acceptance criteria:** Cart changes never alter `reserved`; quote creation reserves all lines or none; concurrent last-unit checkouts yield exactly one success; expiry releases exactly once; `reserved` never goes negative or exceeds `stock`; sweeper can run twice without double-releasing; tests use a real replica set.
- **Dependencies:** 1.2; ADR-02, ADR-04.

#### 1.4 — Add PaymentAttempt and a payment gateway adapter

- **Objective:** Make provider order creation traceable, idempotent, and testable.
- **What to do:** Add a `PaymentAttempt` model with quote reference, provider order ID, amount/currency, status, provider payment ID, refund reference, and timestamps. Introduce a small gateway adapter (`createOrder`, `fetchPayment`, `refund`) with a Razorpay implementation and a fake implementation for tests. Create provider orders only from an active quote; the client sends a quote ID, not an amount or user ID.
- **Why it matters:** The current `create-order` trusts the client and has no link between the quote, provider order, and eventual local order.
- **Technical considerations:** Enforce one active payment attempt per quote with a unique index or atomic state transition. Provider receipts are limited to 40 characters. Store amounts in paise. Do not log provider secrets or full payloads. Keep the adapter small; it exists for testability and PSP isolation, not as a plugin framework.
- **Acceptance criteria:** Client-supplied amount is ignored; duplicate create-payment calls return the same attempt or a documented conflict; payment attempt records the quote amount and currency; fake gateway tests cover success, failure, and refund; no live provider call in tests.
- **Dependencies:** 1.2, 1.3; ADR-05.

#### 1.5 — Implement verification, webhook capture, and compensation

- **Objective:** Make payment capture reliable regardless of which callback arrives first.
- **What to do:** Add a raw-body webhook route before JSON parsing. Verify the Razorpay signature with constant-time comparison. Add `WebhookEvent` for provider event deduplication. Implement one `capturePayment` service used by both `verify-payment` and the webhook. Fetch the payment from the provider and validate status, amount, currency, and order reference. If the quote cannot be fulfilled, mark the attempt `paid_unfulfilled`, surface it to admin, and call the idempotent refund path.
- **Why it matters:** A browser callback is not reliable, and a valid signature alone does not prove the correct amount or order.
- **Technical considerations:** Do not trust a client-provided payment amount. Handle out-of-order webhook/verify calls by making capture idempotent. Use a unique provider event ID to avoid processing the same event twice. Store only the necessary provider fields. Return a safe error to the client and a detailed internal log. Test signature mismatch, amount mismatch, duplicate events, webhook-first, verify-first, and expired quote.
- **Acceptance criteria:** Invalid signature is rejected; amount/currency mismatch is rejected; duplicate webhook and duplicate verify produce one order; webhook-first and verify-first both succeed; expired quote triggers refund once and records an exception; tests cover all paths.
- **Dependencies:** 1.3, 1.4; ADR-05, ADR-14.

#### 1.6 — Commit orders transactionally with immutable snapshots

- **Objective:** Create exactly one complete order from a captured payment.
- **What to do:** Implement `commitOrder` as a transaction that validates the quote and payment state, creates the order with line/price/address/total snapshots, decrements `stock` and `reserved` for every line, marks the quote consumed, links the payment attempt, assigns a unique order number, and removes only the purchased lines from the cart. Update order status transitions (`paid`, `fulfilled`) and admin-visible fields.
- **Why it matters:** The current flow creates an order, then decrements stock, then clears the cart, with no atomicity and no address snapshot. A crash can leave paid orders without stock, or stock without orders.
- **Technical considerations:** All writes that must agree belong in one transaction. Cart cleanup should remove the quoted quantities, not blindly clear newer items. The order must survive product edits/archive. Use a collision-resistant order number and a unique index. A failed transaction after provider capture must enter the refund path, not return a silent success.
- **Acceptance criteria:** Failure injected at any write rolls back the whole order; duplicate commit returns the same order; stock and reserved reflect the purchase exactly once; order contains address and line snapshots; purchased cart lines are removed; product edits do not change historical orders; admin can see the order.
- **Dependencies:** 1.5; ADR-03, ADR-04, ADR-13.

#### 1.7 — Build the money-path invariant suite

- **Objective:** Prove the business rules, not just the happy path.
- **What to do:** Add integration tests using Supertest, a test app factory, a replica-set MongoDB, and the fake payment gateway. Cover concurrency, expiry, amount tampering, duplicate capture, rollback, authorization, and refund compensation.
- **Why it matters:** These are the tests that make the project interview-worthy. A green suite that only checks 200 responses proves nothing about commerce correctness.
- **Technical considerations:** Use `MongoMemoryReplSet`, not standalone memory server, for transactions. Inject a fake auth verifier in tests. Use fake timers or an injectable clock for expiry. Test the service layer and the HTTP boundary. Do not mock the database for concurrency tests.
- **Acceptance criteria:** The suite includes all invariants listed in `docs/SCOPE.md` Section 6.6; tests fail if the transaction, guard, or idempotency is removed; suite runs deterministically in CI.
- **Dependencies:** 1.6.

#### 1.8 — Add a minimal payment-exception surface

- **Objective:** Make failures visible and recoverable before the admin UI is rebuilt.
- **What to do:** Add admin-only API endpoints to list payment attempts, filter `paid_unfulfilled`/refund failures, and inspect the linked quote/order. Add structured logs for capture, refund, and commit failures. The full admin UI lands in Phase 3.
- **Why it matters:** Automated refund is not enough if no human can see that it happened or failed.
- **Technical considerations:** Return only necessary payment metadata. Do not expose provider secrets or raw payloads. Use the same admin claim middleware. Include request IDs in logs and responses.
- **Acceptance criteria:** An admin can list and inspect payment exceptions; non-admin receives 403; a refund failure is visible; logs correlate the provider payment, quote, and order.
- **Dependencies:** 1.5, 1.6.

### Phase exit gate

The server can complete a test-mode purchase with correct inventory and order state, reject tampering, survive duplicate callbacks, release expired quotes, and compensate an unfulfillable capture. No unsafe bypass remains.

---

## 6. Phase 2 — Remove the second product

**Status:** Proposed  
**Dependencies:** Phase 1 complete.

### Phase objective

Remove the fitness-management, loyalty, growth, support, and mock surfaces so the repository contains only the commerce reference.

### What to do

Delete the workout/calendar/notes/exercise/plans/calculators/chatbot/nearby-centers vertical; remove rewards, marketing, re-engagement email, bug reporting, GitHub stats, Cloudinary/profile upload, PWA claims, fake testimonials/stats, and unverified ratings. Remove their models, routes, pages, components, dependencies, environment variables, tests, navigation, and documentation.

### Why it matters

Every retained-but-unused feature is a maintenance cost, an attack surface, and a false claim. The product must become small before it can become polished.

### Technical considerations

- Remove server registration before deleting files so the app does not fail to boot mid-change.
- Remove client routes and navigation entries in the same change as the pages.
- Remove dependencies only after verifying no retained code imports them.
- Do not preserve dead models "for history"; git history is the archive.
- Update seed data and docs in the same phase.

### Acceptance criteria

- No removed feature has a route, model, page, component, navigation entry, environment variable, dependency, test, or README mention.
- The server boots with only the retained route set.
- The client builds with only the retained routes.
- No fake testimonials, fallback GitHub stats, mock distances, PWA claims, or unverified ratings remain.
- Seed data contains only products, profiles, and legitimate demo records.

### Dependencies

- Phase 1 (the payment/order rewrite should not be entangled with feature deletion).
- `docs/SCOPE.md` removal list.

### Tasks

#### 2.1 — Remove the fitness-management vertical

- **Objective:** Delete the second product.
- **What to do:** Remove workout tracker/calendar/notes, exercise library/ExerciseDB proxy, static plans, BMI/calorie calculators, chatbot, and nearby fitness centers from server, client, tests, seed, env, and docs.
- **Why it matters:** These features have no role in the commerce spine and carry external APIs, secrets, and unvalidated claims.
- **Technical considerations:** Remove route registration first. Delete FullCalendar, RapidAPI, Gemini, and related dependencies only after imports are gone. Remove `WorkoutLog`, `Bug`-adjacent code only where applicable to this task. Update `App.jsx`, navigation, and landing-page copy.
- **Acceptance criteria:** `/api/workouts`, `/api/exercises`, `/api/chat`, `/api/fitness-centers` are absent; `/tracker`, `/notes`, `/exercises`, and `/plans/*` are absent; no Gemini/RapidAPI/FullCalendar code or dependency remains; no related environment variables remain.
- **Dependencies:** Phase 1.

#### 2.2 — Remove loyalty, marketing, and engagement surfaces

- **Objective:** Remove growth features that are not part of the reference.
- **What to do:** Delete Rewards model/routes/config/UI, welcome discount and banner, admin marketing, inactivity email service, admin reminder action, and first-purchase-only email behavior.
- **Why it matters:** Rewards currently allow arbitrary point minting and lack ownership checks. The welcome discount creates a race the new quote model deliberately avoids. Marketing content is static and unverifiable.
- **Technical considerations:** Keep a plain order-confirmation email. Remove `discountUsed`, `discountPercent`, `lastReminderEmailSentAt`, and related UI. If the confirmation email is retained, rename the service and update its trigger.
- **Acceptance criteria:** No rewards endpoints/model/UI; no discount state or banner; no marketing admin page; no re-engagement job; order confirmation is triggered by a paid order, not first purchase.
- **Dependencies:** 2.1, Phase 1.

#### 2.3 — Remove bug reporting, GitHub stats, and media uploads

- **Objective:** Remove support and vanity surfaces plus their upload attack surface.
- **What to do:** Delete `Bug`, `/api/bugs`, admin bug tracker, `ReportBugButton`, screenshot upload, GitHub stats route/hook/widgets/fallback constants, profile-photo upload, and Cloudinary integration.
- **Why it matters:** These are unrelated to commerce, expose unauthenticated writes/uploads, and create false activity signals.
- **Technical considerations:** Remove multer/streamifier/cloudinary only after all imports are gone. Remove Cloudinary env vars, docs, and Docker references. Keep legal pages but correct their data-practice statements.
- **Acceptance criteria:** No bug model/routes/pages; no GitHub stats API or fallback numbers; no upload endpoint; no Cloudinary/multer dependency; client bundle contains no admin bug or GitHub stats UI.
- **Dependencies:** 2.1, 2.2.

#### 2.4 — Remove misleading storefront and admin surfaces

- **Objective:** Remove claims and UI that cannot be backed by data.
- **What to do:** Delete static testimonials, invented customer names, unverified rating/review fields and star UI, PWA claims, dead plan cards/buttons, placeholder CTAs, and any "coming soon" or broken navigation. Correct SEO/meta copy to describe the reference.
- **Why it matters:** The repository is judged on honesty as much as code. Fake social proof undermines the entire positioning.
- **Technical considerations:** Product cards may keep badge/category/image. Remove rating/reviews from the schema, seed, API projection, and tests. Do not replace fake testimonials with different fake testimonials.
- **Acceptance criteria:** No testimonial section, fake stats, star ratings, PWA claim, or dead button; every visible link leads to a working route; meta description matches the actual product.
- **Dependencies:** 2.1–2.3.

#### 2.5 — Prune dependencies, environment, scripts, and tests

- **Objective:** Make the dependency and configuration surface match the retained product.
- **What to do:** Remove unused packages, scripts, env vars, CI placeholders, seed helpers, and tests for deleted features. Update `package.json` files and lockfiles. Keep only required services: MongoDB, Firebase, Razorpay, optional SMTP, optional Redis.
- **Why it matters:** Unused dependencies are vulnerability surface and confuse contributors about what the project actually needs.
- **Technical considerations:** Use `npm ls`/import searches before removal. Do not add replacements. Keep Node version pinned in Phase 4. Update Docker build args and CI env to the retained set.
- **Acceptance criteria:** `npm ci` succeeds in both packages; no removed-feature dependency remains; no unused environment variable is documented; all remaining tests pass.
- **Dependencies:** 2.1–2.4.

#### 2.6 — Reset seed data and verify the reduced app

- **Objective:** Prove the commerce-only app runs end to end.
- **What to do:** Replace the seed with deterministic fitness-gear products, correct stock/reserved values, and no fake orders. Start the server and client, browse, add to cart, create a quote, complete a test-mode purchase, view the order, and inspect it as admin.
- **Why it matters:** A removal phase that leaves the app unable to boot or seed is not complete.
- **Technical considerations:** Seed script must be idempotent or documented as destructive. Do not seed fake paid orders unless clearly labeled as test data. Ensure `reserved` is zero unless matching active quotes.
- **Acceptance criteria:** Clean database + `npm run seed` produces a usable catalog; the full purchase flow succeeds; no removed route is reachable; no fake data appears.
- **Dependencies:** 2.5, Phase 1.

### Phase exit gate

The repository is a commerce-only application. Every remaining feature maps to `docs/SCOPE.md`; every removed feature is gone from code, configuration, and documentation.

---

## 7. Phase 3 — Consolidate commerce architecture and admin truth

**Status:** Proposed  
**Dependencies:** Phase 2 complete.

### Phase objective

Turn the reduced application into a coherent commerce codebase: clear backend boundaries, one API contract, a hardened data model, a single frontend data layer, and an admin surface that reflects the same truth as the storefront.

### What to do

Split the Express app from the listener, validate configuration, extract services, standardize errors and authorization, harden models/indexes, rebuild the frontend data layer, and implement the storefront/admin workflows against the new contract.

### Why it matters

Phase 1 fixes the invariants; Phase 3 makes them understandable and maintainable. Without this, the code still works by accident and remains hard to evaluate.

### Technical considerations

- Do not introduce a repository layer or a generic framework.
- Keep domain services focused: quote, reservation, payment, order, inventory, catalog, admin reporting.
- Derive customer identity from the token; never accept an ownership-bearing `userId` from the body.
- Use one error mapping layer; do not leak provider or database errors.
- Frontend route guards are convenience; server enforcement is authoritative.

### Acceptance criteria

- The Express app can be imported without opening a listener.
- Environment configuration is validated once at startup.
- Route handlers are thin; money-path logic lives in services.
- All API errors use the documented envelope and stable codes.
- All protected routes enforce ownership or admin claims.
- The frontend makes no direct ad hoc `fetch` calls in pages.
- The storefront and admin use the same order/payment data.
- Accessibility and responsive behavior pass the defined checks.

### Dependencies

- Phase 2.
- Approval of ADR-07 through ADR-11.

### Tasks

#### 3.1 — Split app/server and validate configuration

- **Objective:** Make the app testable and fail fast on bad configuration.
- **What to do:** Create `app.js` that exports the Express app and `server.js` that connects the database, starts the listener, and handles shutdown. Add `config/env.js` with a Zod schema for required and optional variables. Remove side-effect DB connection and scattered `process.exit` calls from importable modules.
- **Why it matters:** Tests currently import route files that may start services or read unvalidated environment. A clean app factory is the foundation for integration tests and operations.
- **Technical considerations:** Keep optional providers (Razorpay, SMTP, Redis) able to disable cleanly. Required MongoDB and Firebase config must fail fast. Do not log secret values. Use `NODE_ENV=test` to avoid production requirements in unit tests.
- **Acceptance criteria:** Tests can import `app.js` without opening a port or connecting to MongoDB; invalid env produces a clear startup error; `server.js` owns listener and shutdown; no module calls `process.exit` on import.
- **Dependencies:** Phase 2; ADR-09.

#### 3.2 — Define the API contract, services, and error taxonomy

- **Objective:** Give the application one predictable interface.
- **What to do:** Extract catalog, cart, quote, reservation, payment, order, inventory, customer, and report services. Add Zod schemas for params/query/body. Add domain error classes and a single error middleware. Publish the endpoint and error contract in `docs/API.md`. Remove ownership-bearing user IDs from request bodies.
- **Why it matters:** The current routes mix business logic, validation, response shapes, and direct model access. A consistent contract reduces client drift and makes tests meaningful.
- **Technical considerations:** Map domain errors to HTTP status and stable codes (`VALIDATION_FAILED`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INSUFFICIENT_STOCK`, `QUOTE_EXPIRED`, `PAYMENT_VERIFICATION_FAILED`, `RATE_LIMITED`, `INTERNAL`). Keep provider details out of responses. Validate query parameters for catalog pagination/search. Do not add a repository layer.
- **Acceptance criteria:** All routes use the error envelope; no route returns an ad hoc `{message}` error; ownership is derived from `req.user.uid`; services contain the money-path logic; contract tests pass; API doc matches routes.
- **Dependencies:** 3.1; ADR-07, ADR-08, ADR-09.

#### 3.3 — Harden the data model, indexes, and product lifecycle

- **Objective:** Make invalid states hard to represent and historical orders immutable.
- **What to do:** Finalize schemas for `Product`, `UserProfile`, `Cart`, `CheckoutQuote`, `PaymentAttempt`, `Order`, `WebhookEvent`, and `AdminAuditLog`. Add unique/partial indexes, archive fields, order snapshots, order numbers, and quote/payment status indexes. Reset seed data and remove legacy fields.
- **Why it matters:** Correct application logic still needs database-level guards. Unique indexes prevent duplicate payments/orders; archive preserves history; snapshots preserve commercial truth.
- **Technical considerations:** Use unique sparse/partial indexes for nullable provider IDs. Do not use TTL as the only reservation expiry mechanism. Index the query patterns actually used by storefront/admin pages. Keep `productId` stable; archive rather than delete. Document that the pre-v1.0 schema reset is breaking.
- **Acceptance criteria:** Duplicate provider IDs/order numbers cannot be inserted; archived products disappear from storefront but remain in order history; indexes are documented; seed is deterministic; no legacy `price`/`discount`/ratings fields remain where removed.
- **Dependencies:** Phase 1; 3.2; ADR-13.

#### 3.4 — Build the frontend API client, auth context, and query layer

- **Objective:** Remove per-page data fetching and centralize auth/error behavior.
- **What to do:** Create one API client that attaches the Firebase ID token, normalizes errors, and handles 401/403. Create a stable `QueryClient` at module scope. Add auth context with loading/claims. Define query keys and invalidation for cart, quote, orders, products, and admin data. Remove `credentials: "include"`, local dev tokens, and hardcoded admin checks.
- **Why it matters:** Ad hoc `fetch` calls duplicate headers, error handling, and token logic. The current `QueryClient` is recreated inside `App` on every render, and the admin guard trusts local storage.
- **Technical considerations:** React Query for server state only; no Redux. Invalidate cart after mutations, quote after cart changes, orders after payment success, admin lists after admin mutations. Handle token expiry and claim refresh. Keep fetch abort signals for unmounting.
- **Acceptance criteria:** No page component calls `fetch` directly; QueryClient is stable; 401 redirects to auth; 403 shows a permission error; admin navigation uses the claim but server returns 403 if forged; tests cover the client.
- **Dependencies:** 3.2; ADR-10.

#### 3.5 — Rebuild the storefront purchase flow

- **Objective:** Make the customer journey coherent and server-driven.
- **What to do:** Implement catalog, product detail, cart, checkout quote, address selection, Razorpay checkout, payment verification, order detail, order history, and profile. Remove the `/payment` route that depends on navigation state. Fetch order confirmation from the server by order ID. Add quote-expiry, insufficient-stock, payment-failure, and empty-state handling.
- **Why it matters:** The current confirmation page depends on ephemeral router state; refreshing loses the order. The checkout displays a client-computed total. Both must change.
- **Technical considerations:** Display quote totals; never recompute them for payment. Handle provider modal dismissal without creating an order. If verify fails but webhook may still arrive, show a pending state rather than a false failure. Use server-fetched order detail after success. Keep the design system but remove decorative dead paths.
- **Acceptance criteria:** A customer can complete a test-mode purchase; refresh/reopen shows the order; quote expiry is explained and releases stock; no request contains an amount; order history is owner-scoped; keyboard and screen-reader basics pass.
- **Dependencies:** 3.2, 3.3, 3.4.

#### 3.6 — Rebuild the admin console around operational truth

- **Objective:** Give admins a real view of catalog, stock, orders, payments, customers, and reports.
- **What to do:** Implement admin product create/edit/archive, inventory adjustment, order inspection/fulfillment, payment-exception inspection, customer summaries, and sales reports. Add `AdminAuditLog` for stock, catalog, and order-status changes. Use server pagination/filtering.
- **Why it matters:** The current admin includes marketing and bug triage but no order/payment truth. An admin surface that cannot reconcile the money path is decorative.
- **Technical considerations:** Every admin route uses `requireAdmin`. Inventory adjustment must respect `reserved` and run in a transaction with the audit write. Reports use `totalMinor` and paid orders only. Do not invent RFM/cohort metrics. Admin mutations invalidate catalog caches and storefront queries.
- **Acceptance criteria:** Admin can archive a product and see it disappear from the storefront but remain in history; stock adjustment cannot violate reservation invariants; order/payment detail matches the customer's order; reports reconcile with paid orders; audit entries exist; non-admin tests fail.
- **Dependencies:** 3.2, 3.3, 3.4.

#### 3.7 — Make catalog search, pagination, and caching correct

- **Objective:** Provide predictable catalog behavior without stale stock.
- **What to do:** Define pagination/filter/sort validation, remove `?all=true`, add text/category/price indexes, cache only public catalog read models, and invalidate on admin writes. Ensure product detail does not serve stale availability.
- **Why it matters:** Current clients depend on an unbounded `?all=true` endpoint and an unvalidated query surface. Caching stock would undermine quote correctness.
- **Technical considerations:** Cache keys must include all query parameters. Cache invalidation must happen after successful admin mutations. Do not cache quote/reservation/payment/order responses. Return `400` for invalid pagination/sort rather than silently clamping everything.
- **Acceptance criteria:** Invalid queries return `VALIDATION_FAILED`; pagination meta is correct; archived products are excluded; admin edits invalidate catalog cache; stock/quote reads are uncached; tests cover search/filter/sort.
- **Dependencies:** 3.3, 3.6; ADR-11.

#### 3.8 — Accessibility, responsive behavior, and state quality

- **Objective:** Make the retained UI usable, not just present.
- **What to do:** Add keyboard focus management for cart/dialogs, labeled form fields, visible focus states, semantic buttons/links, responsive cart/checkout/admin tables, consistent loading/empty/error states, and reduced-motion handling.
- **Why it matters:** A reference implementation should demonstrate accessible commerce basics. The current cart drawer overlap and focus issues are known defects.
- **Technical considerations:** Use native elements where possible. Do not add a component library. Test the purchase path at mobile widths. Ensure error messages are announced with `role="alert"`. Remove dead buttons rather than adding placeholder handlers.
- **Acceptance criteria:** Keyboard-only purchase path works; dialogs trap and restore focus; forms have labels; no horizontal overflow at supported widths; loading/empty/error states exist for each retained page; no placeholder CTA remains.
- **Dependencies:** 3.5, 3.6.

### Phase exit gate

The storefront and admin are one coherent application. The same order and payment state is visible from both sides, the API contract is documented, and no retained page uses ad hoc fetching or client-authored pricing.

---

## 8. Phase 4 — Verification, operability, and security

**Status:** Proposed  
**Dependencies:** Phase 3 complete.

### Phase objective

Prove the system with tests, make it reproducible and observable, and close security/operational gaps before release.

### What to do

Build the server/client test suites, repair CI, package Docker with a MongoDB replica set, add observability and graceful shutdown, perform a threat-model review, and measure performance.

### Why it matters

A correctness-first reference must make correctness verifiable and repeatable. A new contributor must be able to run the same checks.

### Technical considerations

- Tests must exercise real MongoDB behavior for concurrency and transactions.
- Do not use production auth/payment bypasses in test infrastructure.
- CI must fail, not warn, on lint/test/build failures.
- Docker must support transactions, not just start MongoDB.
- Observability must not log secrets or personal data.

### Acceptance criteria

- CI runs lint, server tests, client tests, build, Docker build, and dependency audit.
- The full test suite is green from a clean install.
- Docker Compose starts a working app with a replica set and seed.
- `/healthz` and `/readyz` behave correctly.
- Request IDs and structured logs are present.
- Graceful shutdown works.
- Threat model and security controls are documented.
- Performance targets are measured and recorded.

### Dependencies

- Phase 3.
- Approval of ADR-04, ADR-11, ADR-12, ADR-15.

### Tasks

#### 4.1 — Complete the server test suite

- **Objective:** Verify business invariants and failure behavior.
- **What to do:** Add unit tests for services/validation and integration tests for every route family. Cover authorization matrices, quote expiry, reservation concurrency, payment idempotency, transaction rollback, refund compensation, admin stock adjustment, archive behavior, and pagination validation. Replace the existing cart-reservation tests with quote-reservation tests.
- **Why it matters:** The 78 existing tests are valuable but do not cover the money path. Green tests must mean the invariants hold.
- **Technical considerations:** Use `MongoMemoryReplSet`. Inject a fake auth verifier and fake payment gateway through the app factory. Use deterministic clocks for expiry. Test HTTP status and error codes. Avoid brittle snapshot tests. Keep test data builders explicit.
- **Acceptance criteria:** Critical services have meaningful branch coverage (target ≥90% for quote/payment/order/reservation); invariant tests fail if guards are removed; tests run in parallel safely or are isolated; no live external calls.
- **Dependencies:** 3.2, 3.3.

#### 4.2 — Complete the client test suite

- **Objective:** Verify critical UI behavior without a browser farm.
- **What to do:** Add Vitest + React Testing Library. Test the API client, auth/claim guard, money formatting, cart mutations, quote expiry/error states, checkout flow with a mocked client, order detail, and admin permission states. Add tests for the accessibility-critical dialogs/forms.
- **Why it matters:** The client owns the user's perception of correctness. A server-only suite misses broken empty states, stale totals, and guard bugs.
- **Technical considerations:** Mock the API at the client boundary, not the component internals. Do not add Playwright in v1.0 unless the maintainer explicitly approves the extra infrastructure; API integration tests cover the server contract. Keep tests focused on behavior.
- **Acceptance criteria:** Client tests run in CI; core purchase states are covered; guard tests prove non-admin cannot render admin routes; no test depends on a live Firebase/Razorpay account.
- **Dependencies:** 3.4, 3.5, 3.6.

#### 4.3 — Repair and enforce CI

- **Objective:** Make quality gates real.
- **What to do:** Fix the broken ESLint config, add server ESLint, run lint/tests/build for both packages, add Docker build validation, add dependency audit, pin Node, and remove `|| true` or silent test bypasses. Run CI on pull requests and `main`.
- **Why it matters:** The workflow is named "build & lint" but does not lint; the lint config crashes. CI currently gives false confidence.
- **Technical considerations:** Use `npm ci` with lockfiles. Do not require real provider secrets. Keep optional integrations disabled in CI. Use a MongoDB service or the in-memory replica set for server tests consistently. Fail on high/critical vulnerabilities; review moderate ones.
- **Acceptance criteria:** A deliberately broken lint or test fails CI; a clean branch passes all jobs; Docker image builds; Node version is pinned; dependency audit runs; no job uses dummy credentials to bypass real validation.
- **Dependencies:** 4.1, 4.2.

#### 4.4 — Make Docker and local setup reproducible

- **Objective:** One command reaches a seeded, transactional application.
- **What to do:** Configure MongoDB as a single-node replica set in Compose, add an init service, add healthchecks, run the API/client as non-root where practical, add a seed path, and remove obsolete services/env. Verify full purchase flow in Docker.
- **Why it matters:** MongoDB transactions require a replica set. A Compose file that starts standalone MongoDB contradicts the application's correctness model.
- **Technical considerations:** Official `mongo` image can run `--replSet`; an init container can call `rs.initiate()`. Do not commit secrets. Use build args only for public Vite values. Use `/readyz` for the API healthcheck. Keep Redis optional behind a profile.
- **Acceptance criteria:** `docker compose up --build` starts a healthy app; `rs.status()` reports a primary; seed works; test-mode purchase succeeds; no secret is baked into an image; client deep links work.
- **Dependencies:** 3.1, 3.3, ADR-04.

#### 4.5 — Add configuration validation, observability, and lifecycle handling

- **Objective:** Make the app operable when something goes wrong.
- **What to do:** Add request IDs, structured JSON logs with redaction, `/healthz` liveness, `/readyz` database readiness, graceful shutdown, and startup validation. Add error tracking only if it can be optional and does not add a mandatory vendor.
- **Why it matters:** Debugging a payment failure without a request ID or readiness check is guesswork. Logging request bodies can leak tokens and PII.
- **Technical considerations:** Attach `req.id` and return `X-Request-Id`. Include request ID in error responses. Redact authorization, signatures, tokens, and personal data. Do not log full provider payloads. Handle SIGTERM/SIGINT by stopping new connections and closing Mongo. Avoid a full metrics stack in v1.0.
- **Acceptance criteria:** Request ID is present in logs and errors; `/readyz` fails when DB is down; shutdown drains cleanly; no secret/PII appears in logs; structured logs are parseable.
- **Dependencies:** 3.1, 3.2.

#### 4.6 — Perform the security and threat-model review

- **Objective:** Close the attack surface and document the trust boundaries.
- **What to do:** Write a threat model covering payment forgery/replay, amount tampering, IDOR, admin escalation, stock manipulation, webhook abuse, dependency risk, and data exposure. Verify CORS, Helmet/CSP, rate limits, input size, auth claims, secret handling, and dependency audit. Remove any remaining dev/debug endpoints.
- **Why it matters:** Correctness without security is not production-grade. The current repository has a history of auth bypasses and unauthenticated writes.
- **Technical considerations:** CSP must allow the Razorpay checkout script and the app's actual assets; test it in the browser. Use constant-time signature comparison. Do not add a WAF or external vendor. Document accepted risks explicitly.
- **Acceptance criteria:** Threat model reviewed; no high/critical dependency vulnerability; CSP works with checkout; rate limits tested; no debug endpoint in production build; security limitations documented.
- **Dependencies:** 4.3, 4.4, 4.5.

#### 4.7 — Measure and improve performance

- **Objective:** Keep the retained app fast without premature optimization.
- **What to do:** Measure catalog/quote/order API latency on seeded data, add/verify indexes with `explain`, split client routes (especially admin), lazy-load non-critical pages, and document bundle budgets. Keep caching limited to public catalog reads.
- **Why it matters:** The current client ships a single 1.6 MB JS bundle including removed features. Indexes can be wrong even when queries work.
- **Technical considerations:** Use a repeatable local benchmark, not an invented production SLA. Do not cache stock/payment state. Route-level lazy loading is enough; do not add a state library or SSR. Measure after removals, not before.
- **Acceptance criteria:** Catalog query uses intended indexes; no full collection scan for storefront list; initial JS bundle is materially smaller than baseline; admin is code-split; benchmark command and results are documented.
- **Dependencies:** 3.7, 4.4.

#### 4.8 — Document and test recovery operations

- **Objective:** Make failure recovery explicit.
- **What to do:** Document and test quote-expiry sweeping, payment reconciliation, refund compensation, and stuck-reservation recovery. Provide admin procedures for `paid_unfulfilled`, refund failure, and stock discrepancies.
- **Why it matters:** The system will encounter failures; an operator must know what to do without editing the database blindly.
- **Technical considerations:** Prefer idempotent service functions over ad hoc scripts. Any repair script must be dry-run capable and log its actions. Do not add a general-purpose admin SQL/DB console.
- **Acceptance criteria:** Runbook exists; sweeper/refund paths are tested; dry-run repair tool exists for stuck reservations; no documented procedure requires direct production DB edits without a backup.
- **Dependencies:** 1.3, 1.5, 1.6, 4.5.

### Phase exit gate

CI is trustworthy, Docker reproduces the transactional environment, the app is observable, the threat model is reviewed, and recovery procedures are documented and tested.

---

## 9. Phase 5 — Documentation, release evidence, and v1.0

**Status:** Proposed  
**Dependencies:** Phase 4 complete.

### Phase objective

Make the repository understandable and publish v1.0 with evidence that the release criteria are met.

### What to do

Rewrite the README truthfully, publish architecture/data/API/operations/security docs and ADRs, run a release-candidate verification, fix release blockers, and tag v1.0.0.

### Why it matters

The project's value is partly communicative. An excellent implementation with an overstated README is still untrustworthy. Release evidence prevents a "looks done" tag.

### Technical considerations

- Every claim in README must map to a route, page, test, or documented limitation.
- ADRs must include alternatives and trade-offs, not just decisions.
- Release notes must list known limitations.
- Do not tag until the verification matrix is complete.

### Acceptance criteria

- README, architecture, data model, API, operations, security, and contribution docs agree with the code.
- The v1.0 release checklist is complete.
- A clean clone can reproduce the documented flow.
- The tag and release notes exist.
- Known limitations are explicit.

### Dependencies

- Phase 4.
- All v1.0 release criteria in Section 11.

### Tasks

#### 5.1 — Rewrite the README truthfully

- **Objective:** Describe what exists, not what would be impressive.
- **What to do:** Replace the 1,100+ line feature catalogue with a concise document: thesis, architecture diagram, retained workflows, quickstart, test-mode payment instructions, admin setup, invariants protected by tests, limitations, and links to docs.
- **Why it matters:** The current README claims PWA support, rewards redemption, workout features, and other behavior that is incomplete or inaccurate. That is the largest trust defect in the repository.
- **Technical considerations:** Include the MongoDB replica-set requirement. Do not claim production readiness or real customers. Keep screenshots current or omit them. Link to `ROADMAP.md`, `PRODUCT.md`, and `SCOPE.md`.
- **Acceptance criteria:** Every feature claim is verifiable; setup works from a clean clone; limitations are explicit; no dead links; no removed feature appears.
- **Dependencies:** Phase 4.

#### 5.2 — Publish architecture, data, API, and ADR documentation

- **Objective:** Make the system teachable.
- **What to do:** Write `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/API.md`, `docs/OPERATIONS.md`, and numbered ADRs. Document the quote/reservation/payment/order state machines and the transaction boundaries.
- **Why it matters:** The repository's thesis is architectural understanding. Diagrams and explicit invariants are part of the deliverable.
- **Technical considerations:** Keep docs versioned with code. Do not generate a second source of truth that will drift; API docs should be checked against contract tests. Include sequence diagrams for verify-first/webhook-first and expiry/refund.
- **Acceptance criteria:** Docs match code; state diagrams are accurate; every ADR records alternatives/trade-offs; a new contributor can trace the money path.
- **Dependencies:** 5.1.

#### 5.3 — Publish security, operations, and contribution documentation

- **Objective:** Set expectations for running and changing the project.
- **What to do:** Update `SECURITY.md`, `docs/CONTRIBUTING.md`, issue/PR templates, code of conduct references, and the operations runbook. Replace the old first-purchase-email and local-dev-admin docs.
- **Why it matters:** Contributors need to know that features outside scope will be declined and how to report security issues safely.
- **Technical considerations:** Do not publish real credentials or personal contact details that are not intended. Document the admin claim bootstrap and test-mode payment setup. Keep the support policy aligned with maintenance mode.
- **Acceptance criteria:** Security reporting works; contributor guide states scope and money-path test requirements; admin/test-payment setup is reproducible; no obsolete setup doc remains.
- **Dependencies:** 5.1, 5.2.

#### 5.4 — Run the release-candidate verification matrix

- **Objective:** Prove v1.0 before tagging.
- **What to do:** Execute the full checklist in Section 11 on a clean clone and on Docker. Record results, known limitations, and any accepted risks.
- **Why it matters:** A release tag is a claim. The verification matrix is the evidence.
- **Technical considerations:** Use a fresh database and deterministic seed. Test success, duplicate callbacks, expiry, amount mismatch, unauthorized access, admin claim failure, and refund compensation. Test in the provider's test mode. Do not use production money.
- **Acceptance criteria:** All release criteria pass or have an approved, documented exception; no critical/high open defect; evidence recorded in the release notes.
- **Dependencies:** 5.1–5.3.

#### 5.5 — Publish v1.0.0

- **Objective:** Create a stable, referenceable release.
- **What to do:** Update versions, write release notes, tag `v1.0.0`, publish the release, and link the verification evidence.
- **Why it matters:** A tag gives the project a stable baseline for maintenance and for evaluators.
- **Technical considerations:** Do not tag from an unverified branch. Include the commit SHA, test results, and known limitations. Do not claim production readiness.
- **Acceptance criteria:** Tag exists; release notes match the verified scope; repository is clean; README points to the release; no post-tag code changes are required for the documented flow.
- **Dependencies:** 5.4.

### Phase exit gate

v1.0.0 is published with complete documentation and release evidence. Any remaining work is maintenance, not active feature development.

---

## 10. Phase 6 — Maintenance mode

**Status:** Proposed  
**Dependencies:** v1.0.0 published and stable.

### Phase objective

Stop active development while keeping the project secure, reproducible, and honest.

### What to do

Define maintenance policy, support boundaries, dependency/security cadence, issue/PR triage, and the conditions under which active development could restart.

### Why it matters

Without an explicit stop condition, the project will drift back into feature accumulation. Maintenance mode is a product decision, not an admission of failure.

### Technical considerations

- Maintenance is not abandonment: security and correctness fixes continue.
- Feature requests are closed with a link to the scope.
- Dependency updates are batched and tested, not merged blindly.
- The release tag remains the stable reference.
- If a critical provider API changes, a maintenance release is allowed.

### Acceptance criteria

- `MAINTENANCE.md` or an equivalent section defines supported versions, response times, and accepted change types.
- Dependency/security review cadence is documented.
- Issue/PR templates ask for scope alignment.
- A stop condition and restart triggers are explicit.
- Branch protection and release tagging policy are documented.

### Dependencies

- Phase 5.

### Tasks

#### 6.1 — Publish the maintenance policy

- **Objective:** Set expectations for users and contributors.
- **What to do:** Document supported version, security-fix process, dependency cadence, documentation fixes, and the fact that feature requests are out of scope.
- **Why it matters:** Prevents the repository from looking abandoned while also preventing uncontrolled expansion.
- **Technical considerations:** Align with `SECURITY.md`; do not promise SLAs that cannot be met. State that v1.0 is the supported line.
- **Acceptance criteria:** Policy is published and linked from README; issue/PR templates reference it.
- **Dependencies:** 5.5.

#### 6.2 — Establish dependency and security maintenance

- **Objective:** Keep the reference safe without reopening feature work.
- **What to do:** Schedule monthly dependency review, run audit/CI on maintenance branches, document the upgrade path, and define emergency patch handling for critical CVEs or provider breakage.
- **Why it matters:** Dependencies age. A reference repository that cannot be installed safely loses its value.
- **Technical considerations:** Batch minor/patch updates, test them, and keep the lockfile in sync. Major upgrades require a maintenance release and release notes. Do not auto-merge.
- **Acceptance criteria:** Cadence documented; a maintenance branch workflow exists; CI runs on it; emergency patch criteria are explicit.
- **Dependencies:** 6.1.

#### 6.3 — Close the loop on issues and pull requests

- **Objective:** Make the open-work state match maintenance mode.
- **What to do:** Close removed-feature and out-of-scope items, keep only security/correctness/documentation issues, mark stale PRs, and document the canonical path for a future v1.1 proposal.
- **Why it matters:** 91 issues and 215 PRs create an illusion of active development and obscure the few items that matter.
- **Technical considerations:** Use labels such as `scope:v1.0`, `maintenance`, `security`, `documentation`, `out-of-scope`. Do not delete issues; close with a reason.
- **Acceptance criteria:** Open backlog contains only maintenance-relevant work; every closed item has a reason; no duplicate canonical PR remains.
- **Dependencies:** 6.1.

#### 6.4 — Define the stop condition and restart triggers

- **Objective:** Decide when active development ends and when it may resume.
- **What to do:** Record the conditions for stopping (v1.0 criteria met, no release-blocking defect) and the triggers for a maintenance release or a v1.1 scope review (critical CVE, provider API break, data-loss bug, approved new product thesis).
- **Why it matters:** Prevents "just one more feature" from restarting the kitchen sink.
- **Technical considerations:** A v1.1 requires a new product/scope review, not a single PR. Maintenance releases are limited to security, correctness, compatibility, and documentation.
- **Acceptance criteria:** Conditions documented; maintainer agrees; the default answer to feature requests is "out of scope for the v1.0 reference."
- **Dependencies:** 6.1–6.3.

#### 6.5 — Final repository state check

- **Objective:** Leave the repository in a coherent, evaluable state.
- **What to do:** Verify README, docs, tags, branch protection, CI, dependency state, open issues/PRs, and the release artifact. Archive or disable noisy automation that no longer serves the project.
- **Why it matters:** The final impression is the repository's front page and open work, not only the code.
- **Technical considerations:** Disable or simplify workflows that auto-comment on every PR close if they add noise. Keep security/CI workflows. Do not delete historical issues without reason.
- **Acceptance criteria:** Repository is clean; CI is green on `main`; open work is maintenance-only; release is discoverable; no stale workflow spams contributors.
- **Dependencies:** 6.1–6.4.

### Phase exit gate

FitMart is in maintenance mode. Active feature development has stopped. Security, correctness, compatibility, and documentation fixes continue under the published policy.

---

## 11. v1.0 release criteria

v1.0.0 may be tagged only when every item below is true or has an explicitly approved, documented exception.

### 11.1 Product and scope

- [ ] The application contains only the capabilities in `docs/SCOPE.md`.
- [ ] No removed feature has a route, model, page, component, navigation entry, environment variable, dependency, test, or documentation reference.
- [ ] The README describes only implemented behavior.
- [ ] No fake testimonials, fallback statistics, mock distances, unverified ratings, or PWA claims remain.
- [ ] Every visible link and button works or is removed.

### 11.2 Money path

- [ ] Client requests never contain the amount charged.
- [ ] All money is integer paise.
- [ ] A quote is server-priced and expires.
- [ ] A quote reserves all lines atomically or none.
- [ ] Concurrent checkouts cannot oversell the last unit.
- [ ] Expired quotes release stock exactly once.
- [ ] Payment signature verification uses the raw body and constant-time comparison.
- [ ] Captured amount and currency are reconciled with the quote.
- [ ] Duplicate verification/webhook deliveries produce exactly one order.
- [ ] Order commit is transactional and rolls back fully on failure.
- [ ] Order snapshots include lines, unit prices, quantity, address, and total.
- [ ] A paid-but-unfulfillable payment is visible and refunded idempotently.
- [ ] No `demo-success`, fake payment, or dev-token path exists.

### 11.3 Authorization and security

- [ ] Customers can access only their own cart, quotes, orders, and profile.
- [ ] Admin routes require a server-verified admin claim.
- [ ] No hardcoded admin UID or environment-UID fallback exists.
- [ ] CORS is an explicit allowlist.
- [ ] Helmet/CSP is configured and tested with the payment provider.
- [ ] Rate limits cover auth-adjacent, payment, and write endpoints.
- [ ] Inputs are validated at the HTTP boundary.
- [ ] No secret or PII is logged.
- [ ] No high/critical dependency vulnerability is open.
- [ ] The threat model and known limitations are documented.

### 11.4 Testing and CI

- [ ] Server tests cover all invariants in `docs/SCOPE.md` Section 6.6.
- [ ] Client tests cover critical purchase and permission states.
- [ ] Lint, tests, production build, Docker build, and dependency audit run in CI.
- [ ] A failing check blocks merge.
- [ ] Tests pass from a clean install.
- [ ] Critical service coverage target is met; coverage is not gamed globally.

### 11.5 Operations and reproducibility

- [ ] `docker compose up --build` produces a healthy, seeded app with a MongoDB replica set.
- [ ] A clean clone can run the documented local setup.
- [ ] `/healthz` and `/readyz` behave correctly.
- [ ] Request IDs appear in logs and error responses.
- [ ] Logs are structured and redacted.
- [ ] Graceful shutdown works.
- [ ] The reservation sweeper, refund compensation, and stuck-reservation repair are documented and tested.
- [ ] Environment configuration is validated at startup.

### 11.6 Documentation

- [ ] `docs/PRODUCT.md` is current.
- [ ] `docs/SCOPE.md` is current.
- [ ] `ROADMAP.md` is current and marked released.
- [ ] `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/API.md`, and `docs/OPERATIONS.md` exist and match the code.
- [ ] ADRs record alternatives and trade-offs.
- [ ] `SECURITY.md` and `docs/CONTRIBUTING.md` reflect maintenance mode.
- [ ] Release notes list known limitations.

### 11.7 Release

- [ ] Release-candidate verification was run on a clean clone and Docker.
- [ ] No critical/high open defect remains.
- [ ] `v1.0.0` is tagged from the verified commit.
- [ ] Release notes are published.
- [ ] The README points to the release and the limitations.

---

## 12. Conditions for entering maintenance mode

Active development stops when:

1. `v1.0.0` is published and the release criteria above are satisfied.
2. No release-blocking correctness, security, or data-integrity defect is open.
3. The open backlog contains only maintenance-relevant work.
4. The maintenance policy, dependency cadence, and issue/PR scope rules are published.
5. The maintainer explicitly declares maintenance mode.

In maintenance mode, the following changes remain allowed:

- security fixes;
- correctness and data-integrity fixes;
- compatibility fixes for Firebase, Razorpay, MongoDB, Node, or browser APIs;
- dependency upgrades that keep the reference installable;
- documentation corrections;
- release notes and maintenance releases.

The following changes require a new product/scope review and are not accepted as routine maintenance:

- new commerce features;
- memberships, subscriptions, coaching, or fitness content;
- a new payment provider or currency;
- multi-vendor support;
- reviews, promotions, loyalty, or recommendations;
- a UI rewrite or framework migration;
- a TypeScript rewrite;
- microservices, a queue, or Kubernetes.

A v1.1 restart requires a new `PRODUCT.md` and `SCOPE.md` decision. It cannot begin with a single feature PR.

---

## 13. Appendix A — Issue and PR disposition

This appendix is a triage guide, not an instruction to close items without review. The canonical rule is:

- **Retain:** valid, aligned with v1.0, and mapped to a roadmap task.
- **Redirect:** valid idea, but must be rewritten as a roadmap task or folded into a larger change.
- **Close:** removed feature, duplicate, obsolete, false premise, or superseded by a new design.

No old PR should be merged before its cluster is reviewed against Phase 1–3. Many touch files that will be deleted or rewritten.

### 13.1 Retain or redirect — issues

| Area | Issues | Roadmap destination |
|---|---|---|
| Payment correctness | #741, #738, #259, #547, #298 | Phase 1 |
| Auth/authorization | #289, #241, #650, #685 | Phase 1 |
| Inventory integrity | #351, #354 | Phase 1 |
| API/error contract | #512 | Phase 3 |
| CI and tooling | #630, #877, #742, #673, #677 | Phase 4 |
| Operability | #725, #719, #728, #732, #168, #94, #862 | Phase 1/4 |
| Frontend quality | #698, #361, #446, #736, #735 | Phase 3 |
| Frontend data layer | #274, #236 | Phase 3 |
| Tests | #638, #514 | Phase 4 |
| Docs/process | #750, #684 | Phase 0/5 |
| Catalog/cache | #443, #242, #760, #637, #584 | Phase 3 |
| Setup/reproducibility | #656 | Phase 4 |
| Performance | #696 | Phase 4 |
| Security hygiene | #360, #357 | Phase 4 |

**Notes:**

- #760 (delete non-existent product) is superseded by the archive-product design. Redirect to Phase 3 rather than fixing hard delete.
- #637 (query validation) is superseded by the full Zod query contract. Redirect.
- #584 (debounced search) is retained as a Phase 3 catalog task; the competing PRs are consolidated separately.
- #684 (README advertises PWA) is retained as a documentation correction in Phase 5, not closed. The PWA *feature* PRs are closed.
- #547/#298 are resolved by deleting `demo-success` in Phase 1, not by adding auth to it.
- #257 (welcome discount race) and #352 (bug reporter XSS) are closed because those features are removed; they are not fixed.
- #862 and #894 are small reliability fixes that survive the rewrite; they are rebased after Phase 2, not merged now.

### 13.2 Close — issues

| Cluster | Issues | Reason |
|---|---|---|
| Programs/memberships | #983–#998 (all 16 program/membership issues) | Retired product direction |
| Chat/AI | #884, #838, #645 | Feature removed |
| Rewards/loyalty | #544, #537, #526 | Feature removed |
| Fitness/calculators | #619, #586, #579, #569, #509, #451, #431, #423, #365, #359, #533, #693, #290, #348 | Feature removed (includes FitnessCenter schema work) |
| External API timeouts | #714 | Applies only to removed integrations (Gemini, ExerciseDB, fitness centers) |
| Stale duplicates | #110, #57, #556, #467, #445, #551, #534 | Duplicate, vague, or superseded by the rebuild |
| Process-only | #715 | Not a product task; handled by maintenance governance |
| Welcome discount | #257 | Discount removed |
| Bug reporter | #352 | Feature removed |

**Notes:**

- #467 and #445 are admin UI polish that the Phase 3 admin rebuild replaces; closing them avoids two competing designs.
- #534 (extract data-fetching hooks) is superseded by the React Query data layer in ADR-10.
- #556 (remove redundant try/catch) is superseded by the single error middleware in Phase 3.

### 13.3 Retain or rebuild — PR clusters

| Cluster | Action | PRs |
|---|---|---|
| Payment flow | Review; rebuild to Phase 1 design | #1031 |
| Webhook/abandoned cart | Rebuild into Phase 1 services | #743, #739 |
| Admin authorization | Rebuild as claims; do not merge env-UID patches | #713, #817, #686 |
| Stock constraints | Consolidate one schema/guard change | #720, #814, #813, #956, #1013 |
| Product query validation | Keep one canonical PR | #1049, #1063 |
| Indexes | Retain if it matches final query plan | #958 |
| Security headers/scanning | Retain/adapt | #891, #953, #818 |
| Health/graceful/compression | Consolidate one each | #731, #723/#952, #730/#922 |
| Logging | Replace with Phase 4 logger; do not merge multiple | #737, #767, #770 |
| CI/test gates | Retain | #710, #787 |
| Lockfile/Node pin | Keep one each | #963/#878, #1020/#744 |
| Issue templates | Retain | #752 |
| Env validation | Retain/adapt | #786/#765 |
| API error handling | Retain/adapt | #921 |
| User/customer validation | Retain/adapt | #867 |
| Cart service/race | Rebuild after quote design | #858, #734 |
| Cart auth refresh | Retain if still relevant | #832 |
| Orders pagination | Keep one canonical PR | #796, #805, #816 |
| Low-stock threshold | Keep one | #776, #856 |
| Frontend test setup | Keep one canonical PR; close duplicates | #681, #694, #704, #706, #729, #746, #771, #773, #779, #829, #849, #976, #1009 |
| QueryClient stability | Keep one | #699, #700 |
| Google Fonts cleanup | Keep one | #691, #703, #705, #722, #916, #1045, #1062 |
| Accessibility/focus | Retain | #962 |
| README/setup docs | Replace with Phase 5 rewrite | #718, #772 |
| PWA docs/feature | Close | #689, #690, #692, #707, #795 |
| Chats/AI | Close | #724, #806, #846, #847, #852, #855, #880, #882, #886, #898, #917, #930, #972 |
| Rewards | Close | #701, #702, #708 |
| Programs/memberships | Close | #999, #1001, #1014, #1023, #1025, #1032, #1038, #1043, #1044, #1046, #1048, #1053, #1059 |
| Calculator/notes/plans | Close | #695, #910, #927, #933, #934, #936, #935 |
| PropTypes | Close | #687, #759, #768, #918, #1030, #1036 |
| Cart spacing/drawer duplication | Close after UI rewrite | #740, #745, #747, #748, #785 |
| Lazy images | Keep one or fold into Phase 4 | #697, #717, #913, #924 |
| Delete-product 404 | Close; archive design replaces it | #761, #762, #783 |
| Placeholder buttons | Close; dead UI removed | #688, #812, #948 |
| GitHub star widgets | Close | #890, #909 |
| Pull-to-refresh | Close/defer | #896, #897, #908, #915 |
| Scroll-to-top | Close | #781, #789, #790 |
| SEO/Open Graph | Defer beyond v1.0 | #754, #755, #756, #757, #854 |
| Sentry | Defer/optional | #939 |
| Vague refactors | Close | #803, #893 |
| useFetch abstraction | Close; React Query is the data layer | #804 |
| Conventional commits | Keep one or defer | #866, #864, #978 |
| Email queue | Close; ADR-12 rejects a queue for v1.0 | #975 |
| Navbar/route polish | Retain into Phase 3 UI | #967 |
| Profile address loading | Retain into Phase 3 | #946 |
| A11y labels | Retain into Phase 3 | #945 |
| Payment error messages | Superseded by the Phase 3 error contract | #943 |
| Admin inventory leak | Retain/rebuild in Phase 3 | #932 |
| JSDoc utilities | Retain; matches ADR-09 | #931 |
| Pre-hydration spinners | Close/defer; not a v1.0 concern | #906, #928 |
| Admin KPI skeletons | Close; admin layout is rebuilt | #925, #926 |
| Stars component tests | Close; ratings removed | #912 |
| Alert-to-toast | Keep one canonical PR | #845, #885 |
| Admin bug search | Close; bug tracker removed | #881 |
| Playwright E2E | Defer; not in v1.0 without explicit approval | #876 |
| Seed deprecation fix | Keep one; mirrors issue #862 | #863 |
| External API timeouts | Close; integrations removed | #716, #860 |
| Frontend test setup duplicates | Fold into the canonical test-setup PR above | #828 |
| Zustand workout store | Close; feature removed and no global store | #788 |
| Clear-cart confirmation | Retain into Phase 3 | #778 |
| Cart drawer/product page fixes | Fold into the Phase 3 cart rewrite | #775 |
| Category hover effect | Defer beyond v1.0 | #751 |
| Body-size limit | Keep one; mirrors issue #360 | #749 |
| ExercisePage console logs | Close; page removed | #712, #721 |
| Debounced catalog search | Keep one canonical PR | #711, #683 |
| Chat history fixes | Close; chatbot removed | #709 |
| README fitness-centers row | Close; README is rewritten in Phase 5 | #1050 |
| Noisy automation | Close/disable in Phase 6; not product work | #959 |
| Exercise page loading state | Close; page removed | #944 |
| Dependabot | Keep the latest passing PR per dependency; close superseded duplicates. After Phase 2, close bumps for removed packages (for example #1007 `@fullcalendar/react`). | All `chore(deps...)` PRs, including #1003, #1007, #1008, #1010–#1012, #1017–#1018, #1022, #1024, #1026, #1039, #1042, #1047, #1052, #1054–#1057, #1060–#1061, #1064–#1071 |

### 13.4 Triage rules for the 215 open PRs

1. If the PR implements a removed feature, close with a link to `SCOPE.md`.
2. If it duplicates another open PR, keep the most complete/current one and close the rest.
3. If it touches the payment/order/cart path, close or hold until Phase 1 is implemented, unless it exactly matches the approved design.
4. If it is a dependency bump, keep only the latest passing PR per dependency and verify the lockfile.
5. If it is a UI polish PR for a page that will be rewritten, close and fold the intent into Phase 3.
6. If it is a test/tooling PR that matches Phase 4, keep it as an input but rebase after Phase 2 deletions.
7. Never merge a PR just because it is old or has green CI; CI currently does not cover the real money path.

---

## 14. What "done" means

FitMart is done when a reader can see a small commerce application, trace the money path end to end, find tests for every dangerous edge, run it from a clean clone, and read an honest description of its capabilities and limits.

At that point, the project stops growing and starts being maintained.
