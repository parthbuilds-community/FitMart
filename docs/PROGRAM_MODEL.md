# Program Model

A **Program** is a progressive training plan — an ordered list of days, each with
a focus and a set of prescribed exercises. It is the catalogue entity members
enrol into; a [`Membership`](MEMBERSHIP_MODEL.md) links a user to a program and
tracks their position through it.

- **Source:** `server/models/Program.js` (added by the Phase 1 Program model work)
- **Catalogue API:** `server/routes/programs.js` — see [Programs API](#programs-api) below
- **Related docs:** [`MEMBERSHIP_MODEL.md`](MEMBERSHIP_MODEL.md) · [`USAGE_GUIDE.md`](USAGE_GUIDE.md) · [`NEW_PLAN.md`](NEW_PLAN.md)

> **Implementation status.** This document describes the Phase 1 data spine.
> The schema structure, validators and indexes ship via the Program model work
> ([#984](https://github.com/parthbuilds-community/FitMart/issues/984),
> [#985](https://github.com/parthbuilds-community/FitMart/issues/985)); the
> optional `price` sub-document and the catalogue endpoints ship alongside the
> membership work. Anything not yet merged is called out explicitly as
> **Planned**. See the [roadmap](NEW_PLAN.md) for the full phase list.

---

## Schema

Collection: `programs`

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `goal` | String | ✅ | trimmed, 5–120 characters | The member outcome this program targets, e.g. `"Build strength in 6 weeks"`. Also shown in the catalogue. |
| `difficulty` | String | ✅ | enum: `beginner` \| `intermediate` \| `advanced` | Skill level. Drives the `?difficulty=` filter. |
| `lengthDays` | Number | ✅ | integer, 1–90, **must equal `day.length`** | Total number of training days in the program. Derives membership expiry. |
| `day` | `[ProgramDay]` | ✅ | at least 1 entry, unique `dayNumber`s | Ordered day schedule. See [Day structure](#day-structure). |
| `tags` | `[String]` | — | max 10, normalised | Searchable labels. Trimmed + lower-cased; empty strings dropped. |
| `image` | String | — | default `""` | Cover image URL. |
| `price` | `ProgramPrice` | — | optional sub-document | What it costs to enrol. See [Price](#price). Absent (`undefined`) when not configured. |
| `createdAt` | Date | auto | `timestamps: true` | Set by Mongoose. |
| `updatedAt` | Date | auto | `timestamps: true` | Set by Mongoose. |

### Day structure

`day` is an array of embedded `ProgramDay` documents. Days are **positional**
(the sub-schemas use `{ _id: false }`), and the API returns them sorted by
`dayNumber` so the timeline is stable regardless of insertion order.

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `dayNumber` | Number | ✅ | unique within `day` | 1-based position in the program. |
| `focus` | String | — | trimmed | Short label for the session, e.g. `"Push"`, `"Lower body"`. |
| `exercises` | `[ProgramExercise]` | ✅ | at least 1 per day | Prescribed work for the day. |

Each `ProgramExercise` is also positional (`{ _id: false }`):

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `exerciseId` | ObjectId | ✅ | ref `Exercise`, well-formed 24-char hex | Reference into the exercise library. |
| `sets` | Number | — | — | Number of sets. |
| `reps` | Number | — | — | Repetitions per set. |
| `restSeconds` | Number | — | — | Rest between sets. |
| `notes` | String | — | default `""` | Free-text coaching cue. |

> `exerciseId` is validated as a **well-formed** ObjectId but not as an existing
> document. A dangling-but-valid reference is stored as-is; the program detail
> endpoint returns `null` in its place rather than failing.

### Price

`price` is an optional embedded sub-document (`{ _id: false }`). It is stored as
`undefined` when omitted so no half-filled snapshot is produced.

| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | Number | ✅ | The number the member pays. |
| `currency` | String | ✅ | ISO currency code, e.g. `"INR"`, `"USD"`. |
| `interval` | String | ✅ | Billing label, e.g. `"month"`, `"one-time"`. |
| `periodDays` | Number | ✅ | Length of one billing period in days. |

A program **cannot be enrolled in** without a price: `POST /api/memberships`
returns `400` when `price` is missing. When a member enrols, these values are
copied verbatim into the membership's
[`priceSnapshot`](MEMBERSHIP_MODEL.md#price-snapshot) so later price edits never
rewrite existing members' history.

---

## Validators

Enforced by Mongoose on `save()` / `create()` in `server/models/Program.js`.

| Rule | Error message |
|---|---|
| `goal` required | `goal is required` |
| `goal` ≥ 5 chars | `goal must be at least 5 characters` |
| `goal` ≤ 120 chars | `goal must be at most 120 characters` |
| `difficulty` required | `difficulty is required` |
| `difficulty` in enum | `{VALUE} is not a supported difficulty` |
| `lengthDays` required | `lengthDays is required` |
| `lengthDays` ≥ 1 | `lengthDays must be at least 1` |
| `lengthDays` ≤ 90 | `lengthDays must be at most 90` |
| `day` required, non-empty | `day is required` / `A program must contain at least one day` |
| `dayNumber`s unique | `Program day numbers must be unique` |
| `day.length === lengthDays` | `lengthDays must match the number of day entries` |
| Each day has ≥ 1 exercise | `Each program day must contain at least one exercise` |
| `exerciseId` required | `Each exercise slot must reference an exercise` |
| `tags` ≤ 10 | `A program can have at most 10 tags` |

The `tags` normaliser is a schema `set` function, so it runs both on assignment
and on query casting:

```js
set: (tags) =>
  Array.isArray(tags)
    ? tags.map((tag) => String(tag).trim().toLowerCase()).filter((tag) => tag.length > 0)
    : tags,
```

`[" Strength ", ""]` is stored as `["strength"]`.

---

## Indexes

Declared on the schema and created by Mongoose when `autoIndex` is enabled
(the default in development).

| Index | Type | Purpose |
|---|---|---|
| `{ difficulty: 1, createdAt: -1 }` | compound | Default catalogue browse/filter by difficulty, newest first. |
| `{ tags: 1 }` | single | Tag filtering (`?tag=`). |
| `{ goal: 1 }` | single | Goal lookups. |
| `{ goal: 1, difficulty: 1 }` | **unique** | Prevents duplicate programs for the same goal at the same difficulty. |

The unique compound index also rejects duplicate inserts with a MongoDB
`E11000 duplicate key error` — give each program a distinct `goal` in fixtures
and tests.

---

## Programs API

Both endpoints are **public** (no `Authorization` header required) and use the
shared [`ok()`/`fail()`](../server/utils/apiResponse.js) response contract:
success is `{ "success": true, ...data }`, failure is
`{ "success": false, "error": "<message>" }`.

### `GET /api/programs`

Paginated, filterable program catalogue.

| Query param | Type | Default | Notes |
|---|---|---|---|
| `page` | integer ≥ 1 | `1` | |
| `limit` | integer 1–50 | `10` | Values above 50 are rejected. |
| `difficulty` | enum | — | `beginner` \| `intermediate` \| `advanced` |
| `tag` | string | — | Case-insensitive **exact** tag match. |
| `search` | string | — | Case-insensitive substring match against `goal` **or** `tags`. |
| `sort` | string | `-createdAt` | One of `createdAt`, `goal`, `difficulty`, `lengthDays`, optionally prefixed with `-` for descending. |
| `fields` | string | — | Comma-separated inclusion projection, e.g. `goal,difficulty,image`. |

```json
{
  "success": true,
  "data": {
    "programs": [
      {
        "_id": "664e0a1bb8e4d3f0a1b2c3d0",
        "goal": "Build strength in 6 weeks",
        "difficulty": "intermediate",
        "lengthDays": 2,
        "day": [
          {
            "dayNumber": 1,
            "focus": "Push",
            "exercises": [
              { "exerciseId": "664d1f09b8e4d3f0a1b2c3a1", "sets": 4, "reps": 8, "restSeconds": 90, "notes": "" }
            ]
          },
          {
            "dayNumber": 2,
            "focus": "Pull",
            "exercises": [
              { "exerciseId": "664d1f09b8e4d3f0a1b2c3a2", "sets": 4, "reps": 10, "restSeconds": 60, "notes": "" }
            ]
          }
        ],
        "tags": ["strength", "gym"],
        "image": "https://example.com/programs/strength.jpg",
        "price": { "amount": 49.99, "currency": "USD", "interval": "month", "periodDays": 30 },
        "createdAt": "2026-06-01T09:00:00.000Z",
        "updatedAt": "2026-06-01T09:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
  }
}
```

`search` and `tag` inputs are regex-escaped before reaching MongoDB, so
metacharacters match literally.

### `GET /api/programs/:id`

Returns a single program with its exercise references **populated** in place.

- Path param `id` must be a 24-character hexadecimal ObjectId, otherwise the
  request is rejected with `400`.
- `day` is sorted by `dayNumber` ascending.
- `__v` is stripped from the response.

```json
{
  "success": true,
  "data": {
    "program": {
      "_id": "664e0a1bb8e4d3f0a1b2c3d0",
      "goal": "Build strength in 6 weeks",
      "difficulty": "intermediate",
      "lengthDays": 1,
      "day": [
        {
          "dayNumber": 1,
          "focus": "Push",
          "exercises": [
            {
              "exerciseId": {
                "_id": "664d1f09b8e4d3f0a1b2c3a1",
                "name": "Barbell Bench Press",
                "muscleGroup": "chest",
                "equipment": "barbell",
                "image": "https://example.com/exercises/bench-press.gif"
              },
              "sets": 4,
              "reps": 8,
              "restSeconds": 90,
              "notes": ""
            }
          ]
        }
      ],
      "tags": ["strength", "gym"],
      "image": "https://example.com/programs/strength.jpg",
      "createdAt": "2026-06-01T09:00:00.000Z",
      "updatedAt": "2026-06-01T09:00:00.000Z"
    }
  }
}
```

Populated exercise objects expose only `name`, `muscleGroup`, `equipment` and
`image`. If an `exerciseId` no longer resolves, that slot's `exerciseId` is
`null`.

### Errors

| Status | Body | When |
|---|---|---|
| `400` | `{ "success": false, "error": "Invalid request", "details": [...] }` | Query/param validation fails (bad `limit`, unknown `sort`, non-hex `id`). |
| `404` | `{ "success": false, "error": "Program not found" }` | No program with that `_id`. |
| `500` | `{ "success": false, "error": "Failed to fetch program(s)" }` | Unexpected server error. |

---

## Seed data

> **Planned** — [Program Seed Data Creation (#987)](https://github.com/parthbuilds-community/FitMart/issues/987).
> The seeds below are not in `server/seed.js` yet.

`npm run seed` will upsert 5–6 realistic programs, each with a full day
schedule of 4–8 exercises referencing existing `Exercise` documents. Seeding is
idempotent (`findOneAndUpdate(..., { upsert: true })`) and prints a summary.

| Program | Difficulty | Length |
|---|---|---|
| Foundation Fitness | beginner | 28 days |
| Strength Builder | intermediate | 42 days |
| Cardio Endurance | intermediate | 35 days |
| Flexibility & Mobility | beginner | 28 days |
| Advanced Shred | advanced | 56 days |
| Core & Balance | beginner/intermediate | 21 days |

Until the seeds land, insert programs via `mongosh` or a scratch script — see
[USAGE_GUIDE.md](USAGE_GUIDE.md#program-structure) for a minimal valid document.
