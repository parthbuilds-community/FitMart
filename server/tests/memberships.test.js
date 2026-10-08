/**
 * Integration tests for membership enrolment (server/routes/memberships.js).
 *
 * Runs against a real in-memory MongoDB so the route exercises the actual
 * Mongoose layer (ObjectId lookup, duplicate-active query, populate) instead of
 * a mocked model.
 *
 * Firebase token verification is replaced with a header-driven stub so a test
 * can act as a regular user or as an admin without minting real tokens.
 *
 * Run with: npx jest tests/memberships.test.js
 */

const fs = require('fs');
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Must be assigned before the router is required: routes/memberships.js reads
// these env vars at module load, exactly like routes/user.js.
process.env.ADMIN_UID = 'test-admin-uid';

jest.mock('../middleware/verifyFirebaseToken', () => (req, res, next) => {
  const uid = req.get('x-test-uid');
  if (!uid) return res.status(401).json({ error: 'Unauthorized — no token provided' });
  req.user = {
    uid,
    email: req.get('x-test-email') || `${uid}@example.com`,
    email_verified: true,
  };
  next();
});

const Program = require('../models/Program');
const Membership = require('../models/Membership');
const membershipsRouter = require('../routes/memberships');

const ADMIN_UID = 'test-admin-uid';
const USER_UID = 'firebase-user-uid';
const OTHER_UID = 'firebase-other-uid';
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PRICE = { amount: 1499, currency: 'INR', interval: 'month', periodDays: 30 };

let mongoServer;
let app;

// Same convention as programs.test.js / cart.reserved.test.js: prefer a locally
// installed Windows binary when present, otherwise let mongodb-memory-server
// fetch its own.
const WINDOWS_MONGOD_PATH = 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';

beforeAll(async () => {
  if (process.platform === 'win32' && fs.existsSync(WINDOWS_MONGOD_PATH)) {
    process.env.MONGOMS_SYSTEM_BINARY = WINDOWS_MONGOD_PATH;
  }

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use('/api/memberships', membershipsRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([Program.deleteMany({}), Membership.deleteMany({})]);
});

function createProgram(overrides = {}) {
  const program = new Program({
    goal: 'Foundation Fitness',
    difficulty: 'beginner',
    lengthDays: 28,
    image: 'https://cdn.example.com/foundation.png',
    price: { ...DEFAULT_PRICE },
    ...overrides,
  });

  return program.save();
}

// POST helper. Omitting `uid` deliberately produces an unauthenticated request.
function post(uid, body) {
  const req = request(app).post('/api/memberships');
  if (uid) req.set('x-test-uid', uid);
  return req.send(body);
}

function enroll(uid, planId, extra = {}) {
  return post(uid, { planId, ...extra });
}

// Direct model insert so the list tests do not depend on the POST route.
function createMembership(userId, program, overrides = {}) {
  return Membership.create({
    userId,
    planId: program._id,
    status: 'active',
    priceSnapshot: { ...DEFAULT_PRICE },
    ...overrides,
  });
}

function get(uid, query = '') {
  const req = request(app).get(`/api/memberships${query}`);
  if (uid) req.set('x-test-uid', uid);
  return req;
}

describe('POST /api/memberships', () => {
  test('rejects an unauthenticated request', async () => {
    const program = await createProgram();

    const res = await post(null, { planId: program._id.toString() });

    expect(res.status).toBe(401);
    expect(await Membership.countDocuments({})).toBe(0);
  });

  test('enrols the caller and returns 201', async () => {
    const program = await createProgram();

    const res = await enroll(USER_UID, program._id.toString());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.membership).toMatchObject({
      userId: USER_UID,
      status: 'active',
      renewCount: 0,
      currentDayIndex: 0,
    });
  });

  test('leaves cancelledAt unset on a fresh membership', async () => {
    const program = await createProgram();

    const res = await enroll(USER_UID, program._id.toString());

    expect(res.body.data.membership).not.toHaveProperty('cancelledAt');
  });

  test('sets enrolledAt and startedAt to the same instant', async () => {
    const program = await createProgram();

    const res = await enroll(USER_UID, program._id.toString());

    const { startedAt, enrolledAt } = res.body.data.membership;
    expect(startedAt).toBeTruthy();
    expect(enrolledAt).toBe(startedAt);
  });

  test('returns the populated program fields', async () => {
    const program = await createProgram();

    const res = await enroll(USER_UID, program._id.toString());

    expect(res.body.data.membership.planId).toMatchObject({
      goal: 'Foundation Fitness',
      difficulty: 'beginner',
      lengthDays: 28,
      image: 'https://cdn.example.com/foundation.png',
    });
  });

  test('does not expose program price or the version key', async () => {
    const program = await createProgram();

    const res = await enroll(USER_UID, program._id.toString());
    const membership = res.body.data.membership;

    expect(membership).not.toHaveProperty('__v');
    expect(membership.planId).not.toHaveProperty('price');
  });

  test('snapshots the program price onto the membership', async () => {
    const program = await createProgram();

    const res = await enroll(USER_UID, program._id.toString());

    expect(res.body.data.membership.priceSnapshot).toEqual(DEFAULT_PRICE);
  });

  test('keeps the snapshot stable when the program price changes afterwards', async () => {
    const program = await createProgram();
    await enroll(USER_UID, program._id.toString());

    await Program.updateOne({ _id: program._id }, { $set: { 'price.amount': 9999 } });

    const membership = await Membership.findOne({ userId: USER_UID }).lean();
    expect(membership.priceSnapshot.amount).toBe(DEFAULT_PRICE.amount);
  });

  test('derives expiresAt from startedAt plus the program length', async () => {
    const program = await createProgram({ lengthDays: 42 });

    const res = await enroll(USER_UID, program._id.toString());

    const { startedAt, expiresAt } = res.body.data.membership;
    const elapsedDays = (new Date(expiresAt) - new Date(startedAt)) / DAY_MS;
    expect(elapsedDays).toBeCloseTo(42, 6);
  });

  test('rejects a duplicate active enrolment with 409', async () => {
    const program = await createProgram();
    await enroll(USER_UID, program._id.toString());

    const res = await enroll(USER_UID, program._id.toString());

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/active membership/i);
    expect(await Membership.countDocuments({})).toBe(1);
  });

  test('allows re-enrolment once the previous membership is cancelled', async () => {
    const program = await createProgram();
    await Membership.create({
      userId: USER_UID,
      planId: program._id,
      status: 'cancelled',
      priceSnapshot: DEFAULT_PRICE,
    });

    const res = await enroll(USER_UID, program._id.toString());

    expect(res.status).toBe(201);
    expect(await Membership.countDocuments({ userId: USER_UID })).toBe(2);
  });

  test('treats different programs as independent enrolments', async () => {
    const first = await createProgram({ goal: 'Foundation Fitness' });
    const second = await createProgram({ goal: 'Strength Builder' });
    await enroll(USER_UID, first._id.toString());

    const res = await enroll(USER_UID, second._id.toString());

    expect(res.status).toBe(201);
  });

  test('scopes the duplicate check to the enrolled user', async () => {
    const program = await createProgram();
    await enroll(USER_UID, program._id.toString());

    const res = await enroll(OTHER_UID, program._id.toString());

    expect(res.status).toBe(201);
    expect(res.body.data.membership.userId).toBe(OTHER_UID);
  });

  test('returns 404 for an unknown program', async () => {
    const res = await enroll(USER_UID, new mongoose.Types.ObjectId().toString());

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, error: 'Program not found' });
  });

  test.each([
    ['a malformed planId', 'not-an-object-id', 'planId'],
    ['a planId of the wrong length', 'abc123', 'planId'],
  ])('rejects %s', async (_label, planId, field) => {
    const res = await enroll(USER_UID, planId);

    // The envelope keys other than `success` are asserted because `success:
    // false` on validation errors is added by #990; asserting it here would
    // make these tests order-dependent on which PR merges first.
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request');
    expect(res.body.details.map((d) => d.path)).toContain(field);
  });

  test('rejects a missing planId', async () => {
    const res = await post(USER_UID, {});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request');
    expect(res.body.details.map((d) => d.path)).toContain('planId');
  });

  test('rejects unknown body fields', async () => {
    const program = await createProgram();

    const res = await enroll(USER_UID, program._id.toString(), { status: 'active' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request');
    expect(await Membership.countDocuments({})).toBe(0);
  });

  test('rejects an empty string userId override', async () => {
    const program = await createProgram();

    const res = await enroll(USER_UID, program._id.toString(), { userId: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.details.map((d) => d.path)).toContain('userId');
  });

  test('returns 400 when the program has no price', async () => {
    const program = await createProgram({ price: undefined });

    const res = await enroll(USER_UID, program._id.toString());

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Program has no price configured',
    });
    expect(await Membership.countDocuments({})).toBe(0);
  });

  test('returns 400 when the program has no length', async () => {
    const program = await createProgram({ lengthDays: undefined });

    const res = await enroll(USER_UID, program._id.toString());

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Program is missing a valid lengthDays',
    });
  });

  test('rejects a non-admin userId override with 403', async () => {
    const program = await createProgram();

    const res = await enroll(USER_UID, program._id.toString(), { userId: OTHER_UID });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(await Membership.countDocuments({})).toBe(0);
  });

  test('allows an admin to enrol another user', async () => {
    const program = await createProgram();

    const res = await enroll(ADMIN_UID, program._id.toString(), { userId: OTHER_UID });

    expect(res.status).toBe(201);
    expect(res.body.data.membership.userId).toBe(OTHER_UID);
  });

  test('allows an admin to enrol themselves', async () => {
    const program = await createProgram();

    const res = await enroll(ADMIN_UID, program._id.toString());

    expect(res.status).toBe(201);
    expect(res.body.data.membership.userId).toBe(ADMIN_UID);
  });

  test('still blocks a duplicate when the admin enrols another user', async () => {
    const program = await createProgram();
    await enroll(ADMIN_UID, program._id.toString(), { userId: OTHER_UID });

    const res = await enroll(ADMIN_UID, program._id.toString(), { userId: OTHER_UID });

    expect(res.status).toBe(409);
  });
});

describe('GET /api/memberships', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await get(null);

    expect(res.status).toBe(401);
  });

  test('returns an empty list for a user with no memberships', async () => {
    const res = await get(USER_UID);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        memberships: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      },
    });
  });

  test('returns only the callers own memberships', async () => {
    const program = await createProgram();
    await createMembership(USER_UID, program);
    await createMembership(OTHER_UID, program);

    const res = await get(USER_UID);

    expect(res.status).toBe(200);
    expect(res.body.data.memberships).toHaveLength(1);
    expect(res.body.data.memberships[0].userId).toBe(USER_UID);
    expect(res.body.data.pagination.total).toBe(1);
  });

  test('lets an admin see every membership', async () => {
    const program = await createProgram();
    await createMembership(USER_UID, program);
    await createMembership(OTHER_UID, program);
    await createMembership(ADMIN_UID, program);

    const res = await get(ADMIN_UID);

    expect(res.status).toBe(200);
    expect(res.body.data.memberships).toHaveLength(3);
    expect(res.body.data.pagination.total).toBe(3);
  });

  test('filters by status', async () => {
    const program = await createProgram();
    await createMembership(USER_UID, program, { status: 'active' });
    await createMembership(USER_UID, program, { status: 'cancelled' });
    await createMembership(OTHER_UID, program, { status: 'cancelled' });

    const res = await get(USER_UID, '?status=cancelled');

    expect(res.status).toBe(200);
    expect(res.body.data.memberships).toHaveLength(1);
    expect(res.body.data.memberships[0].status).toBe('cancelled');
    expect(res.body.data.pagination.total).toBe(1);
  });

  test('applies the status filter for admins across all users', async () => {
    const program = await createProgram();
    await createMembership(USER_UID, program, { status: 'active' });
    await createMembership(OTHER_UID, program, { status: 'cancelled' });

    const res = await get(ADMIN_UID, '?status=cancelled');

    expect(res.status).toBe(200);
    expect(res.body.data.memberships).toHaveLength(1);
    expect(res.body.data.memberships[0].userId).toBe(OTHER_UID);
  });

  test('paginates the results and reports the metadata', async () => {
    const program = await createProgram();
    for (let i = 0; i < 5; i += 1) {
      await createMembership(USER_UID, program, { renewCount: i });
    }

    const firstPage = await get(USER_UID, '?page=1&limit=2');
    expect(firstPage.status).toBe(200);
    expect(firstPage.body.data.memberships).toHaveLength(2);
    expect(firstPage.body.data.pagination).toEqual({
      page: 1,
      limit: 2,
      total: 5,
      totalPages: 3,
    });

    const lastPage = await get(USER_UID, '?page=3&limit=2');
    expect(lastPage.body.data.memberships).toHaveLength(1);
    expect(lastPage.body.data.pagination.page).toBe(3);
  });

  test('does not leak memberships from other pages or users', async () => {
    const program = await createProgram();
    for (let i = 0; i < 4; i += 1) {
      await createMembership(USER_UID, program, { renewCount: i });
    }
    await createMembership(OTHER_UID, program);

    const res = await get(USER_UID, '?page=2&limit=2');

    expect(res.body.data.memberships).toHaveLength(2);
    expect(res.body.data.memberships.every((m) => m.userId === USER_UID)).toBe(true);
  });

  test('sorts by a whitelisted field ascending', async () => {
    const program = await createProgram();
    await createMembership(USER_UID, program, { renewCount: 3 });
    await createMembership(USER_UID, program, { renewCount: 1 });
    await createMembership(USER_UID, program, { renewCount: 2 });

    const res = await get(USER_UID, '?sort=renewCount');

    expect(res.body.data.memberships.map((m) => m.renewCount)).toEqual([1, 2, 3]);
  });

  test('sorts descending when the field is prefixed with a dash', async () => {
    const program = await createProgram();
    await createMembership(USER_UID, program, { renewCount: 3 });
    await createMembership(USER_UID, program, { renewCount: 1 });
    await createMembership(USER_UID, program, { renewCount: 2 });

    const res = await get(USER_UID, '?sort=-renewCount');

    expect(res.body.data.memberships.map((m) => m.renewCount)).toEqual([3, 2, 1]);
  });

  test('defaults to newest first', async () => {
    const program = await createProgram();
    const older = await createMembership(USER_UID, program, { renewCount: 1 });
    // Force a distinct timestamp; two inserts can otherwise share a millisecond.
    await Membership.updateOne(
      { _id: older._id },
      { $set: { createdAt: new Date(Date.now() - 60_000) } }
    );
    const newer = await createMembership(USER_UID, program, { renewCount: 2 });

    const res = await get(USER_UID);

    expect(res.body.data.memberships.map((m) => m._id)).toEqual([
      newer._id.toString(),
      older._id.toString(),
    ]);
  });

  test('populates the program fields and hides internal keys', async () => {
    const program = await createProgram();
    await createMembership(USER_UID, program);

    const res = await get(USER_UID);
    const membership = res.body.data.memberships[0];

    expect(membership.planId).toMatchObject({
      goal: 'Foundation Fitness',
      difficulty: 'beginner',
      lengthDays: 28,
      image: 'https://cdn.example.com/foundation.png',
    });
    expect(membership.planId).not.toHaveProperty('price');
    expect(membership).not.toHaveProperty('__v');
  });

  test.each([
    ['a non-numeric page', '?page=abc'],
    ['a zero page', '?page=0'],
    ['a limit above the cap', '?limit=51'],
    ['an unknown status', '?status=zombie'],
    ['an unsupported sort field', '?sort=userId'],
  ])('rejects %s', async (_label, query) => {
    // `success: false` on validation errors arrives with #990; assert only the
    // envelope keys that exist on main today.
    const res = await get(USER_UID, query);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request');
  });
});
