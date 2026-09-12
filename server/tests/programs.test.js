/**
 * Integration tests for the programs catalog (server/routes/programs.js).
 *
 * Uses mongodb-memory-server so the routes exercise the real Mongoose query
 * layer (complex filters, $regex, sort, projection, skip/limit and populate)
 * instead of a mocked model.
 *
 * Run with: npx jest tests/programs.test.js
 */

const fs = require('fs');
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Program = require('../models/Program');
const Exercise = require('../models/Exercise');
const programsRouter = require('../routes/programs');

let mongoServer;
let app;

// Same convention as cart.reserved.test.js: prefer a locally installed Windows
// binary when present, otherwise let mongodb-memory-server fetch its own.
const WINDOWS_MONGOD_PATH = 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';

beforeAll(async () => {
  if (process.platform === 'win32' && fs.existsSync(WINDOWS_MONGOD_PATH)) {
    process.env.MONGOMS_SYSTEM_BINARY = WINDOWS_MONGOD_PATH;
  }

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use('/api/programs', programsRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([Program.deleteMany({}), Exercise.deleteMany({})]);
});

// Helper: create a program with sensible defaults so each test only states what
// it actually cares about. Uses `save(options)` rather than `Program.create(doc,
// options)` because create() is variadic and would treat the options object as a
// second document to insert.
function createProgram(overrides = {}, options = undefined) {
  const program = new Program({
    goal: 'Build full body strength',
    difficulty: 'beginner',
    lengthDays: 3,
    tags: ['strength', 'full-body'],
    day: [
      { dayNumber: 1, focus: 'Push', exercises: [] },
      { dayNumber: 2, focus: 'Pull', exercises: [] },
      { dayNumber: 3, focus: 'Legs', exercises: [] },
    ],
    ...overrides,
  });

  return program.save(options);
}

describe('GET /api/programs (list)', () => {
  test('returns an empty catalog with pagination metadata', async () => {
    const res = await request(app).get('/api/programs');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.programs).toEqual([]);
    expect(res.body.data.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  });

  test('returns the catalog with the default page and limit', async () => {
    await createProgram();
    await createProgram({ goal: 'Improve mobility', difficulty: 'advanced' });

    const res = await request(app).get('/api/programs');

    expect(res.status).toBe(200);
    expect(res.body.data.programs).toHaveLength(2);
    expect(res.body.data.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
  });

  test('paginates using page and limit', async () => {
    await Promise.all(
      [1, 2, 3, 4, 5].map((n) => createProgram({ goal: `Program ${n}`, lengthDays: n }))
    );

    const res = await request(app).get('/api/programs?page=2&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.data.programs).toHaveLength(2);
    expect(res.body.data.pagination).toMatchObject({
      page: 2,
      limit: 2,
      total: 5,
      totalPages: 3,
    });
  });

  test('defaults to newest first', async () => {
    await createProgram(
      { goal: 'Oldest', createdAt: new Date('2026-01-01T00:00:00Z') },
      { timestamps: false }
    );
    await createProgram(
      { goal: 'Newest', createdAt: new Date('2026-06-01T00:00:00Z') },
      { timestamps: false }
    );

    const res = await request(app).get('/api/programs');

    expect(res.status).toBe(200);
    expect(res.body.data.programs.map((p) => p.goal)).toEqual(['Newest', 'Oldest']);
  });

  test('sorts ascending when the field has no - prefix', async () => {
    await createProgram({ goal: 'Long', lengthDays: 30 });
    await createProgram({ goal: 'Short', lengthDays: 7 });

    const res = await request(app).get('/api/programs?sort=lengthDays');

    expect(res.status).toBe(200);
    expect(res.body.data.programs.map((p) => p.lengthDays)).toEqual([7, 30]);
  });

  test('sorts descending when the field is prefixed with -', async () => {
    await createProgram({ goal: 'Long', lengthDays: 30 });
    await createProgram({ goal: 'Short', lengthDays: 7 });

    const res = await request(app).get('/api/programs?sort=-lengthDays');

    expect(res.status).toBe(200);
    expect(res.body.data.programs.map((p) => p.lengthDays)).toEqual([30, 7]);
  });

  test('filters by difficulty', async () => {
    await createProgram({ goal: 'Beginner plan', difficulty: 'beginner' });
    await createProgram({ goal: 'Advanced plan', difficulty: 'advanced' });

    const res = await request(app).get('/api/programs?difficulty=advanced');

    expect(res.status).toBe(200);
    expect(res.body.data.programs).toHaveLength(1);
    expect(res.body.data.programs[0].goal).toBe('Advanced plan');
    expect(res.body.data.pagination.total).toBe(1);
  });

  test('filters by tag case-insensitively', async () => {
    await createProgram({ goal: 'Strength plan', tags: ['strength'] });
    await createProgram({ goal: 'Yoga plan', tags: ['mobility'] });

    const res = await request(app).get('/api/programs?tag=STRENGTH');

    expect(res.status).toBe(200);
    expect(res.body.data.programs).toHaveLength(1);
    expect(res.body.data.programs[0].goal).toBe('Strength plan');
  });

  test('searches across goal and tags case-insensitively', async () => {
    await createProgram({ goal: 'Hypertrophy builder', tags: ['muscle'] });
    await createProgram({ goal: 'Mobility reset', tags: ['recovery', 'HYPERTROPHY'] });
    await createProgram({ goal: 'Endurance base', tags: ['cardio'] });

    const viaGoal = await request(app).get('/api/programs?search=hypertrophy');
    expect(viaGoal.status).toBe(200);
    expect(viaGoal.body.data.pagination.total).toBe(2);

    const viaTag = await request(app).get('/api/programs?search=cardio');
    expect(viaTag.status).toBe(200);
    expect(viaTag.body.data.programs).toHaveLength(1);
    expect(viaTag.body.data.programs[0].goal).toBe('Endurance base');
  });

  test('treats regex metacharacters in search as literal text', async () => {
    await createProgram({ goal: 'Conditioning plan' });

    // An unescaped "[" would reach MongoDB as an invalid pattern and throw.
    const res = await request(app).get('/api/programs?search=%5B');

    expect(res.status).toBe(200);
    expect(res.body.data.programs).toEqual([]);
    expect(res.body.data.pagination.total).toBe(0);
  });

  test('applies a field projection', async () => {
    await createProgram({ goal: 'Strength plan' });

    const res = await request(app).get('/api/programs?fields=goal,lengthDays');

    expect(res.status).toBe(200);
    const [program] = res.body.data.programs;
    expect(program.goal).toBe('Strength plan');
    expect(program.lengthDays).toBe(3);
    expect(program).not.toHaveProperty('tags');
    expect(program).not.toHaveProperty('day');
  });

  test('does not leak the version key', async () => {
    await createProgram();

    const res = await request(app).get('/api/programs');

    expect(res.body.data.programs[0]).not.toHaveProperty('__v');
  });

  test.each([
    ['limit above the maximum', '/api/programs?limit=51', 'limit'],
    ['a non-numeric page', '/api/programs?page=abc', 'page'],
    ['an unsupported difficulty', '/api/programs?difficulty=extreme', 'difficulty'],
    ['an unsupported sort field', '/api/programs?sort=price', 'sort'],
  ])('rejects %s with the standard error envelope', async (_label, url, field) => {
    const res = await request(app).get(url);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid request');
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(res.body.details.map((d) => d.path)).toContain(field);
  });
});

describe('GET /api/programs/:id (detail)', () => {
  test('returns the program with populated exercise references', async () => {
    const exercise = await Exercise.create({
      name: 'Barbell Bench Press',
      muscleGroup: 'chest',
      equipment: 'barbell',
      image: 'https://cdn.example.com/bench.png',
    });

    const program = await createProgram({
      day: [
        {
          dayNumber: 1,
          focus: 'Push',
          exercises: [
            {
              exerciseId: exercise._id,
              sets: 3,
              reps: 10,
              restSeconds: 60,
              notes: 'Warm up first',
            },
          ],
        },
      ],
    });

    const res = await request(app).get(`/api/programs/${program._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const [slot] = res.body.data.program.day[0].exercises;
    expect(slot.exerciseId).toMatchObject({
      name: 'Barbell Bench Press',
      muscleGroup: 'chest',
      equipment: 'barbell',
      image: 'https://cdn.example.com/bench.png',
    });
    expect(slot).toMatchObject({ sets: 3, reps: 10, restSeconds: 60, notes: 'Warm up first' });
  });

  test('returns days ordered by day number', async () => {
    const program = await createProgram({
      day: [
        { dayNumber: 3, focus: 'Legs', exercises: [] },
        { dayNumber: 1, focus: 'Push', exercises: [] },
        { dayNumber: 2, focus: 'Pull', exercises: [] },
      ],
    });

    const res = await request(app).get(`/api/programs/${program._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.program.day.map((d) => d.dayNumber)).toEqual([1, 2, 3]);
    expect(res.body.data.program.day.map((d) => d.focus)).toEqual(['Push', 'Pull', 'Legs']);
  });

  test('returns the program even when an exercise reference is dangling', async () => {
    const program = await createProgram({
      day: [
        {
          dayNumber: 1,
          focus: 'Push',
          exercises: [{ exerciseId: new mongoose.Types.ObjectId(), sets: 3, reps: 10 }],
        },
      ],
    });

    const res = await request(app).get(`/api/programs/${program._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.program.day[0].exercises[0].exerciseId).toBeNull();
  });

  test('does not leak the version key', async () => {
    const program = await createProgram();

    const res = await request(app).get(`/api/programs/${program._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.program).not.toHaveProperty('__v');
  });

  test('returns 404 for a valid but unknown id', async () => {
    const res = await request(app).get(
      `/api/programs/${new mongoose.Types.ObjectId().toString()}`
    );

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, error: 'Program not found' });
  });

  test('returns 400 for a malformed id', async () => {
    const res = await request(app).get('/api/programs/not-a-valid-object-id');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid request');
    expect(res.body.details.map((d) => d.path)).toContain('id');
  });
});
