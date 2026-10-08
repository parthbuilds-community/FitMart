/**
 * Integration tests for program-aware workout logging
 * (server/routes/workouts.js — POST /api/workouts).
 *
 * Runs against a real in-memory MongoDB so the route exercises the actual
 * Mongoose layer (membership lookup, capped `$inc` via an aggregation-pipeline
 * update, upsert) instead of a mocked model.
 *
 * Firebase token verification is replaced with a header-driven stub so a test
 * can act as an authenticated user without minting real tokens.
 *
 * Run with: npx jest tests/workouts.test.js
 */

const fs = require('fs');
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

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
const WorkoutLog = require('../models/WorkoutLog');
const workoutsRouter = require('../routes/workouts');

const USER_UID = 'firebase-user-uid';
const DEFAULT_PRICE = { amount: 1499, currency: 'INR', interval: 'month', periodDays: 30 };

let mongoServer;
let app;

// Same convention as the other integration suites: prefer a locally installed
// Windows binary when present, otherwise let mongodb-memory-server fetch one.
const WINDOWS_MONGOD_PATH = 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';

beforeAll(async () => {
  if (process.platform === 'win32' && fs.existsSync(WINDOWS_MONGOD_PATH)) {
    process.env.MONGOMS_SYSTEM_BINARY = WINDOWS_MONGOD_PATH;
  }

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use('/api/workouts', workoutsRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([
    Program.deleteMany({}),
    Membership.deleteMany({}),
    WorkoutLog.deleteMany({}),
  ]);
});

function createProgram(overrides = {}) {
  return new Program({
    goal: 'Foundation Fitness',
    difficulty: 'beginner',
    lengthDays: 28,
    price: { ...DEFAULT_PRICE },
    ...overrides,
  }).save();
}

function createMembership(userId, program, overrides = {}) {
  return Membership.create({
    userId,
    planId: program._id,
    status: 'active',
    priceSnapshot: { ...DEFAULT_PRICE },
    ...overrides,
  });
}

// POST helper. Omitting `uid` deliberately produces an unauthenticated request.
function post(uid, body) {
  const req = request(app).post('/api/workouts');
  if (uid) req.set('x-test-uid', uid);
  return req.send(body);
}

const logFor = (body, uid = USER_UID) => post(uid, body);

describe('POST /api/workouts - authentication', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await post(null, { date: '2026-06-01', title: 'Full body A' });

    expect(res.status).toBe(401);
    expect(await WorkoutLog.countDocuments({})).toBe(0);
  });
});

describe('POST /api/workouts - backward compatibility', () => {
  test('upserts a log without program context and returns no progress', async () => {
    const res = await logFor({
      date: '2026-06-01',
      title: 'Full body A',
      notes: 'Felt strong',
      exercises: [{ id: 'ex-1', name: 'Bench Press' }],
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      userId: USER_UID,
      date: '2026-06-01',
      title: 'Full body A',
      notes: 'Felt strong',
    });
    expect(res.body.exercises).toHaveLength(1);
    expect(res.body).not.toHaveProperty('progress');
    expect(res.body).not.toHaveProperty('membershipId');

    expect(await WorkoutLog.countDocuments({ userId: USER_UID })).toBe(1);
  });

  test('re-logging the same date updates rather than duplicates', async () => {
    await logFor({ date: '2026-06-01', title: 'First' });
    const res = await logFor({ date: '2026-06-01', title: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
    expect(await WorkoutLog.countDocuments({ userId: USER_UID })).toBe(1);
  });

  test('rejects an unknown top-level field (strict schema)', async () => {
    const res = await logFor({ date: '2026-06-01', unexpected: 'nope' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request');
  });

  test('rejects a non-hex programId', async () => {
    const res = await logFor({ date: '2026-06-01', programId: 'not-an-object-id' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request');
  });

  test('rejects a negative dayIndex', async () => {
    const res = await logFor({ date: '2026-06-01', dayIndex: -1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request');
  });
});

describe('POST /api/workouts - program progress', () => {
  test('stamps program context and increments currentDayIndex by one', async () => {
    const program = await createProgram({ lengthDays: 28 });
    await createMembership(USER_UID, program);

    const res = await logFor({ date: '2026-06-01', title: 'Day 1' });

    expect(res.status).toBe(200);
    expect(res.body.programId).toBe(program._id.toString());
    expect(res.body.dayIndex).toBe(0);

    const membership = await Membership.findById(res.body.membershipId).lean();
    expect(membership.currentDayIndex).toBe(1);
    expect(String(membership._id)).toBe(String(res.body.membershipId));

    expect(res.body.progress).toEqual({
      currentDayIndex: 1,
      totalDays: 28,
      progressPercent: 3.6,
      programGoal: 'Foundation Fitness',
    });
  });

  test('advances across multiple workouts on different dates', async () => {
    const program = await createProgram({ lengthDays: 42, goal: 'Build strength in 6 weeks' });
    const membership = await createMembership(USER_UID, program);

    await logFor({ date: '2026-06-01', title: 'Day 1' });
    await logFor({ date: '2026-06-02', title: 'Day 2' });
    const third = await logFor({ date: '2026-06-03', title: 'Day 3' });

    // Successive logs carry successive day indexes.
    const logs = await WorkoutLog.find({ userId: USER_UID }).sort({ date: 1 }).lean();
    expect(logs.map((log) => log.dayIndex)).toEqual([0, 1, 2]);

    const updated = await Membership.findById(membership._id).lean();
    expect(updated.currentDayIndex).toBe(3);
    expect(third.body.progress).toEqual({
      currentDayIndex: 3,
      totalDays: 42,
      progressPercent: 7.1,
      programGoal: 'Build strength in 6 weeks',
    });
  });

  test('caps currentDayIndex at the program lengthDays on completion', async () => {
    const program = await createProgram({ lengthDays: 2 });
    const membership = await createMembership(USER_UID, program, { currentDayIndex: 2 });

    const res = await logFor({ date: '2026-06-05', title: 'Extra session' });

    const updated = await Membership.findById(membership._id).lean();
    expect(updated.currentDayIndex).toBe(2);
    expect(res.body.progress).toEqual({
      currentDayIndex: 2,
      totalDays: 2,
      progressPercent: 100,
      programGoal: 'Foundation Fitness',
    });
  });

  test('never overshoots lengthDays when only one day remains', async () => {
    const program = await createProgram({ lengthDays: 2 });
    const membership = await createMembership(USER_UID, program, { currentDayIndex: 1 });

    const res = await logFor({ date: '2026-06-06', title: 'Final session' });

    const updated = await Membership.findById(membership._id).lean();
    expect(updated.currentDayIndex).toBe(2);
    expect(res.body.progress.currentDayIndex).toBe(2);
    expect(res.body.progress.progressPercent).toBe(100);
  });

  test('returns the workout log without progress when there is no active membership', async () => {
    const program = await createProgram();
    // A cancelled membership must not count as active.
    await createMembership(USER_UID, program, { status: 'cancelled' });

    const res = await logFor({ date: '2026-06-01', title: 'Solo session' });

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty('progress');
    expect(res.body).not.toHaveProperty('membershipId');
    expect(await WorkoutLog.countDocuments({ userId: USER_UID })).toBe(1);
  });

  test('does not advance progress when re-logging the same date (idempotency)', async () => {
    const program = await createProgram();
    const membership = await createMembership(USER_UID, program);

    const first = await logFor({ date: '2026-06-01', title: 'Day 1' });
    const second = await logFor({ date: '2026-06-01', title: 'Day 1 (edited)' });

    expect(first.body.progress.currentDayIndex).toBe(1);
    expect(second.body.progress.currentDayIndex).toBe(1);

    const updated = await Membership.findById(membership._id).lean();
    expect(updated.currentDayIndex).toBe(1);
    expect(await WorkoutLog.countDocuments({ userId: USER_UID })).toBe(1);
  });
});

describe('POST /api/workouts - programId in the request', () => {
  test('advances the membership when the supplied programId matches its plan', async () => {
    const program = await createProgram({ lengthDays: 14 });
    const membership = await createMembership(USER_UID, program);

    const res = await logFor({
      date: '2026-06-01',
      title: 'Day 1',
      programId: program._id.toString(),
    });

    expect(res.status).toBe(200);
    expect(res.body.programId).toBe(program._id.toString());
    expect(res.body.progress.currentDayIndex).toBe(1);

    const updated = await Membership.findById(membership._id).lean();
    expect(updated.currentDayIndex).toBe(1);
  });

  test('logs against a requested program without advancing a different membership', async () => {
    const enrolled = await createProgram({ goal: 'Enrolled Program' });
    const other = await createProgram({ goal: 'Other Program', lengthDays: 21 });
    const membership = await createMembership(USER_UID, enrolled);

    const res = await logFor({
      date: '2026-06-01',
      title: 'Free session',
      programId: other._id.toString(),
      dayIndex: 5,
    });

    expect(res.status).toBe(200);
    expect(res.body.programId).toBe(other._id.toString());
    expect(res.body.dayIndex).toBe(5);
    expect(res.body).not.toHaveProperty('progress');
    expect(res.body).not.toHaveProperty('membershipId');

    const updated = await Membership.findById(membership._id).lean();
    expect(updated.currentDayIndex).toBe(0);
  });

  test('honours a caller-supplied dayIndex over the membership position', async () => {
    const program = await createProgram({ lengthDays: 30 });
    await createMembership(USER_UID, program, { currentDayIndex: 2 });

    const res = await logFor({ date: '2026-06-01', title: 'Jumped ahead', dayIndex: 9 });

    expect(res.body.dayIndex).toBe(9);
    // Progress still advances by exactly one, independent of the reported day.
    expect(res.body.progress.currentDayIndex).toBe(3);
  });
});

describe('POST /api/workouts - atomicity / compensation', () => {
  test('rolls the log back when advancing the membership fails', async () => {
    const program = await createProgram();
    await createMembership(USER_UID, program);

    const failure = new Error('simulated membership update failure');
    const spy = jest
      .spyOn(Membership, 'findByIdAndUpdate')
      .mockRejectedValueOnce(failure);

    const res = await logFor({ date: '2026-06-01', title: 'Day 1' });

    spy.mockRestore();

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Server error saving workout log');
    // The upserted log is compensated away so a retry starts clean.
    expect(await WorkoutLog.countDocuments({ userId: USER_UID })).toBe(0);
  });

  test('restores the previous log when advancing the membership fails on an update', async () => {
    const program = await createProgram();
    await createMembership(USER_UID, program);

    // A log recorded before the user enrolled carries no program context, so it
    // has not been counted toward progress and the retry will try to advance.
    await WorkoutLog.create({ userId: USER_UID, date: '2026-06-01', title: 'Original' });

    const failure = new Error('simulated membership update failure');
    const spy = jest
      .spyOn(Membership, 'findByIdAndUpdate')
      .mockRejectedValueOnce(failure);

    const res = await logFor({ date: '2026-06-01', title: 'Overwritten' });

    spy.mockRestore();

    expect(res.status).toBe(500);

    const logs = await WorkoutLog.find({ userId: USER_UID }).lean();
    expect(logs).toHaveLength(1);
    expect(logs[0].title).toBe('Original');
    expect(logs[0].membershipId).toBeUndefined();
  });
});
