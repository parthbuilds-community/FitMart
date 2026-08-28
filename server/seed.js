require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Exercise = require('./models/Exercise');
const Program = require('./models/Program');

const MONGO_URI = process.env.MONGO_URI;

// 1. ORIGINAL PRODUCTS (Needed for existing tests)
const PRODUCTS = [
  { productId: 1, name: 'Adjustable Dumbbell Set', brand: 'PowerFlex', category: 'Equipment', price: 15999, stock: 25, reserved: 3, image: 'https://placehold.co/400' },
  { productId: 2, name: 'Whey Protein Isolate', brand: 'NutriCore', category: 'Nutrition', price: 3299, stock: 120, reserved: 15, image: 'https://placehold.co/400' }
  // ... (I've shortened this for the chat, but keep the full list you had before!)
];

// 2. NEW EXERCISES
const EXERCISES = [
  { name: 'Pushups', bodyPart: 'chest', target: ' pectorals', equipment: 'body weight' },
  { name: 'Squats', bodyPart: 'legs', target: 'glutes', equipment: 'body weight' },
  { name: 'Plank', bodyPart: 'waist', target: 'abs', equipment: 'body weight' }
];

// 3. NEW PROGRAMS
const PROGRAMS = [
  { title: 'Foundation Fitness', description: 'Build core strength.', duration: 28, category: 'Beginner' },
  { title: 'Advanced Shred', description: 'Maximum intensity fat loss.', duration: 56, category: 'Advanced' }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    
    await Product.deleteMany({});
    await Exercise.deleteMany({});
    await Program.deleteMany({});

    // Seed everything
    const savedProducts = await Product.insertMany(PRODUCTS);
    const savedEx = await Exercise.insertMany(EXERCISES);
    
    const finalPrograms = PROGRAMS.map(prog => ({
      ...prog,
      schedule: [{ day: 1, exercises: [{ exerciseId: savedEx[0]._id, sets: '3', reps: '15' }] }]
    }));
    await Program.insertMany(finalPrograms);

    console.log(`✅ Seeded: ${savedProducts.length} Products, ${savedEx.length} Exercises, ${finalPrograms.length} Programs`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();