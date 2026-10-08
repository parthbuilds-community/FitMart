# Membership Model

A **Membership** links a user to a [`Program`](PROGRAM_MODEL.md) and tracks their
progress through it. It is the core subscription entity of the "Fitness
Membership OS" — enrol → follow the program → log workouts → renew or lapse.

- **Source:** `server/models/Membership.js` (added by the Phase 1 Membership model work)
- **API:** `server/routes/memberships.js` — see [Memberships API](#memberships-api) below
- **Related docs:** [`PROGRAM_MODEL.md`](PROGRAM_MODEL.md) · [`USAGE_GUIDE.md`](USAGE_GUIDE.md) · [`NEW_PLAN.md`](NEW_PLAN.md)

> **Implementation status.** Enrolment (`POST /api/memberships`, [#994](https://github.com/parthbuilds-community/FitMart/issues/994))
> and listing (`GET /api/memberships`, [#995](https://github.com/parthbuilds-community/FitMart/issues/995))
> are implemented. Cancellation ([#996](https://github.com/parthbuilds-community/FitMart/issues/996)),
> workout-driven progress ([#997](https://github.com/parthbuilds-community/FitMart/issues/997)),
> and the validators/indexes/constraint ([#992](https://github.com/parthbuilds-community/FitMart/issues/992))
> are **Planned** and marked as such below. The model currently ships
> **structure only** (no custom validators or indexes).

---

## Schema

Collection: `memberships`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `userId` | String | ✅ | — | **Firebase UID** of the member, matching `Cart`, `Order` and `UserProfile`. (Not an ObjectId ref — see [note](#why-userid-is-a-string).) |
| `planId` | ObjectId | ✅ | — | ref `Program`. The program the member is enrolled in. |
| `status` | String | ✅ | — | enum: `active` \| `paused` \| `cancelled` \| `expired` \| `trialing`. See [Lifecycle](#status-lifecycle). |
| `renewCount` | Number | — | `0` | How many times the membership has renewed. |
| `priceSnapshot` | `PriceSnapshot` | ✅ | — | Immutable copy of the price at enrolment. See [Price snapshot](#price-snapshot). |
| `currentDayIndex` | Number | — | `0` | Progress pointer into the program's day schedule. |
| `startedAt` | Date | — | — | When the current period started. |
| `enrolledAt` | Date | — | — | When the member first enrolled. |
| `cancelledAt` | Date | — | — | Set when the membership is cancelled (soft delete). |
| `expiresAt` | Date | — | — | `startedAt + (program.lengthDays × 24h)` at enrolment. |
| `createdAt` | Date | auto | — | `timestamps: true`. |
| `updatedAt` | Date | auto | — | `timestamps: true`. |

`_id` and `__v` are standard Mongoose fields; `__v` is always stripped from API
responses.

### `PriceSnapshot`

An embedded sub-document (`{ _id: false }`), copied from the program's
[`price`](PROGRAM_MODEL.md#price) at enrolment time.

| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | Number | ✅ | The price the member agreed to. |
| `currency` | String | ✅ | ISO currency code. |
| `interval` | String | ✅ | Billing label, e.g. `"month"`. |
| `periodDays` | Number | ✅ | Billing period length in days. |

### Why `userId` is a String

The original [#991](https://github.com/parthbuilds-community/FitMart/issues/991)
draft declared `userId` as an ObjectId ref to a `User` model. No `User` model
exists, and every other collection (`Cart`, `Order`, `UserProfile`, `Rewards`,
`WorkoutLog`) keys off the Firebase UID string. A membership therefore stores
`req.user.uid` directly so it can never fail to resolve a user.

---

## Status lifecycle

Five statuses describe where a membership is in its life. The arrows below show
the **intended** transitions; the transition *rules* are enforced by the
membership model work ([#992](https://github.com/parthbuilds-community/FitMart/issues/992)) and
the cancel endpoint ([#996](https://github.com/parthbuilds-community/FitMart/issues/996)).

```
 ┌──────────┐  trial converts  ┌──────────┐   resume   ┌──────────┐
 │ trialing │ ───────────────▶ │  active  │ ◀────────▶ │  paused  │
 └──────────┘                  └────┬─────┘   pause    └──────────┘
                                    │
                       ┌────────────┴────────────┐
                    cancel                     expire
                       │                          │
                       ▼                          ▼
                ┌───────────┐             ┌───────────┐
                │ cancelled │             │  expired  │
                └───────────┘             └───────────┘
                 (terminal)                (terminal)
```

`active` ⇄ `paused` as the member pauses/resumes, `trialing` converts to
`active`, and `active` can end in the **terminal** states `cancelled` (explicit
cancel) or `expired` (the period lapsed).

| From | To | Trigger |
|---|---|---|
| `trialing` | `active` | Trial converts to a paid period. |
| `active` | `paused` | Member pauses their plan. |
| `paused` | `active` | Member resumes. |
| `active` | `cancelled` | `DELETE /api/memberships/:id` sets `cancelledAt`. |
| `active` | `expired` | `expiresAt` passes without renewal. |
| `cancelled` / `expired` | — | **Terminal** — no transition out. |

> **Planned (#992):** transition validation (e.g. "cancelled can't go back to
> active") is not yet enforced. Today only enrolment sets a status, always to
> `active`.

---

## Price snapshot

`priceSnapshot` exists so **historical revenue stays correct**. A program's
price can change at any time; a membership records the amount the member
actually agreed to:

- At enrolment, `POST /api/memberships` reads `program.price` and copies
  `amount`, `currency`, `interval` and `periodDays` into `priceSnapshot`.
- Subsequent edits to `Program.price` never rewrite existing memberships.
- `renewCount` + `priceSnapshot.periodDays` let billing/reporting compute how
  much a member has paid over time.

A program with **no** `price` cannot be enrolled in — the create endpoint
responds `400 "Program has no price configured"`.

---

## Progress tracking

`currentDayIndex` is the member's position in the program's `day` array:

- Starts at `0` on enrolment.
- **Planned ([#997](https://github.com/parthbuilds-community/FitMart/issues/997)):**
  logging a workout for the program increments `currentDayIndex` by 1, capped at
  `program.lengthDays` (completion). The `POST /api/workouts` response will then
  include `{ currentDayIndex, totalDays, progressPercent, programGoal }`.
- `currentDayIndex` is validated to never exceed the program's `lengthDays`
  (**Planned [#992](#indexes--constraints)**).

Progress is capped, not auto-reset — a completed program reports `100%` until it
is renewed or a new membership is created.

---

## Indexes & constraints

> **Planned** — [Membership Model Validation and Database Indexes (#992)](https://github.com/parthbuilds-community/FitMart/issues/992).
> The model currently declares **no** custom indexes or validators.

### Unique active membership

A member may hold only **one active membership per program**. This is enforced in
two layers:

1. **Application guard (implemented).** `POST /api/memberships` performs a
   `findOne({ userId, planId, status: 'active' })` and returns
   `409 "An active membership for this program already exists"` if one is found.
   This is best-effort: two concurrent enrolments can both pass the read.
2. **Database constraint (planned).** A **partial unique index** on
   `{ userId: 1, planId: 1 }` restricted to `status: "active"` makes the rule
   airtight under concurrency.

Historical (`cancelled`, `expired`) memberships are unaffected, so a member can
re-enrol in a program they previously left.

### Planned indexes

| Index | Type | Purpose |
|---|---|---|
| `{ userId: 1, planId: 1 }` where `status: "active"` | **partial unique** | One active membership per user + program. |
| `{ userId: 1, status: 1 }` | compound | "My memberships" filtered by status (the list endpoint's default query). |
| `{ status: 1, expiresAt: 1 }` | compound | Expiry sweeps / renewal jobs. |
| `{ planId: 1, status: 1 }` | compound | Per-program enrolment counts. |
| `{ createdAt: -1 }` | single | Default newest-first listing. |

### Planned validators

Also part of #992: `planId` as a valid ObjectId ref, `renewCount >= 0`,
`priceSnapshot.amount`/`currency` required, `currentDayIndex >= 0`,
date ordering (`enrolledAt` not before `startedAt`; `cancelledAt` not before
`enrolledAt`), and an async check that `currentDayIndex` does not exceed the
program's `lengthDays`.

---

## Memberships API

All membership endpoints require `Authorization: Bearer <firebase_id_token>` and
use the shared [`ok()`/`fail()`](../server/utils/apiResponse.js) contract.

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| `POST` | `/api/memberships` | ✅ user | **Implemented** (#994) |
| `GET` | `/api/memberships` | ✅ user / admin | **Implemented** (#995) |
| `DELETE` | `/api/memberships/:id` | ✅ owner or admin | **Planned** (#996) |

### `POST /api/memberships` — enrol

Body:

| Field | Type | Required | Notes |
|---|---|---|---|
| `planId` | string | ✅ | 24-char hex ObjectId of the program. |
| `userId` | string | — | **Admin-only** escape hatch to enrol someone else. Omit to enrol yourself. |

```json
{ "planId": "664e0a1bb8e4d3f0a1b2c3d0" }
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "membership": {
      "_id": "665f1c2ab8e4d3f0a1b2c3d4",
      "userId": "firebase-uid-abc123",
      "planId": {
        "_id": "664e0a1bb8e4d3f0a1b2c3d0",
        "goal": "Build strength in 6 weeks",
        "difficulty": "intermediate",
        "lengthDays": 42,
        "image": "https://example.com/programs/strength.jpg"
      },
      "status": "active",
      "renewCount": 0,
      "priceSnapshot": { "amount": 49.99, "currency": "USD", "interval": "month", "periodDays": 30 },
      "currentDayIndex": 0,
      "startedAt": "2026-06-01T09:00:00.000Z",
      "enrolledAt": "2026-06-01T09:00:00.000Z",
      "expiresAt": "2026-07-13T09:00:00.000Z",
      "createdAt": "2026-06-01T09:00:00.000Z",
      "updatedAt": "2026-06-01T09:00:00.000Z"
    }
  }
}
```

`planId` is returned **populated** with `goal`, `difficulty`, `lengthDays` and
`image`. `expiresAt` is `startedAt + lengthDays × 24h`.

| Status | Body | When |
|---|---|---|
| `400` | `{ "success": false, "error": "Invalid request", "details": [...] }` | Body fails Zod validation (e.g. malformed `planId`). |
| `400` | `{ "success": false, "error": "Program has no price configured" }` | Program has no `price`. |
| `400` | `{ "success": false, "error": "Program is missing a valid lengthDays" }` | Program lacks a positive numeric `lengthDays`. |
| `403` | `{ "success": false, "error": "Forbidden — you can only enrol your own account" }` | Non-admin tried to pass another `userId`. |
| `404` | `{ "success": false, "error": "Program not found" }` | No program with that `planId`. |
| `409` | `{ "success": false, "error": "An active membership for this program already exists" }` | Duplicate active enrolment. |
| `500` | `{ "success": false, "error": "Failed to create membership" }` | Unexpected server error. |

### `GET /api/memberships` — list

| Query param | Type | Default | Notes |
|---|---|---|---|
| `page` | integer ≥ 1 | `1` | |
| `limit` | integer 1–50 | `10` | Capped at 50. |
| `status` | enum | — | Filter: `active`, `paused`, `cancelled`, `expired`, `trialing`. |
| `sort` | string | `-createdAt` | One of `createdAt`, `status`, `renewCount`, `expiresAt`, optionally prefixed with `-`. |

Regular users see **only their own** memberships; admins see **every**
membership. Each `planId` is populated (`goal`, `difficulty`, `lengthDays`,
`image`).

```json
{
  "success": true,
  "data": {
    "memberships": [
      {
        "_id": "665f1c2ab8e4d3f0a1b2c3d4",
        "userId": "firebase-uid-abc123",
        "planId": {
          "_id": "664e0a1bb8e4d3f0a1b2c3d0",
          "goal": "Build strength in 6 weeks",
          "difficulty": "intermediate",
          "lengthDays": 42,
          "image": "https://example.com/programs/strength.jpg"
        },
        "status": "active",
        "renewCount": 0,
        "priceSnapshot": { "amount": 49.99, "currency": "USD", "interval": "month", "periodDays": 30 },
        "currentDayIndex": 3,
        "startedAt": "2026-06-01T09:00:00.000Z",
        "enrolledAt": "2026-06-01T09:00:00.000Z",
        "expiresAt": "2026-07-13T09:00:00.000Z",
        "createdAt": "2026-06-01T09:00:00.000Z",
        "updatedAt": "2026-06-04T09:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
  }
}
```

A `403`/`401` is returned when the token is missing or invalid; `400` for
invalid query params; `500` on server error.

### `DELETE /api/memberships/:id` — cancel

> **Planned** — [DELETE /api/memberships Cancel Endpoint (#996)](https://github.com/parthbuilds-community/FitMart/issues/996).

Cancellation is a **soft delete**: the document is preserved, `status` becomes
`cancelled` and `cancelledAt` is set to now. The response returns the updated
membership with `planId` populated.

| Status | When |
|---|---|
| `200` | Cancelled successfully. |
| `400` | `:id` is not a valid ObjectId. |
| `403` | Caller is neither the owner nor an admin. |
| `404` | No membership with that `id`. |
| `409` | Membership is already `cancelled` or `expired`. |

---

## See also

- [Program Model](PROGRAM_MODEL.md) — the plan a membership points at.
- [Usage Guide](USAGE_GUIDE.md) — enrolment, workout logging and cancellation walkthroughs.
