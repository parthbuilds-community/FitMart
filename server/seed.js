require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Exercise = require('./models/Exercise');
const Program = require('./models/Program');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI missing in server/.env — please add your connection string with password replaced');
  process.exit(1);
}

const PRODUCTS = [
  {
    productId: 1,
    name: 'Adjustable Dumbbell Set',
    brand: 'PowerFlex',
    category: 'Equipment',
    price: 15999,
    originalPrice: 17999,
    rating: 4.8,
    reviews: 214,
    badge: 'Best Seller',
    image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSS1FadeaSIlLechl5PE2tgT7CQRhmGjdOcb5RFz01v4peREYrgmWi9_-Q4i7z8pw1V8uaxYBTHr9Id3WZClayDXQDFJ24JgPWB678qfUfPT52cl5BDvxmQFw0',
    stock: 25,
    reserved: 3
  },
  {
    productId: 2,
    name: 'Whey Protein Isolate',
    brand: 'NutriCore',
    category: 'Nutrition',
    price: 3299,
    originalPrice: 3999,
    rating: 4.9,
    reviews: 531,
    badge: 'Verified',
    image: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/msc/msc71758/l/9.jpg',
    stock: 120,
    reserved: 15
  },
  {
    productId: 3,
    name: 'Resistance Band Kit',
    brand: 'FlexBand',
    category: 'Equipment',
    price: 1499,
    originalPrice: null,
    rating: 4.7,
    reviews: 88,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71-87y93B+L._AC_UF894,1000_QL80_.jpg',
    stock: 75,
    reserved: 8
  },
  {
    productId: 4,
    name: 'Creatine Monohydrate',
    brand: 'NutriCore',
    category: 'Nutrition',
    price: 1899,
    originalPrice: 2299,
    rating: 4.8,
    reviews: 312,
    badge: 'Verified',
    image: 'https://m.media-amazon.com/images/I/61kotip5wIL._AC_UF1000,1000_QL80_.jpg',
    stock: 90,
    reserved: 12
  },
  {
    productId: 5,
    name: 'Smart Fitness Watch',
    brand: 'VitalSync',
    category: 'Wearables',
    price: 7999,
    originalPrice: 9499,
    rating: 4.6,
    reviews: 167,
    badge: 'New',
    image: 'https://m.media-amazon.com/images/I/61Bugm3Wo+L.jpg',
    stock: 30,
    reserved: 5
  },
  {
    productId: 6,
    name: 'Yoga Mat Pro',
    brand: 'ZenFlow',
    category: 'Equipment',
    price: 2199,
    originalPrice: null,
    rating: 4.7,
    reviews: 95,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/61KZlPKYscL._AC_UF894,1000_QL80_.jpg',
    stock: 50,
    reserved: 4
  },
  {
    productId: 7,
    name: 'Pre-Workout Formula',
    brand: 'NutriCore',
    category: 'Nutrition',
    price: 2599,
    originalPrice: 2999,
    rating: 4.5,
    reviews: 78,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/81iTFIGL+2L._AC_UF1000,1000_QL80_.jpg',
    stock: 65,
    reserved: 7
  },
  {
    productId: 8,
    name: 'Pull-Up Bar',
    brand: 'IronGrip',
    category: 'Equipment',
    price: 3499,
    originalPrice: null,
    rating: 4.8,
    reviews: 203,
    badge: 'Best Seller',
    image: 'https://m.media-amazon.com/images/I/519Am+Kv0SL._AC_UF894,1000_QL80_.jpg',
    stock: 40,
    reserved: 6
  },
  // New products — mixed order below (Equipment, Nutrition, Wearables)
  {
    productId: 9,
    name: 'Mass Gainer',
    brand: 'NutriCore',
    category: 'Nutrition',
    price: 1999,
    originalPrice: 2499,
    rating: 4.6,
    reviews: 142,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/81yO3KZaVwL._AC_UF1000,1000_QL80_.jpg',
    stock: 85,
    reserved: 9
  },
  {
    productId: 10,
    name: 'Smart Weighing Scale',
    brand: 'VitalSync',
    category: 'Wearables',
    price: 2999,
    originalPrice: 3899,
    rating: 4.7,
    reviews: 176,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/61qnZr5wNEL._AC_UF1000,1000_QL80_.jpg',
    stock: 45,
    reserved: 6
  },
  {
    productId: 11,
    name: 'Kettlebell Set',
    brand: 'PowerFlex',
    category: 'Equipment',
    price: 3499,
    originalPrice: 4299,
    rating: 4.8,
    reviews: 198,
    badge: 'New',
    image: 'https://m.media-amazon.com/images/I/51rxJuWKj8L._AC_UF1000,1000_QL80_.jpg',
    stock: 35,
    reserved: 5
  },
  {
    productId: 12,
    name: 'BCAA',
    brand: 'NutriCore',
    category: 'Nutrition',
    price: 1499,
    originalPrice: 1799,
    rating: 4.5,
    reviews: 89,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71V6aLnMa-L._AC_UF1000,1000_QL80_.jpg',
    stock: 70,
    reserved: 8
  },
  {
    productId: 13,
    name: 'Posture Corrector',
    brand: 'FlexBand',
    category: 'Wearables',
    price: 1099,
    originalPrice: 1399,
    rating: 4.4,
    reviews: 121,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71LBWJp+wQL._AC_UF1000,1000_QL80_.jpg',
    stock: 60,
    reserved: 7
  },
  {
    productId: 14,
    name: 'Foam Roller',
    brand: 'ZenFlow',
    category: 'Equipment',
    price: 1299,
    originalPrice: 1799,
    rating: 4.6,
    reviews: 143,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71K7Uj+rEaL._AC_UF1000,1000_QL80_.jpg',
    stock: 55,
    reserved: 6
  },
  {
    productId: 15,
    name: 'Multivitamin Tablets',
    brand: 'HealthCore',
    category: 'Nutrition',
    price: 449,
    originalPrice: null,
    rating: 4.7,
    reviews: 267,
    badge: 'Verified',
    image: 'https://m.media-amazon.com/images/I/81HtCNMTIkL._AC_UF1000,1000_QL80_.jpg',
    stock: 200,
    reserved: 20
  },
  {
    productId: 16,
    name: 'Full Compression Wear Set',
    brand: 'FlexBand',
    category: 'Wearables',
    price: 1999,
    originalPrice: 2599,
    rating: 4.5,
    reviews: 98,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71jCRV2qJyL._AC_UF1000,1000_QL80_.jpg',
    stock: 50,
    reserved: 5
  },
  {
    productId: 17,
    name: 'Skipping Rope',
    brand: 'PowerFlex',
    category: 'Equipment',
    price: 499,
    originalPrice: null,
    rating: 4.8,
    reviews: 312,
    badge: 'Best Seller',
    image: 'https://m.media-amazon.com/images/I/51D9NpFkFfL._AC_UF1000,1000_QL80_.jpg',
    stock: 120,
    reserved: 12
  },
  {
    productId: 18,
    name: 'Fish Oil',
    brand: 'HealthCore',
    category: 'Nutrition',
    price: 899,
    originalPrice: 1199,
    rating: 4.6,
    reviews: 156,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71qX1PCmZsL._AC_UF1000,1000_QL80_.jpg',
    stock: 95,
    reserved: 10
  },
  {
    productId: 19,
    name: 'GPS Running Watch',
    brand: 'VitalSync',
    category: 'Wearables',
    price: 9999,
    originalPrice: 12999,
    rating: 4.7,
    reviews: 134,
    badge: 'New',
    image: 'https://m.media-amazon.com/images/I/71BtXLqr-JL._AC_UF1000,1000_QL80_.jpg',
    stock: 25,
    reserved: 3
  },
  {
    productId: 20,
    name: 'Adjustable Bench',
    brand: 'IronGrip',
    category: 'Equipment',
    price: 4999,
    originalPrice: 6499,
    rating: 4.8,
    reviews: 189,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71F7Qz2pynL._AC_UF1000,1000_QL80_.jpg',
    stock: 30,
    reserved: 4
  },
  {
    productId: 21,
    name: 'Peanut Butter',
    brand: 'NutriCore',
    category: 'Nutrition',
    price: 399,
    originalPrice: null,
    rating: 4.9,
    reviews: 445,
    badge: 'Best Seller',
    image: 'https://m.media-amazon.com/images/I/81L9aVlIYeL._AC_UF1000,1000_QL80_.jpg',
    stock: 150,
    reserved: 18
  },
];

// ── Exercise catalogue ─────────────────────────────────────────────────────
// Program days reference these by `_id`, so they must exist before the programs
// are written. `name` is the natural lookup key for upserts.
const EXERCISES = [
  { name: 'Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'chest', equipment: 'dumbbell' },
  { name: 'Cable Crossover', muscleGroup: 'chest', equipment: 'cable' },
  { name: 'Push-Ups', muscleGroup: 'chest', equipment: 'bodyweight' },
  { name: 'Dumbbell Flyes', muscleGroup: 'chest', equipment: 'dumbbell' },
  { name: 'Barbell Row', muscleGroup: 'back', equipment: 'barbell' },
  { name: 'Lat Pulldown', muscleGroup: 'back', equipment: 'cable' },
  { name: 'Pull-Ups', muscleGroup: 'back', equipment: 'bodyweight' },
  { name: 'Seated Cable Row', muscleGroup: 'back', equipment: 'cable' },
  { name: 'Face Pulls', muscleGroup: 'back', equipment: 'cable' },
  { name: 'Overhead Press', muscleGroup: 'shoulders', equipment: 'barbell' },
  { name: 'Dumbbell Lateral Raise', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { name: 'Front Raise', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { name: 'Rear Delt Flyes', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { name: 'Bicep Curls', muscleGroup: 'arms', equipment: 'dumbbell' },
  { name: 'Hammer Curls', muscleGroup: 'arms', equipment: 'dumbbell' },
  { name: 'Tricep Pushdowns', muscleGroup: 'arms', equipment: 'cable' },
  { name: 'Overhead Tricep Extension', muscleGroup: 'arms', equipment: 'dumbbell' },
  { name: 'Plank', muscleGroup: 'core', equipment: 'bodyweight' },
  { name: 'Russian Twists', muscleGroup: 'core', equipment: 'bodyweight' },
  { name: 'Leg Raises', muscleGroup: 'core', equipment: 'bodyweight' },
  { name: 'Squat', muscleGroup: 'legs', equipment: 'barbell' },
  { name: 'Romanian Deadlift', muscleGroup: 'legs', equipment: 'barbell' },
  { name: 'Leg Press', muscleGroup: 'legs', equipment: 'machine' },
  { name: 'Walking Lunges', muscleGroup: 'legs', equipment: 'bodyweight' },
  { name: 'Leg Curls', muscleGroup: 'legs', equipment: 'machine' },
  { name: 'Calf Raises', muscleGroup: 'legs', equipment: 'bodyweight' },
  { name: 'Jumping Jacks', muscleGroup: 'cardio', equipment: 'bodyweight' },
  { name: 'Burpees', muscleGroup: 'cardio', equipment: 'bodyweight' },
  { name: 'Mountain Climbers', muscleGroup: 'cardio', equipment: 'bodyweight' },
  { name: 'High Knees', muscleGroup: 'cardio', equipment: 'bodyweight' },
  { name: 'Skipping Rope', muscleGroup: 'cardio', equipment: 'rope' },
  { name: 'Jump Squats', muscleGroup: 'cardio', equipment: 'bodyweight' },
  { name: 'Butt Kicks', muscleGroup: 'cardio', equipment: 'bodyweight' },
  { name: 'Child Pose', muscleGroup: 'mobility', equipment: 'bodyweight' },
  { name: 'Cat-Cow Stretch', muscleGroup: 'mobility', equipment: 'bodyweight' },
  { name: 'Hip Flexor Stretch', muscleGroup: 'mobility', equipment: 'bodyweight' },
  { name: 'World Greatest Stretch', muscleGroup: 'mobility', equipment: 'bodyweight' },
  { name: 'Foam Rolling', muscleGroup: 'mobility', equipment: 'foam roller' },
  { name: 'Downward Dog', muscleGroup: 'mobility', equipment: 'bodyweight' },
  { name: 'Bird Dog', muscleGroup: 'mobility', equipment: 'bodyweight' },
  { name: 'Dead Bug', muscleGroup: 'core', equipment: 'bodyweight' },
  { name: 'Side Plank', muscleGroup: 'core', equipment: 'bodyweight' },
  { name: 'Bicycle Crunches', muscleGroup: 'core', equipment: 'bodyweight' },
  { name: 'Glute Bridge', muscleGroup: 'legs', equipment: 'bodyweight' },
  { name: 'Bulgarian Split Squat', muscleGroup: 'legs', equipment: 'dumbbell' },
  { name: 'Step-Ups', muscleGroup: 'legs', equipment: 'bodyweight' },
  { name: 'Box Jumps', muscleGroup: 'cardio', equipment: 'bodyweight' },
  { name: 'Kettlebell Swing', muscleGroup: 'cardio', equipment: 'kettlebell' },
  { name: 'Battle Ropes', muscleGroup: 'cardio', equipment: 'rope' },
  { name: 'Jumping Lunges', muscleGroup: 'cardio', equipment: 'bodyweight' },
];

const PROGRAMS = [
  {
    goal: 'Foundation Fitness', difficulty: 'beginner', lengthDays: 28, tags: ['beginner', 'health'],
    day: Array.from({ length: 28 }, (_, i) => ({
      dayNumber: i + 1,
      focus: 'General Conditioning',
      exercises: [
        { exerciseName: 'Push-Ups', sets: 3, reps: 10, restSeconds: 60 },
        { exerciseName: 'Squat', sets: 3, reps: 12, restSeconds: 60 },
        { exerciseName: 'Plank', sets: 3, reps: 1, restSeconds: 30 },
        { exerciseName: 'Jumping Jacks', sets: 3, reps: 30, restSeconds: 30 }
      ]
    }))
  },
  {
    goal: 'Strength Builder', difficulty: 'intermediate', lengthDays: 42, tags: ['strength'],
    day: Array.from({ length: 42 }, (_, i) => ({
      dayNumber: i + 1,
      focus: 'Strength',
      exercises: [
        { exerciseName: 'Squat', sets: 4, reps: 8, restSeconds: 90 },
        { exerciseName: 'Barbell Bench Press', sets: 4, reps: 8, restSeconds: 90 },
        { exerciseName: 'Barbell Row', sets: 4, reps: 8, restSeconds: 90 },
        { exerciseName: 'Overhead Press', sets: 3, reps: 10, restSeconds: 60 }
      ]
    }))
  },
  {
    goal: 'Cardio Endurance', difficulty: 'intermediate', lengthDays: 35, tags: ['cardio'],
    day: Array.from({ length: 35 }, (_, i) => ({
      dayNumber: i + 1,
      focus: 'Endurance',
      exercises: [
        { exerciseName: 'Jumping Jacks', sets: 3, reps: 50, restSeconds: 30 },
        { exerciseName: 'Burpees', sets: 3, reps: 12, restSeconds: 45 },
        { exerciseName: 'Mountain Climbers', sets: 3, reps: 30, restSeconds: 30 },
        { exerciseName: 'High Knees', sets: 3, reps: 40, restSeconds: 30 }
      ]
    }))
  },
  {
    goal: 'Flexibility & Mobility', difficulty: 'beginner', lengthDays: 28, tags: ['mobility'],
    day: Array.from({ length: 28 }, (_, i) => ({
      dayNumber: i + 1,
      focus: 'Mobility',
      exercises: [
        { exerciseName: 'Child Pose', sets: 1, reps: 1, restSeconds: 0 },
        { exerciseName: 'Cat-Cow Stretch', sets: 2, reps: 10, restSeconds: 20 },
        { exerciseName: 'Hip Flexor Stretch', sets: 2, reps: 1, restSeconds: 30 },
        { exerciseName: 'Downward Dog', sets: 2, reps: 1, restSeconds: 30 }
      ]
    }))
  },
  {
    goal: 'Advanced Shred', difficulty: 'advanced', lengthDays: 56, tags: ['fat-loss'],
    day: Array.from({ length: 56 }, (_, i) => ({
      dayNumber: i + 1,
      focus: 'Shred',
      exercises: [
        { exerciseName: 'Burpees', sets: 5, reps: 15, restSeconds: 45 },
        { exerciseName: 'Kettlebell Swing', sets: 4, reps: 20, restSeconds: 60 },
        { exerciseName: 'Battle Ropes', sets: 4, reps: 1, restSeconds: 30 },
        { exerciseName: 'Jumping Lunges', sets: 4, reps: 12, restSeconds: 45 }
      ]
    }))
  },
  {
    goal: 'Core & Balance', difficulty: 'beginner', lengthDays: 21, tags: ['core'],
    day: Array.from({ length: 21 }, (_, i) => ({
      dayNumber: i + 1,
      focus: 'Core',
      exercises: [
        { exerciseName: 'Plank', sets: 3, reps: 1, restSeconds: 30 },
        { exerciseName: 'Side Plank', sets: 2, reps: 1, restSeconds: 30 },
        { exerciseName: 'Bicycle Crunches', sets: 3, reps: 20, restSeconds: 30 },
        { exerciseName: 'Bird Dog', sets: 3, reps: 10, restSeconds: 30 }
      ]
    }))
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, ...(process.env.MONGO_DB ? { dbName: process.env.MONGO_DB } : {}) });
    console.log('Connected —', 'database:', mongoose.connection.name, 'host:', mongoose.connection.host);

    // ── Products (legacy catalogue) ────────────────────────────────────────
    await Product.deleteMany({});
    const productRes = await Product.insertMany(PRODUCTS);
    console.log(`Inserted ${productRes.length} products`);

    // ── Exercise catalogue ─────────────────────────────────────────────────
    // Program days reference these by _id, so they must exist before the
    // programs are written. `name` is the natural lookup key.
    const exerciseResult = await Exercise.findOneAndUpdate(
      { name: EXERCISES[0].name },
      { $set: EXERCISES[0] },
      { upsert: true, new: true }
    );
    let exerciseCount = 0;
    if (exerciseResult) {
      const ops = EXERCISES.slice(1).map((ex) => ({
        updateOne: {
          filter: { name: ex.name },
          update: { $set: ex },
          upsert: true,
        },
      }));
      if (ops.length) {
        const bulk = await Exercise.bulkWrite(ops, { ordered: false });
        exerciseCount = ops.length;
      }
    }
    console.log(`Seeded ${exerciseCount + 1} exercises`);

    // ── Programs ───────────────────────────────────────────────────────────
    // Each program is upserted by its `goal`, so re-running `npm run seed`
    // is idempotent: existing programs are updated in place rather than
    // duplicated. Day schedules reference the exercise ids resolved above.
    const programIds = await Promise.all(
      PROGRAMS.map(async (p) => {
        const day = [];
        for (const d of p.day) {
          const exercises = [];
          for (const slot of d.exercises) {
            const ex = EXERCISES.find((e) => e.name === slot.exerciseName);
            if (!ex) {
              throw new Error(`Unknown exercise "${slot.exerciseName}" in program "${p.goal}"`);
            }
            const doc = await Exercise.findOneAndUpdate(
              { name: ex.name },
              { $set: ex },
              { upsert: true, new: true, projection: { _id: 1 } }
            );
            exercises.push({
              exerciseId: doc._id,
              sets: slot.sets,
              reps: slot.reps,
              restSeconds: slot.restSeconds,
              notes: slot.notes || '',
            });
          }
          day.push({ ...d, exercises });
        }

        const filter = { goal: p.goal };
        const update = {
          $set: {
            goal: p.goal,
            difficulty: p.difficulty,
            lengthDays: p.lengthDays,
            day,
            tags: p.tags,
            image: p.image,
          },
        };
        const result = await Program.findOneAndUpdate(filter, update, {
          upsert: true,
          new: true,
          projection: { _id: 1 },
        });
        return result._id;
      })
    );

    console.log(`Seeded ${programIds.length} programs`);

    // ── Summary ────────────────────────────────────────────────────────────
    const [productCount, exerciseTotal, programCount] = await Promise.all([
      Product.countDocuments({}),
      Exercise.countDocuments({}),
      Program.countDocuments({}),
    ]);
    console.log('\n=== Seed Summary ===');
    console.log(`Products:   ${productCount}`);
    console.log(`Exercises:  ${exerciseTotal}`);
    console.log(`Programs:   ${programCount}`);
    console.log('====================\n');

    await mongoose.disconnect();
    console.log('Disconnected. Seed complete.');
    // Clear product cache if available
    try {
      const cache = require('./lib/cache');
      if (cache && cache.clearAll) await cache.clearAll();
      console.log('Cleared product cache');
    } catch (err) {
      // ignore
    }
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    try { await mongoose.disconnect(); } catch (e) { }
    process.exit(1);
  }
}

seed();

module.exports = { EXERCISES, PROGRAMS };
