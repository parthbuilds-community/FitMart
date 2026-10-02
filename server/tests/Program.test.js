/**
 * Unit tests for the Program model (server/models/Program.js).
 *
 * These cover the schema structure from #984 plus the validation rules and
 * indexes from #985. mongodb-memory-server is used so the cross-field
 * validators and `Program.collection.indexes()` are exercised against a real
 * MongoDB instance rather than a stub.
 *
 * Run with: npx jest tests/Program.test.js
 */

const fs = require('fs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Program = require('../models/Program');

let mongoServer;

// Same convention as cart.reserved.test.js: prefer a locally installed Windows
// binary when present, otherwise let mongodb-memory-server fetch its own.
const WINDOWS_MONGOD_PATH = 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';

beforeAll(async () => {
  if (process.platform === 'win32' && fs.existsSync(WINDOWS_MONGOD_PATH)) {
    process.env.MONGOMS_SYSTEM_BINARY = WINDOWS_MONGOD_PATH;
  }

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Ensure autoIndex has finished before any test inspects the collection.
  await Program.init();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Program.deleteMany({});
});

// A valid exercise slot. The ObjectId does not need to resolve to a real
// Exercise document — the schema only validates that the reference is a
// well-formed ObjectId.
function makeExercise(overrides = {}) {
  return {
    exerciseId: new mongoose.Types.ObjectId(),
    sets: 3,
    reps: 10,
    restSeconds: 60,
    notes: '',
    ...overrides,
  };
}

function makeDay(dayNumber = 1, overrides = {}) {
  return {
    dayNumber,
    focus: 'Push',
    exercises: [makeExercise()],
    ...overrides,
  };
}

// Build a valid in-memory document; each test overrides only the field it cares
// about. Nothing is written to Mongo until `.save()` is called.
function validProgram(overrides = {}) {
  return new Program({
    goal: 'Build full body strength',
    difficulty: 'beginner',
    lengthDays: 1,
    day: [makeDay(1)],
    tags: ['strength'],
    ...overrides,
  });
}

// Assert `doc.validate()` rejects and that the failure is attributed to `path`.
// Nested subdocument paths report as e.g. `day.0.dayNumber`, so a plain prefix
// match is used rather than strict equality.
async function expectValidationError(doc, path) {
  let error;
  try {
    await doc.validate();
  } catch (err) {
    error = err;
  }

  expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
  const failingPaths = Object.keys(error.errors);
  expect(failingPaths.some((p) => p === path || p.startsWith(`${path}.`))).toBe(true);
}

describe('Program model', () => {
  describe('successful creation', () => {
    test('persists a valid program with its defaults and timestamps', async () => {
      const program = await validProgram().save();

      expect(program._id).toBeDefined();
      expect(program.goal).toBe('Build full body strength');
      expect(program.difficulty).toBe('beginner');
      expect(program.lengthDays).toBe(1);
      expect(program.day).toHaveLength(1);
      expect(program.day[0].dayNumber).toBe(1);
      expect(program.day[0].exercises).toHaveLength(1);
      expect(program.image).toBe('');
      expect(program.createdAt).toBeInstanceOf(Date);
      expect(program.updatedAt).toBeInstanceOf(Date);

      const stored = await Program.findById(program._id);
      expect(stored).not.toBeNull();
      expect(stored.goal).toBe('Build full body strength');
    });

    test('accepts the boundary values lengthDays 1 and 90', async () => {
      const days = (count, from = 1) =>
        Array.from({ length: count }, (_, index) => makeDay(from + index));

      const oneDay = await validProgram({
        goal: 'Single day strength plan',
        lengthDays: 1,
        day: days(1),
      }).save();
      expect(oneDay.lengthDays).toBe(1);

      const ninetyDays = await validProgram({
        goal: 'Ninety day strength plan',
        lengthDays: 90,
        day: days(90),
      }).save();
      expect(ninetyDays.day).toHaveLength(90);
      expect(ninetyDays.lengthDays).toBe(90);
    });

    test('accepts every supported difficulty', async () => {
      for (const difficulty of ['beginner', 'intermediate', 'advanced']) {
        const program = await validProgram({ difficulty, goal: `${difficulty} strength plan` }).save();
        expect(program.difficulty).toBe(difficulty);
      }
    });
  });

  describe('required fields', () => {
    test('rejects a program without a goal', async () => {
      await expectValidationError(validProgram({ goal: undefined }), 'goal');
    });

    test('rejects a program without a difficulty', async () => {
      await expectValidationError(validProgram({ difficulty: undefined }), 'difficulty');
    });

    test('rejects a program without a lengthDays', async () => {
      await expectValidationError(validProgram({ lengthDays: undefined }), 'lengthDays');
    });

    test('rejects a program without any days', async () => {
      await expectValidationError(validProgram({ day: undefined }), 'day');
    });

    test('rejects a program with an empty day array', async () => {
      await expectValidationError(validProgram({ day: [] }), 'day');
    });

    test('rejects a day without a day number', async () => {
      const doc = validProgram({ day: [makeDay(null)] });
      await expectValidationError(doc, 'day');
    });
  });

  describe('difficulty enum', () => {
    test('rejects an unsupported difficulty', async () => {
      const doc = validProgram({ difficulty: 'extreme' });
      await expectValidationError(doc, 'difficulty');
    });

    test('rejects a difficulty that only differs by case', async () => {
      const doc = validProgram({ difficulty: 'Beginner' });
      await expectValidationError(doc, 'difficulty');
    });
  });

  describe('lengthDays bounds', () => {
    test.each([
      ['zero', 0],
      ['negative', -5],
      ['above the maximum', 91],
    ])('rejects %s days', async (_label, value) => {
      const doc = validProgram({ lengthDays: value, day: [makeDay(1)] });
      await expectValidationError(doc, 'lengthDays');
    });
  });

  describe('lengthDays versus the day array', () => {
    test('rejects when lengthDays is larger than the number of days', async () => {
      const doc = validProgram({ lengthDays: 5, day: [makeDay(1)] });
      await expectValidationError(doc, 'day');
    });

    test('rejects when lengthDays is smaller than the number of days', async () => {
      const doc = validProgram({ lengthDays: 1, day: [makeDay(1), makeDay(2)] });
      await expectValidationError(doc, 'day');
    });

    test('accepts when lengthDays matches the number of days', async () => {
      const doc = validProgram({ lengthDays: 2, day: [makeDay(1), makeDay(2)] });
      await expect(doc.validate()).resolves.toBeUndefined();
    });
  });

  describe('day numbers', () => {
    test('rejects duplicate day numbers', async () => {
      const doc = validProgram({ lengthDays: 2, day: [makeDay(1), makeDay(1)] });
      await expectValidationError(doc, 'day');
    });

    test('accepts unique day numbers', async () => {
      const doc = validProgram({ lengthDays: 3, day: [makeDay(1), makeDay(2), makeDay(3)] });
      await expect(doc.validate()).resolves.toBeUndefined();
    });
  });

  describe('exercises', () => {
    test('rejects a day with no exercises', async () => {
      const doc = validProgram({ day: [makeDay(1, { exercises: [] })] });
      await expectValidationError(doc, 'day');
    });

    test('rejects an exercise slot without an exerciseId', async () => {
      const doc = validProgram({
        day: [makeDay(1, { exercises: [makeExercise({ exerciseId: undefined })] })],
      });
      await expectValidationError(doc, 'day');
    });

    test('rejects a malformed exerciseId reference', async () => {
      const doc = validProgram({
        day: [makeDay(1, { exercises: [makeExercise({ exerciseId: 'not-an-object-id' })] })],
      });
      await expectValidationError(doc, 'day');
    });

    test('accepts a well-formed reference even when it is dangling', async () => {
      const doc = validProgram({
        day: [makeDay(1, { exercises: [makeExercise({ exerciseId: new mongoose.Types.ObjectId() })] })],
      });
      await expect(doc.validate()).resolves.toBeUndefined();
    });
  });

  describe('tags', () => {
    test('trims, lowercases and drops empty tags', async () => {
      const program = await validProgram({
        tags: ['  Strength  ', 'FULL-BODY', '', '   '],
      }).save();

      expect(program.tags).toEqual(['strength', 'full-body']);
    });

    test('defaults to an empty tag list', async () => {
      const program = await validProgram({ tags: undefined }).save();
      expect(program.tags).toEqual([]);
    });

    test('rejects more than ten tags', async () => {
      const doc = validProgram({ tags: Array.from({ length: 11 }, (_, i) => `tag-${i}`) });
      await expectValidationError(doc, 'tags');
    });

    test('accepts exactly ten tags', async () => {
      const doc = validProgram({ tags: Array.from({ length: 10 }, (_, i) => `tag-${i}`) });
      await expect(doc.validate()).resolves.toBeUndefined();
    });
  });

  describe('goal lengths', () => {
    test('rejects a goal shorter than five characters', async () => {
      await expectValidationError(validProgram({ goal: 'Gain' }), 'goal');
    });

    test('rejects a goal longer than 120 characters', async () => {
      await expectValidationError(validProgram({ goal: 'a'.repeat(121) }), 'goal');
    });
  });

  describe('indexes', () => {
    test('declares the expected indexes on the collection', async () => {
      await Program.init();
      const indexes = await Program.collection.indexes();

      const keys = indexes.map((index) => JSON.stringify(index.key));
      expect(keys).toEqual(
        expect.arrayContaining([
          JSON.stringify({ _id: 1 }),
          JSON.stringify({ difficulty: 1, createdAt: -1 }),
          JSON.stringify({ tags: 1 }),
          JSON.stringify({ goal: 1 }),
          JSON.stringify({ goal: 1, difficulty: 1 }),
        ])
      );
    });

    test('enforces the unique goal + difficulty index', async () => {
      await validProgram().save();
      await expect(validProgram().save()).rejects.toThrow(/duplicate key/i);
    });
  });
});
