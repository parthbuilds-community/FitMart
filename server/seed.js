require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Exercise = require('./models/Exercise');
const Program = require('./models/Program');

const MONGO_URI = process.env.MONGO_URI;

// 1. Define sample Exercises
const EXERCISES = [
  { name: 'Pushups', bodyPart: 'chest', target: 'pectorals', equipment: 'body weight' },
  { name: 'Pull-ups', bodyPart: 'back', target: 'lats', equipment: 'pull-up bar' },
  { name: 'Squats', bodyPart: 'legs', target: 'glutes', equipment: 'body weight' },
  { name: 'Plank', bodyPart: 'waist', target: 'abs', equipment: 'body weight' },
  { name: 'Dumbbell Curls', bodyPart: 'arms', target: 'biceps', equipment: 'dumbbells' }
];

// 2. Define sample Programs
const PROGRAMS = [
  {
    title: 'Foundation Fitness',
    description: 'A 28-day program for beginners to build core strength.',
    duration: 28,
    category: 'Beginner',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'
  },
  {
    title: 'Advanced Shred',
    description: 'High-intensity 56-day program for maximum fat loss.',
    duration: 56,
    category: 'Advanced',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa200c9c?w=800'
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    
    // Clear existing data
    await Exercise.deleteMany({});
    await Program.deleteMany({});

    // Seed Exercises first (we need their IDs)
    const savedExercises = await Exercise.insertMany(EXERCISES);
    console.log(`✅ Seeded ${savedExercises.length} exercises`);

    // Attach exercises to programs
    const programsWithSchedule = PROGRAMS.map(prog => ({
      ...prog,
      schedule: [
        { day: 1, exercises: [{ exerciseId: savedExercises[0]._id, sets: '3', reps: '15' }] },
        { day: 2, exercises: [{ exerciseId: savedExercises[3]._id, sets: '3', reps: '60s' }] }
      ]
    }));

    await Program.insertMany(programsWithSchedule);
    console.log(`✅ Seeded ${programsWithSchedule.length} programs`);

    await mongoose.disconnect();
    console.log('Disconnected. Seed complete.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();