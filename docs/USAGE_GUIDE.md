# Usage Guide — Programs & Memberships

A practical, task-oriented walkthrough of the Program + Membership data spine:
enrolling a member, logging workouts against a program, cancelling, and the
admin operations around them.

Companion reference docs:

- [`PROGRAM_MODEL.md`](PROGRAM_MODEL.md) — the program schema and catalogue API.
- [`MEMBERSHIP_MODEL.md`](MEMBERSHIP_MODEL.md) — the membership schema, lifecycle and constraints.
- [`NEW_PLAN.md`](NEW_PLAN.md) — the roadmap these features belong to.

> **Implementation status.** Enrolment and listing are live. The cancel
> endpoint, workout-driven progress and seed data are **Planned** and are marked
> in each section below.

---

## Setup & authentication

All membership endpoints require a Firebase ID token:

```http
Authorization: Bearer <firebase_id_token>
```

The Program catalogue endpoints (`GET /api/programs`, `GET /api/programs/:id`)
are **public** — no token needed.

Base URL in local development: `http://localhost:5000`.

### Development shortcut

When `NODE_ENV !== "production"`, the auth middleware accepts a fake token of
the form `dev:<email>` instead of a real Firebase token:

```bash
curl -H "Authorization: Bearer dev:member@example.com" \
  http://localhost:5000/api/memberships
```

The middleware derives the UID from `DEV_ADMIN_UID`, or
`dev-admin-<sanitised-email>` when that env var is unset. **This shortcut is
disabled in production** — never rely on it outside local development.

> Auth failures from the middleware return a legacy `{ "error": "<message>" }`
> body (`401` for missing/invalid token, `403` for an unverified email), while
> the membership handlers themselves return the standard
> `{ "success": false, "error": "<message>" }` contract.

---

## Program structure

A program is an ordered list of training days. Each day has a `dayNumber`, an
optional `focus`, and at least one prescribed exercise. `lengthDays` **must**
equal the number of entries in `day`.

A minimal valid program document:

```json
{
  "goal": "Build strength in 6 weeks",
  "difficulty": "beginner",
  "lengthDays": 2,
  "day": [
    {
      "dayNumber": 1,
      "focus": "Full body A",
      "exercises": [
        { "exerciseId": "664d1f09b8e4d3f0a1b2c3a1", "sets": 3, "reps": 10, "restSeconds": 60, "notes": "Warm up first" }
      ]
    },
    {
      "dayNumber": 2,
      "focus": "Full body B",
      "exercises": [
        { "exerciseId": "664d1f09b8e4d3f0a1b2c3a2", "sets": 3, "reps": 12, "restSeconds": 45, "notes": "" }
      ]
    }
  ],
  "tags": ["strength", "full-body"],
  "image": "https://example.com/programs/foundation.jpg",
  "price": { "amount": 29.99, "currency": "USD", "interval": "month", "periodDays": 30 }
}
```

`exerciseId` values must reference documents in the `Exercise` collection. They
are validated as well-formed 24-character hex ObjectIds, but not for existence —
a missing exercise simply returns `null` when the program detail is fetched.

Browse the catalogue to find a program's `_id` and confirm its schedule:

```bash
# List beginner programs, cheapest metadata only
curl "http://localhost:5000/api/programs?difficulty=beginner&fields=goal,difficulty,lengthDays,price"

# Fetch one program with its exercises resolved
curl http://localhost:5000/api/programs/664e0a1bb8e4d3f0a1b2c3d0
```

See [`PROGRAM_MODEL.md`](PROGRAM_MODEL.md#programs-api) for the full query
parameter list and response shapes.

---

## Enrollment flow

Enrolling snapshots the program's price, starts the clock at day 0 and sets an
expiry `lengthDays` into the future.

1. **Find a program.** `GET /api/programs` (public) and note its `_id`. The
   program must have a `price` configured, otherwise enrolment is rejected.

2. **Enrol.** `POST /api/memberships` with the program id:

   ```bash
   curl -X POST http://localhost:5000/api/memberships \
     -H "Authorization: Bearer <firebase_id_token>" \
     -H "Content-Type: application/json" \
     -d '{ "planId": "664e0a1bb8e4d3f0a1b2c3d0" }'
   ```

   A `201` response returns the new membership with `planId` populated:

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
         "expiresAt": "2026-07-13T09:00:00.000Z"
       }
     }
   }
   ```

3. **Check your memberships.** `GET /api/memberships` returns only your own:

   ```bash
   curl -H "Authorization: Bearer <firebase_id_token>" \
     "http://localhost:5000/api/memberships?status=active&sort=-createdAt"
   ```

**Common failures**

| Response | Cause |
|---|---|
| `409` `An active membership for this program already exists` | You already hold an active membership for this program. |
| `400` `Program has no price configured` | The program has no `price`, so it cannot be enrolled in. |
| `400` `Program is missing a valid lengthDays` | The program's `lengthDays` is missing or not a positive number. |
| `404` `Program not found` | No program with that `planId`. |

A member can hold only one **active** membership per program, but may re-enrol
after a membership is `cancelled` or `expired`.

---

## Workout logging

> **Implemented:** the base `POST /api/workouts` handler.
> **Planned:** program-aware progress ([#997](https://github.com/parthbuilds-community/FitMart/issues/997)).

Today, `POST /api/workouts` upserts one workout log per user per date, keyed by
`userId` + `date`:

```bash
curl -X POST http://localhost:5000/api/workouts \
  -H "Authorization: Bearer <firebase_id_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-06-01",
    "title": "Full body A",
    "notes": "Felt strong",
    "exercises": [
      { "id": "664d1f09b8e4d3f0a1b2c3a1", "name": "Barbell Bench Press", "bodyPart": "chest", "equipment": "barbell" }
    ]
  }'
```

`GET /api/workouts` returns all of the caller's logs as a date-keyed map:

```json
{
  "2026-06-01": {
    "title": "Full body A",
    "notes": "Felt strong",
    "exercises": [ { "id": "664d1f09b8e4d3f0a1b2c3a1", "name": "Barbell Bench Press" } ]
  }
}
```

### Program progress (planned)

Once [#997](https://github.com/parthbuilds-community/FitMart/issues/997) lands:

- `WorkoutLog` gains optional `programId`, `dayIndex` and `membershipId` fields
  (backward compatible — logging without a membership keeps working).
- Logging a workout against an active membership increments the membership's
  `currentDayIndex` by 1, capped at the program's `lengthDays`.
- The response includes progress:
  `{ "currentDayIndex": 3, "totalDays": 42, "progressPercent": 7.1, "programGoal": "Build strength in 6 weeks" }`.
- With no active membership, the response is the workout log alone (no progress
  block).

---

## Cancellation flow

> **Planned** — [DELETE /api/memberships Cancel Endpoint (#996)](https://github.com/parthbuilds-community/FitMart/issues/996).

Cancellation is a **soft delete** — the membership document is kept so history
and revenue reporting stay intact, but its `status` becomes `cancelled` and
`cancelledAt` is stamped.

```bash
curl -X DELETE http://localhost:5000/api/memberships/665f1c2ab8e4d3f0a1b2c3d4 \
  -H "Authorization: Bearer <firebase_id_token>"
```

The `200` response returns the updated membership (with `planId` populated):

```json
{
  "success": true,
  "data": {
    "membership": {
      "_id": "665f1c2ab8e4d3f0a1b2c3d4",
      "status": "cancelled",
      "cancelledAt": "2026-06-15T12:00:00.000Z",
      "planId": { "_id": "664e0a1bb8e4d3f0a1b2c3d0", "goal": "Build strength in 6 weeks" }
    }
  }
}
```

Only the **owner or an admin** may cancel. Cancelling an already
`cancelled`/`expired` membership returns `409`.

---

## Admin operations

Admins (UID matching `ADMIN_UID` / `SUPER_ADMIN_UID`, plus the dev-only
`DEV_ADMIN_EMAIL` / `DEV_ADMIN_UID` shortcuts) get two extra powers:

1. **Enrol another user.** Pass a `userId` in the body; this is rejected with
   `403` for non-admins:

   ```bash
   curl -X POST http://localhost:5000/api/memberships \
     -H "Authorization: Bearer <admin_firebase_id_token>" \
     -H "Content-Type: application/json" \
     -d '{ "planId": "664e0a1bb8e4d3f0a1b2c3d0", "userId": "firebase-uid-of-member" }'
   ```

2. **See every membership.** A regular `GET /api/memberships` is scoped to the
   caller's own `userId`; an admin's request is not scoped and can be filtered:

   ```bash
   curl -H "Authorization: Bearer <admin_firebase_id_token>" \
     "http://localhost:5000/api/memberships?status=active&limit=50"
   ```

3. **Cancel on behalf of a member** (planned, #996) — the same owner-or-admin
   rule applies to `DELETE /api/memberships/:id`.

### Checking progress as an admin

Progress lives on the membership document (`currentDayIndex`). Use the list
endpoint with `fields`-free response and read each membership's
`currentDayIndex` against its populated `planId.lengthDays`. A dedicated
progress/analytics endpoint is not part of this phase.

---

## Seed data

> **Planned** — [Program Seed Data Creation (#987)](https://github.com/parthbuilds-community/FitMart/issues/987).

Once seeds land, `npm run seed` from `server/` upserts a starter catalogue
(idempotent, via `findOneAndUpdate(..., { upsert: true })`) covering beginner to
advanced levels — Foundation Fitness, Strength Builder, Cardio Endurance,
Flexibility & Mobility, Advanced Shred and Core & Balance — each with a full
schedule of 4–8 exercises per day.

Until then, insert a program manually with `mongosh` or a scratch script (see
[Program structure](#program-structure) for a minimal document) and make sure it
has a `price` if you want to enrol into it.

---

## See also

- [Program Model](PROGRAM_MODEL.md) · [Membership Model](MEMBERSHIP_MODEL.md)
- [Products API](PRODUCTS_API.md) for the paginated-list conventions shared by the catalogue endpoints.
- [Contributing](CONTRIBUTING.md) for local setup and test commands.
