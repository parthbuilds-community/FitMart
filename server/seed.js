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

const EXERCISES = [
  {
    name: "Push-Up",
    bodyPart: "Chest",
    target: "Pectorals",
    equipment: "Bodyweight",
  },
  {
    name: "Pull-Up",
    bodyPart: "Back",
    target: "Lats",
    equipment: "Pull-up Bar",
  },
  {
    name: "Bodyweight Squat",
    bodyPart: "Legs",
    target: "Quadriceps",
    equipment: "Bodyweight",
  },
  {
    name: "Reverse Lunge",
    bodyPart: "Legs",
    target: "Glutes",
    equipment: "Bodyweight",
  },
  {
    name: "Glute Bridge",
    bodyPart: "Glutes",
    target: "Glutes",
    equipment: "Bodyweight",
  },
  {
    name: "Calf Raise",
    bodyPart: "Legs",
    target: "Calves",
    equipment: "Bodyweight",
  },
  {
    name: "Plank",
    bodyPart: "Core",
    target: "Abdominals",
    equipment: "Bodyweight",
  },
  {
    name: "Bicycle Crunch",
    bodyPart: "Core",
    target: "Abdominals",
    equipment: "Bodyweight",
  },
  {
    name: "Russian Twist",
    bodyPart: "Core",
    target: "Obliques",
    equipment: "Bodyweight",
  },
  {
    name: "Leg Raise",
    bodyPart: "Core",
    target: "Lower Abdominals",
    equipment: "Bodyweight",
  },
  {
    name: "Bird Dog",
    bodyPart: "Core",
    target: "Core Stability",
    equipment: "Bodyweight",
  },
  {
    name: "Mountain Climbers",
    bodyPart: "Full Body",
    target: "Core",
    equipment: "Bodyweight",
  },
  {
    name: "Jumping Jacks",
    bodyPart: "Full Body",
    target: "Cardiovascular",
    equipment: "Bodyweight",
  },
  {
    name: "Burpees",
    bodyPart: "Full Body",
    target: "Cardiovascular",
    equipment: "Bodyweight",
  },
  {
    name: "High Knees",
    bodyPart: "Legs",
    target: "Cardiovascular",
    equipment: "Bodyweight",
  },
  {
    name: "Shoulder Press",
    bodyPart: "Shoulders",
    target: "Deltoids",
    equipment: "Dumbbells",
  },
  {
    name: "Dumbbell Row",
    bodyPart: "Back",
    target: "Upper Back",
    equipment: "Dumbbells",
  },
  {
    name: "Bicep Curl",
    bodyPart: "Arms",
    target: "Biceps",
    equipment: "Dumbbells",
  },
  {
    name: "Tricep Extension",
    bodyPart: "Arms",
    target: "Triceps",
    equipment: "Dumbbells",
  },
  {
    name: "Cat Cow",
    bodyPart: "Full Body",
    target: "Spinal Mobility",
    equipment: "Bodyweight",
  },
  {
    name: "Child Pose",
    bodyPart: "Full Body",
    target: "Flexibility",
    equipment: "Bodyweight",
  },
  {
    name: "Hip Flexor Stretch",
    bodyPart: "Hips",
    target: "Hip Flexors",
    equipment: "Bodyweight",
  },
  {
    name: "Hamstring Stretch",
    bodyPart: "Legs",
    target: "Hamstrings",
    equipment: "Bodyweight",
  },
  {
    name: "World's Greatest Stretch",
    bodyPart: "Full Body",
    target: "Mobility",
    equipment: "Bodyweight",
  },
];

const WORKOUT_TEMPLATES = {
  foundationA: [
    ["Push-Up", "3", "8-12"],
    ["Bodyweight Squat", "3", "12-15"],
    ["Glute Bridge", "3", "12-15"],
    ["Plank", "3", "30-45 sec"],
  ],

  foundationB: [
    ["Reverse Lunge", "3", "10 each"],
    ["Shoulder Press", "3", "10-12"],
    ["Dumbbell Row", "3", "10-12"],
    ["Bird Dog", "3", "10 each"],
  ],

  foundationCardio: [
    ["Jumping Jacks", "3", "45 sec"],
    ["High Knees", "3", "30 sec"],
    ["Mountain Climbers", "3", "30 sec"],
    ["Plank", "3", "30 sec"],
  ],

  recovery: [
    ["Cat Cow", "2", "10"],
    ["Child Pose", "2", "30 sec"],
    ["Hip Flexor Stretch", "2", "30 sec each"],
    ["Hamstring Stretch", "2", "30 sec each"],
  ],

  strengthPush: [
    ["Push-Up", "4", "8-12"],
    ["Shoulder Press", "4", "8-12"],
    ["Tricep Extension", "3", "10-12"],
    ["Plank", "3", "45 sec"],
  ],

  strengthPull: [
    ["Pull-Up", "4", "5-10"],
    ["Dumbbell Row", "4", "8-12"],
    ["Bicep Curl", "3", "10-12"],
    ["Bird Dog", "3", "10 each"],
  ],

  strengthLegs: [
    ["Bodyweight Squat", "4", "10-15"],
    ["Reverse Lunge", "3", "10 each"],
    ["Glute Bridge", "4", "12-15"],
    ["Calf Raise", "4", "15-20"],
  ],

  cardioSteady: [
    ["Jumping Jacks", "4", "60 sec"],
    ["High Knees", "4", "45 sec"],
    ["Mountain Climbers", "4", "45 sec"],
    ["Plank", "3", "45 sec"],
  ],

  cardioHIIT: [
    ["Burpees", "4", "10-15"],
    ["Mountain Climbers", "4", "45 sec"],
    ["High Knees", "4", "45 sec"],
    ["Jumping Jacks", "4", "60 sec"],
  ],

  coreA: [
    ["Plank", "3", "45 sec"],
    ["Bicycle Crunch", "3", "15 each"],
    ["Leg Raise", "3", "10-15"],
    ["Russian Twist", "3", "15 each"],
  ],

  coreB: [
    ["Bird Dog", "3", "12 each"],
    ["Plank", "3", "45 sec"],
    ["Russian Twist", "3", "15 each"],
    ["Leg Raise", "3", "10-15"],
  ],

  mobility: [
    ["Cat Cow", "3", "10"],
    ["World's Greatest Stretch", "3", "5 each"],
    ["Hip Flexor Stretch", "3", "30 sec each"],
    ["Hamstring Stretch", "3", "30 sec each"],
  ],

  advancedFullBody: [
    ["Burpees", "5", "12-15"],
    ["Push-Up", "4", "15-20"],
    ["Bodyweight Squat", "4", "20"],
    ["Mountain Climbers", "4", "60 sec"],
  ],

  advancedLower: [
    ["Bodyweight Squat", "5", "15-20"],
    ["Reverse Lunge", "4", "12 each"],
    ["Glute Bridge", "4", "15-20"],
    ["Calf Raise", "5", "20"],
  ],

  advancedUpper: [
    ["Push-Up", "5", "12-20"],
    ["Pull-Up", "4", "8-12"],
    ["Shoulder Press", "4", "12-15"],
    ["Dumbbell Row", "4", "12-15"],
  ],
};

const buildSchedule = (duration, pattern) => {
  return Array.from({ length: duration }, (_, index) => {
    const template = pattern[index % pattern.length];

    return {
      day: index + 1,
      exercises: template,
    };
  });
};

const PROGRAMS = [
  {
    title: "Foundation Fitness",
    description:
      "A beginner-friendly 28-day program focused on building strength, movement quality, and consistent exercise habits.",
    duration: 28,
    category: "Beginner",
    schedulePattern: [
      WORKOUT_TEMPLATES.foundationA,
      WORKOUT_TEMPLATES.foundationB,
      WORKOUT_TEMPLATES.foundationCardio,
      WORKOUT_TEMPLATES.recovery,
    ],
  },

  {
    title: "Strength Builder",
    description:
      "A 42-day progressive strength program covering upper body, lower body, pulling, pushing, and core work.",
    duration: 42,
    category: "Intermediate",
    schedulePattern: [
      WORKOUT_TEMPLATES.strengthPush,
      WORKOUT_TEMPLATES.strengthPull,
      WORKOUT_TEMPLATES.strengthLegs,
      WORKOUT_TEMPLATES.coreA,
      WORKOUT_TEMPLATES.recovery,
    ],
  },

  {
    title: "Cardio Endurance",
    description:
      "A 35-day conditioning program designed to improve cardiovascular endurance, work capacity, and core stability.",
    duration: 35,
    category: "Intermediate",
    schedulePattern: [
      WORKOUT_TEMPLATES.cardioSteady,
      WORKOUT_TEMPLATES.cardioHIIT,
      WORKOUT_TEMPLATES.coreA,
      WORKOUT_TEMPLATES.recovery,
    ],
  },

  {
    title: "Flexibility & Mobility",
    description:
      "A 28-day mobility-focused program designed to improve flexibility, joint movement, recovery, and overall mobility.",
    duration: 28,
    category: "Beginner",
    schedulePattern: [
      WORKOUT_TEMPLATES.mobility,
      WORKOUT_TEMPLATES.recovery,
      WORKOUT_TEMPLATES.mobility,
      WORKOUT_TEMPLATES.coreB,
    ],
  },

  {
    title: "Advanced Shred",
    description:
      "A demanding 56-day conditioning program combining strength, full-body movements, core training, and high-intensity work.",
    duration: 56,
    category: "Advanced",
    schedulePattern: [
      WORKOUT_TEMPLATES.advancedFullBody,
      WORKOUT_TEMPLATES.advancedUpper,
      WORKOUT_TEMPLATES.advancedLower,
      WORKOUT_TEMPLATES.cardioHIIT,
      WORKOUT_TEMPLATES.coreA,
      WORKOUT_TEMPLATES.recovery,
    ],
  },

  {
    title: "Core & Balance",
    description:
      "A 21-day beginner-intermediate program focused on core strength, stability, balance, and controlled movement.",
    duration: 21,
    category: "Beginner-Intermediate",
    schedulePattern: [
      WORKOUT_TEMPLATES.coreA,
      WORKOUT_TEMPLATES.coreB,
      WORKOUT_TEMPLATES.mobility,
      WORKOUT_TEMPLATES.recovery,
    ],
  },
];

const createExerciseMap = async () => {
  const exerciseMap = {};

  for (const exercise of EXERCISES) {
    const savedExercise = await Exercise.findOneAndUpdate(
      { name: exercise.name },
      exercise,
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );

    exerciseMap[exercise.name] = savedExercise._id;
  }

  return exerciseMap;
};

const convertScheduleToReferences = (schedule, exerciseMap) => {
  return schedule.map((day) => ({
    day: day.day,
    exercises: day.exercises.map(([name, sets, reps]) => {
      if (!exerciseMap[name]) {
        throw new Error(
          `Exercise "${name}" was not found while building program schedule.`
        );
      }

      return {
        exerciseId: exerciseMap[name],
        sets,
        reps,
      };
    }),
  }));
};

async function seed() {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(MONGO_URI, {
      ...(process.env.MONGO_DB
        ? { dbName: process.env.MONGO_DB }
        : {}),
    });

    console.log(
      'Connected —',
      'database:',
      mongoose.connection.name,
      'host:',
      mongoose.connection.host
    );

    // Seed existing products
    await Product.deleteMany({});

    const res = await Product.insertMany(PRODUCTS);

    console.log(`Inserted ${res.length} products`);

    // Seed exercises
    const exerciseMap = {};

    for (const exercise of EXERCISES) {
      const savedExercise = await Exercise.findOneAndUpdate(
        { name: exercise.name },
        exercise,
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        }
      );

      exerciseMap[exercise.name] = savedExercise._id;
    }

    console.log(`Seeded ${EXERCISES.length} exercises`);

    // Seed programs
    let programCount = 0;

    for (const program of PROGRAMS) {
      const schedule = buildSchedule(
        program.duration,
        program.schedulePattern
      );

      const scheduleWithReferences = convertScheduleToReferences(
        schedule,
        exerciseMap
      );

      await Program.findOneAndUpdate(
        { title: program.title },
        {
          title: program.title,
          description: program.description,
          duration: program.duration,
          category: program.category,
          schedule: scheduleWithReferences,
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        }
      );

      programCount++;
    }

    console.log(`Seeded ${programCount} programs`);

    console.log('\nPrograms:');

    for (const program of PROGRAMS) {
      console.log(
        `  ✓ ${program.title} — ${program.duration} days`
      );
    }

    await mongoose.disconnect();

    console.log('\nDisconnected. Seed complete.');

    // Clear product cache if available
    try {
      const cache = require('./lib/cache');

      if (cache && cache.clearAll) {
        await cache.clearAll();
      }

      console.log('Cleared product cache');
    } catch (err) {
      // Ignore cache errors
    }

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);

    try {
      await mongoose.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }

    process.exit(1);
  }
}

seed();