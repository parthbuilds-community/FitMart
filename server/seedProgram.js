require("dotenv").config();

const mongoose = require("./db");
const Exercise = require("./models/Exercise");
const Program = require("./models/Program");

const EXERCISES = [
  { name: "Push-Up", bodyPart: "Chest", target: "Pectorals", equipment: "Bodyweight" },
  { name: "Pull-Up", bodyPart: "Back", target: "Lats", equipment: "Pull-up Bar" },
  { name: "Bodyweight Squat", bodyPart: "Legs", target: "Quadriceps", equipment: "Bodyweight" },
  { name: "Reverse Lunge", bodyPart: "Legs", target: "Glutes", equipment: "Bodyweight" },
  { name: "Glute Bridge", bodyPart: "Glutes", target: "Glutes", equipment: "Bodyweight" },
  { name: "Calf Raise", bodyPart: "Legs", target: "Calves", equipment: "Bodyweight" },
  { name: "Plank", bodyPart: "Core", target: "Abdominals", equipment: "Bodyweight" },
  { name: "Bicycle Crunch", bodyPart: "Core", target: "Abdominals", equipment: "Bodyweight" },
  { name: "Russian Twist", bodyPart: "Core", target: "Obliques", equipment: "Bodyweight" },
  { name: "Leg Raise", bodyPart: "Core", target: "Lower Abdominals", equipment: "Bodyweight" },
  { name: "Bird Dog", bodyPart: "Core", target: "Core Stability", equipment: "Bodyweight" },
  { name: "Mountain Climbers", bodyPart: "Full Body", target: "Core", equipment: "Bodyweight" },
  { name: "Jumping Jacks", bodyPart: "Full Body", target: "Cardiovascular", equipment: "Bodyweight" },
  { name: "Burpees", bodyPart: "Full Body", target: "Cardiovascular", equipment: "Bodyweight" },
  { name: "High Knees", bodyPart: "Legs", target: "Cardiovascular", equipment: "Bodyweight" },
  { name: "Shoulder Press", bodyPart: "Shoulders", target: "Deltoids", equipment: "Dumbbells" },
  { name: "Dumbbell Row", bodyPart: "Back", target: "Upper Back", equipment: "Dumbbells" },
  { name: "Bicep Curl", bodyPart: "Arms", target: "Biceps", equipment: "Dumbbells" },
  { name: "Tricep Extension", bodyPart: "Arms", target: "Triceps", equipment: "Dumbbells" },
  { name: "Cat Cow", bodyPart: "Full Body", target: "Spinal Mobility", equipment: "Bodyweight" },
  { name: "Child Pose", bodyPart: "Full Body", target: "Flexibility", equipment: "Bodyweight" },
  { name: "Hip Flexor Stretch", bodyPart: "Hips", target: "Hip Flexors", equipment: "Bodyweight" },
  { name: "Hamstring Stretch", bodyPart: "Legs", target: "Hamstrings", equipment: "Bodyweight" },
  { name: "World's Greatest Stretch", bodyPart: "Full Body", target: "Mobility", equipment: "Bodyweight" },
];

const T = {
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

const PROGRAMS = [
  {
    title: "Foundation Fitness",
    description: "A beginner-friendly 28-day program focused on building strength, movement quality, and consistent exercise habits.",
    duration: 28,
    category: "Beginner",
    pattern: [T.foundationA, T.foundationB, T.foundationCardio, T.recovery],
  },
  {
    title: "Strength Builder",
    description: "A 42-day progressive strength program covering upper body, lower body, pulling, pushing, and core work.",
    duration: 42,
    category: "Intermediate",
    pattern: [T.strengthPush, T.strengthPull, T.strengthLegs, T.coreA, T.recovery],
  },
  {
    title: "Cardio Endurance",
    description: "A 35-day conditioning program designed to improve cardiovascular endurance, work capacity, and core stability.",
    duration: 35,
    category: "Intermediate",
    pattern: [T.cardioSteady, T.cardioHIIT, T.coreA, T.recovery],
  },
  {
    title: "Flexibility & Mobility",
    description: "A 28-day mobility-focused program designed to improve flexibility, joint movement, recovery, and overall mobility.",
    duration: 28,
    category: "Beginner",
    pattern: [T.mobility, T.recovery, T.mobility, T.coreB],
  },
  {
    title: "Advanced Shred",
    description: "A demanding 56-day conditioning program combining strength, full-body movements, core training, and high-intensity work.",
    duration: 56,
    category: "Advanced",
    pattern: [T.advancedFullBody, T.advancedUpper, T.advancedLower, T.cardioHIIT, T.coreA, T.recovery],
  },
  {
    title: "Core & Balance",
    description: "A 21-day beginner-intermediate program focused on core strength, stability, balance, and controlled movement.",
    duration: 21,
    category: "Beginner-Intermediate",
    pattern: [T.coreA, T.coreB, T.mobility, T.recovery],
  },
];

async function seed() {
  let connectedHere = false;

  try {
    // Wait for the existing db.js connection.
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      connectedHere = true;
    } else if (mongoose.connection.readyState === 2) {
      await mongoose.connection.asPromise();
    }

    console.log("Connected to MongoDB.");

    const exerciseMap = {};

    for (const exercise of EXERCISES) {
      const savedExercise = await Exercise.findOneAndUpdate(
        { name: exercise.name },
        { $set: exercise },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      exerciseMap[exercise.name] = savedExercise._id;
    }

    console.log(`Seeded ${EXERCISES.length} exercises.`);

    for (const program of PROGRAMS) {
      const schedule = Array.from(
        { length: program.duration },
        (_, index) => ({
          day: index + 1,
          exercises: program.pattern[index % program.pattern.length].map(
            ([name, sets, reps]) => {
              const exerciseId = exerciseMap[name];

              if (!exerciseId) {
                throw new Error(`Exercise not found: ${name}`);
              }

              return { exerciseId, sets, reps };
            }
          ),
        })
      );

      await Program.findOneAndUpdate(
        { title: program.title },
        {
          $set: {
            title: program.title,
            description: program.description,
            duration: program.duration,
            category: program.category,
            schedule,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`Seeded: ${program.title} (${program.duration} days)`);
    }

    console.log("All exercise programs seeded successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    if (connectedHere && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

seed();