/**
 * Automated tests for Program and Exercise Seed Data (Issue #987)
 *
 * Uses mongodb-memory-server to spin up an in-memory MongoDB instance,
 * verifying:
 * - All 6 recommended programs are seeded with exact durations
 * - 30 realistic exercises are seeded across all muscle groups
 * - Complete day-by-day schedules (total 210 days) with 4-8 exercises per day
 * - All exercise references resolve to valid Exercise documents
 * - Seeding is fully idempotent across Products, Exercises, and Programs
 * - Mongoose schema validation and index compliance
 * - Population compatibility with GET /api/programs/:id
 */

const fs = require('fs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Product = require('../models/Product');
const Exercise = require('../models/Exercise');
const Program = require('../models/Program');
const {
  seedProducts,
  seedExercises,
  seedPrograms,
  PRODUCTS,
  EXERCISES,
} = require('../seed');

let mongoServer;

beforeAll(async () => {
  const WINDOWS_MONGOD_PATH = 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';
  if (process.platform === 'win32' && fs.existsSync(WINDOWS_MONGOD_PATH)) {
    process.env.MONGOMS_SYSTEM_BINARY = WINDOWS_MONGOD_PATH;
  }
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Issue #987: Program Seed Data Creation', () => {
  beforeEach(async () => {
    await Product.deleteMany({});
    await Exercise.deleteMany({});
    await Program.deleteMany({});
  });

  describe('Product Seeding (Preservation & Idempotency)', () => {
    test('seeds all 21 original products with valid attributes', async () => {
      const seeded = await seedProducts();
      expect(seeded).toHaveLength(21);

      const count = await Product.countDocuments();
      expect(count).toBe(21);

      const first = await Product.findOne({ productId: 1 });
      expect(first).not.toBeNull();
      expect(first.name).toBe('Adjustable Dumbbell Set');
      expect(first.price).toBe(15999);
    });

    test('re-running seedProducts does not duplicate products', async () => {
      await seedProducts();
      await seedProducts();

      const count = await Product.countDocuments();
      expect(count).toBe(21);
    });
  });

  describe('Exercise Seeding', () => {
    test('seeds 30 distinct exercises across all major muscle groups', async () => {
      const map = await seedExercises();
      expect(map.size).toBe(30);

      const count = await Exercise.countDocuments();
      expect(count).toBe(30);

      const distinctGroups = await Exercise.distinct('muscleGroup');
      expect(distinctGroups.sort()).toEqual(
        ['arms', 'back', 'cardio', 'chest', 'core', 'legs', 'mobility', 'shoulders'].sort()
      );
    });

    test('re-running seedExercises is idempotent and preserves document IDs', async () => {
      const mapFirst = await seedExercises();
      const mapSecond = await seedExercises();

      expect(mapSecond.size).toBe(30);
      const count = await Exercise.countDocuments();
      expect(count).toBe(30);

      for (const [name, id] of mapFirst.entries()) {
        expect(mapSecond.get(name).toString()).toBe(id.toString());
      }
    });
  });

  describe('Program Seeding (All 6 Programs & Schedule Invariants)', () => {
    test('seeds all 6 recommended programs with exact durations matching Issue #987', async () => {
      const exerciseMap = await seedExercises();
      const programs = await seedPrograms(exerciseMap);

      expect(programs).toHaveLength(6);

      const expectedDurations = {
        'Foundation Fitness: 4-Week Total Body Conditioning': { difficulty: 'beginner', lengthDays: 28 },
        'Strength Builder: 6-Week Progressive Overload Program': { difficulty: 'intermediate', lengthDays: 42 },
        'Cardio Endurance: 5-Week Stamina and Aerobic Conditioning': { difficulty: 'intermediate', lengthDays: 35 },
        'Flexibility & Mobility: 4-Week Functional Joint Health': { difficulty: 'beginner', lengthDays: 28 },
        'Advanced Shred: 8-Week High-Intensity Fat Loss & Definition': { difficulty: 'advanced', lengthDays: 56 },
        'Core & Balance: 3-Week Stability and Postural Control': { difficulty: 'beginner', lengthDays: 21 },
      };

      for (const prog of programs) {
        const expected = expectedDurations[prog.goal];
        expect(expected).toBeDefined();
        expect(prog.difficulty).toBe(expected.difficulty);
        expect(prog.lengthDays).toBe(expected.lengthDays);
        expect(prog.day).toHaveLength(expected.lengthDays);
      }
    });

    test('verifies total days across all programs equals 210 with 4-8 exercises per day', async () => {
      const exerciseMap = await seedExercises();
      const programs = await seedPrograms(exerciseMap);

      let totalDays = 0;
      for (const prog of programs) {
        totalDays += prog.day.length;

        prog.day.forEach((d, idx) => {
          // Day number is contiguous 1..lengthDays
          expect(d.dayNumber).toBe(idx + 1);
          expect(d.focus).toBeTruthy();

          // 4 to 8 exercises per scheduled day requirement
          expect(d.exercises.length).toBeGreaterThanOrEqual(4);
          expect(d.exercises.length).toBeLessThanOrEqual(8);

          // Exercise slot prescription fields
          d.exercises.forEach((ex) => {
            expect(ex.exerciseId).toBeDefined();
            expect(mongoose.Types.ObjectId.isValid(ex.exerciseId)).toBe(true);
            expect(typeof ex.sets).toBe('number');
            expect(typeof ex.reps).toBe('number');
            expect(typeof ex.restSeconds).toBe('number');
            expect(typeof ex.notes).toBe('string');
          });
        });
      }

      expect(totalDays).toBe(210);
    });

    test('every referenced exerciseId resolves to a real Exercise document in the database', async () => {
      const exerciseMap = await seedExercises();
      const programs = await seedPrograms(exerciseMap);

      const allReferencedIds = new Set();
      for (const prog of programs) {
        for (const d of prog.day) {
          for (const slot of d.exercises) {
            allReferencedIds.add(slot.exerciseId.toString());
          }
        }
      }

      const foundExercises = await Exercise.find({
        _id: { $in: Array.from(allReferencedIds) },
      });

      expect(foundExercises.length).toBe(allReferencedIds.size);
    });

    test('program seeding is fully idempotent on repeated runs', async () => {
      const exerciseMap = await seedExercises();

      await seedPrograms(exerciseMap);
      const firstCount = await Program.countDocuments();
      expect(firstCount).toBe(6);

      // Run seeding a second time
      await seedPrograms(exerciseMap);
      const secondCount = await Program.countDocuments();
      expect(secondCount).toBe(6);

      // Verify no duplicate keys or damaged schedules
      const all = await Program.find();
      expect(all).toHaveLength(6);
      for (const p of all) {
        expect(p.day.length).toBe(p.lengthDays);
      }
    });

    test('program detail population works as expected by GET /api/programs/:id', async () => {
      const exerciseMap = await seedExercises();
      const programs = await seedPrograms(exerciseMap);
      const targetProgram = programs[0];

      const populated = await Program.findById(targetProgram._id)
        .select('-__v')
        .populate({
          path: 'day.exercises.exerciseId',
          select: 'name muscleGroup equipment image',
        })
        .lean();

      expect(populated).not.toBeNull();
      expect(populated.day[0].exercises[0].exerciseId).toHaveProperty('name');
      expect(populated.day[0].exercises[0].exerciseId).toHaveProperty('muscleGroup');
      expect(populated.day[0].exercises[0].exerciseId).toHaveProperty('equipment');
      expect(populated.day[0].exercises[0].exerciseId).toHaveProperty('image');
    });

    test('membership price sub-document is present for enrolment compatibility (#1025)', async () => {
      const exerciseMap = await seedExercises();
      const programs = await seedPrograms(exerciseMap);

      for (const prog of programs) {
        expect(prog.price).toBeDefined();
        expect(typeof prog.price.amount).toBe('number');
        expect(prog.price.currency).toBe('INR');
        expect(prog.price.interval).toBe('one-time');
        expect(prog.price.periodDays).toBe(prog.lengthDays);
      }
    });
  });

  describe('Mongoose Schema Validation Edge Cases', () => {
    test('rejects program when day.length does not match lengthDays', async () => {
      const exerciseMap = await seedExercises();
      const exId = Array.from(exerciseMap.values())[0];

      const invalidProgram = new Program({
        goal: 'Mismatched Days Program',
        difficulty: 'beginner',
        lengthDays: 5,
        day: [
          {
            dayNumber: 1,
            focus: 'Day 1',
            exercises: [{ exerciseId: exId, sets: 3, reps: 10, restSeconds: 60 }],
          },
        ],
      });

      let error;
      try {
        await invalidProgram.validate();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['day'].message).toMatch(/lengthDays must match the number of day entries/);
    });

    test('rejects unsupported difficulty string', async () => {
      const invalidProgram = new Program({
        goal: 'Invalid Difficulty Program',
        difficulty: 'extreme',
        lengthDays: 1,
        day: [
          {
            dayNumber: 1,
            focus: 'Day 1',
            exercises: [{ exerciseId: new mongoose.Types.ObjectId(), sets: 3, reps: 10, restSeconds: 60 }],
          },
        ],
      });

      let error;
      try {
        await invalidProgram.validate();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['difficulty'].message).toMatch(/extreme is not a supported difficulty/);
    });
  });
});
