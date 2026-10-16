require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Exercise = require('./models/Exercise');
const Program = require('./models/Program');

const MONGO_URI = process.env.MONGO_URI;

// 1. ORIGINAL 21 STORE PRODUCTS (Preserved for catalogue, cart, and order workflows)
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
    price: 2499,
    originalPrice: 2999,
    rating: 4.5,
    reviews: 189,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/716S0p74EBL._AC_UF1000,1000_QL80_.jpg',
    stock: 60,
    reserved: 6
  },
  {
    productId: 8,
    name: 'Foam Roller',
    brand: 'ZenFlow',
    category: 'Equipment',
    price: 1199,
    originalPrice: null,
    rating: 4.6,
    reviews: 73,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/81PjP7eXNUL._AC_UF1000,1000_QL80_.jpg',
    stock: 40,
    reserved: 2
  },
  {
    productId: 9,
    name: 'BCAA Recovery Powder',
    brand: 'NutriCore',
    category: 'Nutrition',
    price: 1999,
    originalPrice: null,
    rating: 4.4,
    reviews: 142,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71f-G1B2Q7L._AC_UF1000,1000_QL80_.jpg',
    stock: 80,
    reserved: 10
  },
  {
    productId: 10,
    name: 'Speed Jump Rope',
    brand: 'PowerFlex',
    category: 'Equipment',
    price: 799,
    originalPrice: null,
    rating: 4.5,
    reviews: 204,
    badge: 'Best Seller',
    image: 'https://m.media-amazon.com/images/I/71t-Yv-hLKL._AC_UF1000,1000_QL80_.jpg',
    stock: 100,
    reserved: 7
  },
  {
    productId: 11,
    name: 'Kettlebell 16kg',
    brand: 'PowerFlex',
    category: 'Equipment',
    price: 3499,
    originalPrice: 3999,
    rating: 4.8,
    reviews: 118,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/81xV4uR8-OL._AC_UF1000,1000_QL80_.jpg',
    stock: 35,
    reserved: 4
  },
  {
    productId: 12,
    name: 'Plant Protein Blend',
    brand: 'ZenFlow',
    category: 'Nutrition',
    price: 2899,
    originalPrice: null,
    rating: 4.6,
    reviews: 97,
    badge: 'New',
    image: 'https://m.media-amazon.com/images/I/61NlJ0vO3GL._AC_UF1000,1000_QL80_.jpg',
    stock: 45,
    reserved: 5
  },
  {
    productId: 13,
    name: 'Lifting Straps (Pair)',
    brand: 'PowerFlex',
    category: 'Equipment',
    price: 649,
    originalPrice: null,
    rating: 4.7,
    reviews: 163,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71U1xW1yDNL._AC_UF1000,1000_QL80_.jpg',
    stock: 110,
    reserved: 9
  },
  {
    productId: 14,
    name: 'Electrolyte Hydration Mix',
    brand: 'NutriCore',
    category: 'Nutrition',
    price: 1299,
    originalPrice: null,
    rating: 4.5,
    reviews: 79,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71X8k-G6vIL._AC_UF1000,1000_QL80_.jpg',
    stock: 65,
    reserved: 3
  },
  {
    productId: 15,
    name: 'Ab Roller Wheel',
    brand: 'FlexBand',
    category: 'Equipment',
    price: 999,
    originalPrice: 1299,
    rating: 4.4,
    reviews: 131,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71E3vXhVlXL._AC_UF1000,1000_QL80_.jpg',
    stock: 55,
    reserved: 6
  },
  {
    productId: 16,
    name: 'Mass Gainer XXL',
    brand: 'NutriCore',
    category: 'Nutrition',
    price: 3799,
    originalPrice: 4499,
    rating: 4.7,
    reviews: 248,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71XmI9nBvBL._AC_UF1000,1000_QL80_.jpg',
    stock: 40,
    reserved: 4
  },
  {
    productId: 17,
    name: 'Heart Rate Chest Strap',
    brand: 'VitalSync',
    category: 'Wearables',
    price: 4499,
    originalPrice: null,
    rating: 4.6,
    reviews: 62,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/61NlJ0vO3GL._AC_UF1000,1000_QL80_.jpg',
    stock: 20,
    reserved: 2
  },
  {
    productId: 18,
    name: 'Gym Duffle Bag 40L',
    brand: 'PowerFlex',
    category: 'Equipment',
    price: 2499,
    originalPrice: 2999,
    rating: 4.7,
    reviews: 175,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/81PjP7eXNUL._AC_UF1000,1000_QL80_.jpg',
    stock: 45,
    reserved: 5
  },
  {
    productId: 19,
    name: 'Multivitamin Sport Pack',
    brand: 'NutriCore',
    category: 'Nutrition',
    price: 1599,
    originalPrice: null,
    rating: 4.8,
    reviews: 198,
    badge: 'Verified',
    image: 'https://m.media-amazon.com/images/I/71f-G1B2Q7L._AC_UF1000,1000_QL80_.jpg',
    stock: 85,
    reserved: 11
  },
  {
    productId: 20,
    name: 'Pull-Up Bar (Doorway)',
    brand: 'FlexBand',
    category: 'Equipment',
    price: 2299,
    originalPrice: null,
    rating: 4.5,
    reviews: 89,
    badge: null,
    image: 'https://m.media-amazon.com/images/I/71-87y93B+L._AC_UF894,1000_QL80_.jpg',
    stock: 30,
    reserved: 3
  },
  {
    productId: 21,
    name: 'Fish Oil Omega-3 1000mg',
    brand: 'NutriCore',
    category: 'Nutrition',
    price: 1399,
    originalPrice: 1699,
    rating: 4.9,
    reviews: 445,
    badge: 'Best Seller',
    image: 'https://m.media-amazon.com/images/I/81L9aVlIYeL._AC_UF1000,1000_QL80_.jpg',
    stock: 150,
    reserved: 18
  },
];

// 2. EXERCISE LIBRARY (30 realistic exercises covering all muscle groups and equipment)
const EXERCISES = [
  // Chest
  { name: 'Push-Up', muscleGroup: 'chest', equipment: 'bodyweight', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'chest', equipment: 'dumbbell', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Dumbbell Chest Fly', muscleGroup: 'chest', equipment: 'dumbbell', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80' },

  // Back
  { name: 'Pull-Up', muscleGroup: 'back', equipment: 'bodyweight', image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80' },
  { name: 'Barbell Bent-Over Row', muscleGroup: 'back', equipment: 'barbell', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop&q=80' },
  { name: 'Lat Pulldown', muscleGroup: 'back', equipment: 'cable', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80' },
  { name: 'Single-Arm Dumbbell Row', muscleGroup: 'back', equipment: 'dumbbell', image: 'https://images.unsplash.com/photo-1584863265045-f9d10ca7fa61?w=600&auto=format&fit=crop&q=80' },

  // Legs
  { name: 'Barbell Back Squat', muscleGroup: 'legs', equipment: 'barbell', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80' },
  { name: 'Romanian Deadlift', muscleGroup: 'legs', equipment: 'barbell', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80' },
  { name: 'Bulgarian Split Squat', muscleGroup: 'legs', equipment: 'dumbbell', image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&auto=format&fit=crop&q=80' },
  { name: 'Bodyweight Lunge', muscleGroup: 'legs', equipment: 'bodyweight', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80' },
  { name: 'Calf Raise', muscleGroup: 'legs', equipment: 'bodyweight', image: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=600&auto=format&fit=crop&q=80' },
  { name: 'Leg Press', muscleGroup: 'legs', equipment: 'machine', image: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=600&auto=format&fit=crop&q=80' },

  // Shoulders
  { name: 'Overhead Dumbbell Press', muscleGroup: 'shoulders', equipment: 'dumbbell', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80' },
  { name: 'Lateral Raise', muscleGroup: 'shoulders', equipment: 'dumbbell', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Face Pull', muscleGroup: 'shoulders', equipment: 'cable', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80' },

  // Arms
  { name: 'Barbell Bicep Curl', muscleGroup: 'arms', equipment: 'barbell', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Tricep Rope Pushdown', muscleGroup: 'arms', equipment: 'cable', image: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=600&auto=format&fit=crop&q=80' },
  { name: 'Hammer Curl', muscleGroup: 'arms', equipment: 'dumbbell', image: 'https://images.unsplash.com/photo-1584863265045-f9d10ca7fa61?w=600&auto=format&fit=crop&q=80' },
  { name: 'Skull Crusher', muscleGroup: 'arms', equipment: 'barbell', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80' },

  // Core
  { name: 'Plank', muscleGroup: 'core', equipment: 'bodyweight', image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&auto=format&fit=crop&q=80' },
  { name: 'Hanging Leg Raise', muscleGroup: 'core', equipment: 'bodyweight', image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80' },
  { name: 'Russian Twist', muscleGroup: 'core', equipment: 'bodyweight', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80' },
  { name: 'Ab Wheel Rollout', muscleGroup: 'core', equipment: 'equipment', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80' },
  { name: 'Bicycle Crunch', muscleGroup: 'core', equipment: 'bodyweight', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80' },

  // Cardio & Mobility
  { name: 'Burpee', muscleGroup: 'cardio', equipment: 'bodyweight', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80' },
  { name: 'Mountain Climber', muscleGroup: 'cardio', equipment: 'bodyweight', image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=600&auto=format&fit=crop&q=80' },
  { name: 'Cat-Cow Stretch', muscleGroup: 'mobility', equipment: 'bodyweight', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80' },
  { name: 'World Greatest Stretch', muscleGroup: 'mobility', equipment: 'bodyweight', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80' },
];

/**
 * Builds day-by-day schedules given total duration and a 7-day cyclical template list.
 * Applies progressive overload cues and rep adjustments by training week.
 */
function generateSchedule(lengthDays, weeklyTemplates) {
  const days = [];
  for (let dayNum = 1; dayNum <= lengthDays; dayNum++) {
    const weekNum = Math.floor((dayNum - 1) / 7) + 1;
    const templateIndex = (dayNum - 1) % weeklyTemplates.length;
    const template = weeklyTemplates[templateIndex];

    const exercises = template.exercises.map((ex) => {
      const repIncrement = Math.min(weekNum - 1, 2);
      return {
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps + repIncrement,
        restSeconds: ex.restSeconds,
        notes: `Week ${weekNum}: ${ex.notes}`,
      };
    });

    days.push({
      dayNumber: dayNum,
      focus: `Week ${weekNum} - ${template.focus}`,
      exercises,
    });
  }
  return days;
}

// 7-day cyclical workout session templates
const TEMPLATES = {
  // 1. Foundation Fitness (Beginner - 28 Days)
  foundation: [
    {
      focus: 'Full Body Activation A',
      exercises: [
        { name: 'Push-Up', sets: 3, reps: 10, restSeconds: 60, notes: 'Maintain tight core and neutral spine' },
        { name: 'Barbell Back Squat', sets: 3, reps: 10, restSeconds: 90, notes: 'Focus on depth and knee tracking over toes' },
        { name: 'Single-Arm Dumbbell Row', sets: 3, reps: 12, restSeconds: 60, notes: 'Drive elbow backward without torso rotation' },
        { name: 'Bodyweight Lunge', sets: 3, reps: 10, restSeconds: 60, notes: 'Step forward keeping front knee behind toe' },
        { name: 'Plank', sets: 3, reps: 30, restSeconds: 45, notes: 'Hold for prescribed duration; breathe steadily' },
      ],
    },
    {
      focus: 'Core & Stability',
      exercises: [
        { name: 'Plank', sets: 3, reps: 35, restSeconds: 45, notes: 'Keep hips aligned with shoulders' },
        { name: 'Russian Twist', sets: 3, reps: 16, restSeconds: 45, notes: 'Controlled rotation touching sides' },
        { name: 'Bicycle Crunch', sets: 3, reps: 20, restSeconds: 45, notes: 'Slow alternating tempo' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 10, restSeconds: 30, notes: 'Synchronize movement with breath' },
      ],
    },
    {
      focus: 'Full Body Activation B',
      exercises: [
        { name: 'Romanian Deadlift', sets: 3, reps: 10, restSeconds: 75, notes: 'Hinge at hips feeling hamstring tension' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 10, restSeconds: 60, notes: 'Press up and slightly inward over upper chest' },
        { name: 'Lat Pulldown', sets: 3, reps: 12, restSeconds: 60, notes: 'Pull to collarbone with shoulder depression' },
        { name: 'Calf Raise', sets: 3, reps: 15, restSeconds: 45, notes: 'Full extension at the top with 1-second pause' },
        { name: 'Hanging Leg Raise', sets: 3, reps: 10, restSeconds: 60, notes: 'Curl pelvis without excessive swing' },
      ],
    },
    {
      focus: 'Active Mobility & Recovery',
      exercises: [
        { name: 'Cat-Cow Stretch', sets: 3, reps: 12, restSeconds: 30, notes: 'Slow articulation through entire vertebral column' },
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 45, notes: 'Hold low lunge and thoracic rotation 3 seconds per side' },
        { name: 'Bodyweight Lunge', sets: 2, reps: 10, restSeconds: 45, notes: 'Light dynamic stretch for hip flexors' },
        { name: 'Plank', sets: 2, reps: 30, restSeconds: 30, notes: 'Gentle core engagement' },
      ],
    },
    {
      focus: 'Functional Upper Body',
      exercises: [
        { name: 'Push-Up', sets: 3, reps: 12, restSeconds: 60, notes: 'Chest to floor on every repetition' },
        { name: 'Single-Arm Dumbbell Row', sets: 3, reps: 12, restSeconds: 60, notes: 'Full stretch at bottom, squeeze lat at top' },
        { name: 'Overhead Dumbbell Press', sets: 3, reps: 10, restSeconds: 60, notes: 'Lock out overhead without hyperextending lower back' },
        { name: 'Hammer Curl', sets: 3, reps: 12, restSeconds: 45, notes: 'Keep elbows tucked tightly at sides' },
        { name: 'Tricep Rope Pushdown', sets: 3, reps: 12, restSeconds: 45, notes: 'Spread rope apart at full extension' },
      ],
    },
    {
      focus: 'Lower Body & Core',
      exercises: [
        { name: 'Barbell Back Squat', sets: 3, reps: 10, restSeconds: 90, notes: 'Consistent tempo on descent' },
        { name: 'Romanian Deadlift', sets: 3, reps: 10, restSeconds: 75, notes: 'Keep bar close to shins' },
        { name: 'Calf Raise', sets: 3, reps: 15, restSeconds: 45, notes: 'Full range of motion' },
        { name: 'Russian Twist', sets: 3, reps: 20, restSeconds: 45, notes: 'Maintain elevated feet for challenge' },
        { name: 'Ab Wheel Rollout', sets: 3, reps: 8, restSeconds: 60, notes: 'Roll out under control; avoid lower back arch' },
      ],
    },
    {
      focus: 'Restorative Regeneration',
      exercises: [
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 30, notes: 'Lengthen spine and open hip capsules' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 12, restSeconds: 30, notes: 'Gentle spinal movement' },
        { name: 'Plank', sets: 2, reps: 30, restSeconds: 30, notes: 'Isometric stability' },
        { name: 'Bicycle Crunch', sets: 2, reps: 15, restSeconds: 30, notes: 'Easy rotational activation' },
      ],
    },
  ],

  // 2. Strength Builder (Intermediate - 42 Days)
  strength: [
    {
      focus: 'Heavy Push Strength',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: 6, restSeconds: 120, notes: 'Retract scapulae and drive through feet' },
        { name: 'Incline Dumbbell Press', sets: 4, reps: 8, restSeconds: 90, notes: '30-degree incline for upper chest' },
        { name: 'Overhead Dumbbell Press', sets: 3, reps: 8, restSeconds: 90, notes: 'Strict overhead pressing form' },
        { name: 'Lateral Raise', sets: 3, reps: 12, restSeconds: 60, notes: 'Lead with elbows with slight forward lean' },
        { name: 'Tricep Rope Pushdown', sets: 3, reps: 12, restSeconds: 60, notes: 'Lock elbows at sides' },
        { name: 'Skull Crusher', sets: 3, reps: 10, restSeconds: 60, notes: 'Lower bar toward crown of head' },
      ],
    },
    {
      focus: 'Heavy Pull Strength',
      exercises: [
        { name: 'Pull-Up', sets: 4, reps: 6, restSeconds: 120, notes: 'Full dead hang to chin over bar' },
        { name: 'Barbell Bent-Over Row', sets: 4, reps: 8, restSeconds: 90, notes: 'Hinged at 45 degrees, pull to lower ribcage' },
        { name: 'Lat Pulldown', sets: 3, reps: 10, restSeconds: 75, notes: 'Wide grip pulling to upper chest' },
        { name: 'Face Pull', sets: 3, reps: 15, restSeconds: 60, notes: 'External rotation at end range' },
        { name: 'Barbell Bicep Curl', sets: 3, reps: 10, restSeconds: 60, notes: 'Strict form without momentum' },
        { name: 'Hammer Curl', sets: 3, reps: 12, restSeconds: 60, notes: 'Focus on brachialis and forearm' },
      ],
    },
    {
      focus: 'Lower Body Power',
      exercises: [
        { name: 'Barbell Back Squat', sets: 4, reps: 6, restSeconds: 120, notes: 'Hit parallel or deeper with upright torso' },
        { name: 'Romanian Deadlift', sets: 4, reps: 8, restSeconds: 90, notes: 'Load posterior chain with soft knees' },
        { name: 'Leg Press', sets: 3, reps: 10, restSeconds: 90, notes: 'Feet shoulder-width in center of plate' },
        { name: 'Bulgarian Split Squat', sets: 3, reps: 8, restSeconds: 60, notes: 'Rear foot elevated on bench' },
        { name: 'Calf Raise', sets: 4, reps: 12, restSeconds: 45, notes: 'Peak contraction at top' },
        { name: 'Hanging Leg Raise', sets: 3, reps: 12, restSeconds: 60, notes: 'Strict toes toward bar' },
      ],
    },
    {
      focus: 'Active Recovery & Joint Health',
      exercises: [
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 45, notes: 'Thoracic extension and hip opening' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 12, restSeconds: 30, notes: 'Gentle spinal wave' },
        { name: 'Plank', sets: 3, reps: 45, restSeconds: 45, notes: 'Brace abdominals firmly' },
        { name: 'Bicycle Crunch', sets: 3, reps: 20, restSeconds: 45, notes: 'Controlled cross-body rotation' },
      ],
    },
    {
      focus: 'Hypertrophy Upper Body',
      exercises: [
        { name: 'Incline Dumbbell Press', sets: 3, reps: 10, restSeconds: 75, notes: 'Continuous tension on chest' },
        { name: 'Dumbbell Chest Fly', sets: 3, reps: 12, restSeconds: 60, notes: 'Deep stretch at bottom' },
        { name: 'Lat Pulldown', sets: 3, reps: 12, restSeconds: 75, notes: 'Control 3-second eccentric return' },
        { name: 'Single-Arm Dumbbell Row', sets: 3, reps: 10, restSeconds: 60, notes: 'Full stretch at bottom' },
        { name: 'Lateral Raise', sets: 3, reps: 15, restSeconds: 45, notes: 'Constant delt tension' },
        { name: 'Face Pull', sets: 3, reps: 15, restSeconds: 45, notes: 'Rear delt and rotator cuff focus' },
      ],
    },
    {
      focus: 'Hypertrophy Lower Body & Core',
      exercises: [
        { name: 'Leg Press', sets: 4, reps: 12, restSeconds: 75, notes: 'High foot placement for glutes' },
        { name: 'Bulgarian Split Squat', sets: 3, reps: 10, restSeconds: 60, notes: 'Drive through front heel' },
        { name: 'Romanian Deadlift', sets: 3, reps: 10, restSeconds: 75, notes: 'Hips back, flat back' },
        { name: 'Calf Raise', sets: 4, reps: 15, restSeconds: 45, notes: 'Pause at peak contraction' },
        { name: 'Ab Wheel Rollout', sets: 3, reps: 10, restSeconds: 60, notes: 'Core braced throughout' },
        { name: 'Russian Twist', sets: 3, reps: 20, restSeconds: 45, notes: 'Controlled torso rotation' },
      ],
    },
    {
      focus: 'Systemic Regeneration & Reset',
      exercises: [
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 30, notes: 'Full body movement prep' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 10, restSeconds: 30, notes: 'Decompress spinal discs' },
        { name: 'Plank', sets: 2, reps: 40, restSeconds: 30, notes: 'Solid anti-extension hold' },
        { name: 'Hanging Leg Raise', sets: 2, reps: 10, restSeconds: 45, notes: 'Decompress lumbar spine' },
      ],
    },
  ],

  // 3. Cardio Endurance (Intermediate - 35 Days)
  cardio: [
    {
      focus: 'High-Intensity Interval Training (HIIT)',
      exercises: [
        { name: 'Burpee', sets: 4, reps: 15, restSeconds: 45, notes: 'Explosive jump at top with soft landing' },
        { name: 'Mountain Climber', sets: 4, reps: 30, restSeconds: 45, notes: 'Rapid alternating knees to chest' },
        { name: 'Push-Up', sets: 3, reps: 15, restSeconds: 45, notes: 'Fast cadence with full range' },
        { name: 'Bodyweight Lunge', sets: 3, reps: 16, restSeconds: 45, notes: 'Dynamic jumping or walking lunges' },
        { name: 'Bicycle Crunch', sets: 3, reps: 25, restSeconds: 30, notes: 'Keep heart rate elevated' },
      ],
    },
    {
      focus: 'Aerobic Core Conditioning',
      exercises: [
        { name: 'Plank', sets: 4, reps: 45, restSeconds: 30, notes: 'Hold strong hollow body position' },
        { name: 'Russian Twist', sets: 3, reps: 24, restSeconds: 30, notes: 'Touch floor quickly on each side' },
        { name: 'Mountain Climber', sets: 3, reps: 30, restSeconds: 30, notes: 'Keep hips low and core engaged' },
        { name: 'Hanging Leg Raise', sets: 3, reps: 12, restSeconds: 45, notes: 'Core control under elevated breathing' },
        { name: 'Burpee', sets: 3, reps: 12, restSeconds: 45, notes: 'Maintain steady pace without stopping' },
      ],
    },
    {
      focus: 'Metabolic Resistance Circuit',
      exercises: [
        { name: 'Push-Up', sets: 3, reps: 15, restSeconds: 45, notes: 'Paced steady reps' },
        { name: 'Bodyweight Lunge', sets: 3, reps: 14, restSeconds: 45, notes: 'Unilateral leg stamina' },
        { name: 'Single-Arm Dumbbell Row', sets: 3, reps: 12, restSeconds: 45, notes: 'Upper back stamina' },
        { name: 'Overhead Dumbbell Press', sets: 3, reps: 12, restSeconds: 45, notes: 'Shoulder endurance' },
        { name: 'Burpee', sets: 3, reps: 12, restSeconds: 45, notes: 'Finish circuit with full effort' },
      ],
    },
    {
      focus: 'Cardiovascular Mobility & Flush',
      exercises: [
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 30, notes: 'Active dynamic stretching' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 12, restSeconds: 30, notes: 'Restorative breathing' },
        { name: 'Calf Raise', sets: 3, reps: 20, restSeconds: 30, notes: 'Flush lower legs' },
        { name: 'Plank', sets: 3, reps: 35, restSeconds: 30, notes: 'Static core bracing' },
      ],
    },
    {
      focus: 'Full Body Dynamic Power',
      exercises: [
        { name: 'Burpee', sets: 4, reps: 12, restSeconds: 45, notes: 'Power output per repetition' },
        { name: 'Mountain Climber', sets: 4, reps: 30, restSeconds: 45, notes: 'High tempo sprint on floor' },
        { name: 'Barbell Back Squat', sets: 3, reps: 15, restSeconds: 60, notes: 'Light weight, high rep conditioning' },
        { name: 'Push-Up', sets: 3, reps: 15, restSeconds: 45, notes: 'Chest to floor' },
        { name: 'Bicycle Crunch', sets: 3, reps: 25, restSeconds: 30, notes: 'Rotational core burn' },
      ],
    },
    {
      focus: 'Sustained Core & Stamina',
      exercises: [
        { name: 'Plank', sets: 4, reps: 50, restSeconds: 30, notes: 'Endurance isometric hold' },
        { name: 'Ab Wheel Rollout', sets: 3, reps: 10, restSeconds: 45, notes: 'Controlled core tension' },
        { name: 'Russian Twist', sets: 3, reps: 20, restSeconds: 30, notes: 'Fast paced twists' },
        { name: 'Mountain Climber', sets: 3, reps: 25, restSeconds: 30, notes: 'Cardio core transition' },
        { name: 'Hanging Leg Raise', sets: 3, reps: 10, restSeconds: 45, notes: 'Lower ab isolation' },
      ],
    },
    {
      focus: 'Aerobic Recovery & Regeneration',
      exercises: [
        { name: 'Cat-Cow Stretch', sets: 3, reps: 12, restSeconds: 30, notes: 'Full recovery stretch' },
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 30, notes: 'Hip and thoracic mobilization' },
        { name: 'Calf Raise', sets: 2, reps: 15, restSeconds: 30, notes: 'Gentle pump' },
        { name: 'Bicycle Crunch', sets: 2, reps: 15, restSeconds: 30, notes: 'Light activation' },
      ],
    },
  ],

  // 4. Flexibility & Mobility (Beginner - 28 Days)
  flexibility: [
    {
      focus: 'Spine & Hip Opening Flow',
      exercises: [
        { name: 'Cat-Cow Stretch', sets: 4, reps: 12, restSeconds: 30, notes: 'Inhale on cow, exhale deeply on cat' },
        { name: 'World Greatest Stretch', sets: 4, reps: 6, restSeconds: 45, notes: 'Sink deep into front hip flexor' },
        { name: 'Bodyweight Lunge', sets: 3, reps: 10, restSeconds: 45, notes: 'Slow dynamic hip stretch' },
        { name: 'Plank', sets: 3, reps: 30, restSeconds: 30, notes: 'Neutral pelvis and engaged glutes' },
      ],
    },
    {
      focus: 'Posterior Chain Decompression',
      exercises: [
        { name: 'Romanian Deadlift', sets: 3, reps: 10, restSeconds: 60, notes: 'Very light load focusing on hamstring elongation' },
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 45, notes: 'Rotate arm toward ceiling and gaze upward' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 12, restSeconds: 30, notes: 'Release lumbar tension' },
        { name: 'Calf Raise', sets: 3, reps: 15, restSeconds: 30, notes: 'Drop heel below step for Achilles stretch' },
      ],
    },
    {
      focus: 'Thoracic & Shoulder Mobility',
      exercises: [
        { name: 'Face Pull', sets: 3, reps: 15, restSeconds: 45, notes: 'Light resistance focusing on scapular retraction' },
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 30, notes: 'Upper back rotation' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 10, restSeconds: 30, notes: 'Mid-back flexion and extension' },
        { name: 'Push-Up', sets: 2, reps: 8, restSeconds: 60, notes: 'Scapular push-up emphasis at top' },
      ],
    },
    {
      focus: 'Deep Hip & Ankle Restoration',
      exercises: [
        { name: 'Bulgarian Split Squat', sets: 3, reps: 8, restSeconds: 60, notes: 'Bodyweight only, focusing on back hip stretch' },
        { name: 'Bodyweight Lunge', sets: 3, reps: 10, restSeconds: 45, notes: 'Knee past toes to mobilize ankle joint' },
        { name: 'Calf Raise', sets: 3, reps: 15, restSeconds: 30, notes: 'Full dorsiflexion stretch' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 10, restSeconds: 30, notes: 'Calm breathing cycle' },
      ],
    },
    {
      focus: 'Full Body Joint Decompression',
      exercises: [
        { name: 'Cat-Cow Stretch', sets: 4, reps: 12, restSeconds: 30, notes: 'Flow smoothly through each vertebra' },
        { name: 'World Greatest Stretch', sets: 4, reps: 6, restSeconds: 45, notes: 'Open groin, hamstrings, and chest' },
        { name: 'Plank', sets: 3, reps: 30, restSeconds: 30, notes: 'Align neck with spine' },
        { name: 'Hanging Leg Raise', sets: 2, reps: 8, restSeconds: 45, notes: 'Passive hang for spinal traction' },
      ],
    },
    {
      focus: 'Core Activation & Pelvic Alignment',
      exercises: [
        { name: 'Plank', sets: 3, reps: 35, restSeconds: 45, notes: 'Posterior pelvic tilt' },
        { name: 'Bicycle Crunch', sets: 3, reps: 16, restSeconds: 30, notes: 'Deliberate rotation without neck pulling' },
        { name: 'Russian Twist', sets: 3, reps: 16, restSeconds: 30, notes: 'Chest elevated throughout' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 10, restSeconds: 30, notes: 'Neutral pelvis restoration' },
      ],
    },
    {
      focus: 'Restorative Movement & Breath',
      exercises: [
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 30, notes: 'Slow therapeutic pace' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 12, restSeconds: 30, notes: 'Long deep breaths' },
        { name: 'Plank', sets: 2, reps: 30, restSeconds: 30, notes: 'Effortless stabilization' },
        { name: 'Bodyweight Lunge', sets: 2, reps: 8, restSeconds: 45, notes: 'Light psoas release' },
      ],
    },
  ],

  // 5. Advanced Shred (Advanced - 56 Days)
  shred: [
    {
      focus: 'Chest & Triceps Hyper-Volume',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: 8, restSeconds: 75, notes: 'Explosive drive, 2-sec eccentric' },
        { name: 'Incline Dumbbell Press', sets: 4, reps: 10, restSeconds: 60, notes: 'Full clavicular stretch' },
        { name: 'Dumbbell Chest Fly', sets: 3, reps: 12, restSeconds: 45, notes: 'Constant pectoral tension' },
        { name: 'Push-Up', sets: 3, reps: 15, restSeconds: 45, notes: 'Drop-set to failure' },
        { name: 'Tricep Rope Pushdown', sets: 4, reps: 12, restSeconds: 45, notes: 'Peak contraction squeeze' },
        { name: 'Skull Crusher', sets: 3, reps: 10, restSeconds: 45, notes: 'Strict triceps isolation' },
        { name: 'Mountain Climber', sets: 3, reps: 30, restSeconds: 30, notes: 'Finisher to spike heart rate' },
      ],
    },
    {
      focus: 'Back & Biceps Dense Pull',
      exercises: [
        { name: 'Pull-Up', sets: 4, reps: 8, restSeconds: 75, notes: 'Chest to bar with controlled descent' },
        { name: 'Barbell Bent-Over Row', sets: 4, reps: 10, restSeconds: 60, notes: 'Strict mid-back row' },
        { name: 'Lat Pulldown', sets: 3, reps: 12, restSeconds: 60, notes: 'Squeeze shoulder blades down and back' },
        { name: 'Single-Arm Dumbbell Row', sets: 3, reps: 12, restSeconds: 45, notes: 'Unilateral back thickness' },
        { name: 'Barbell Bicep Curl', sets: 3, reps: 10, restSeconds: 45, notes: 'Supinated grip overload' },
        { name: 'Hammer Curl', sets: 3, reps: 12, restSeconds: 45, notes: 'Dense forearm and brachialis work' },
        { name: 'Burpee', sets: 3, reps: 12, restSeconds: 30, notes: 'High metabolic output' },
      ],
    },
    {
      focus: 'Quads & Hamstrings Annihilation',
      exercises: [
        { name: 'Barbell Back Squat', sets: 4, reps: 8, restSeconds: 90, notes: 'Deep squat with relentless tempo' },
        { name: 'Leg Press', sets: 4, reps: 12, restSeconds: 60, notes: 'Heavy quad volume' },
        { name: 'Romanian Deadlift', sets: 4, reps: 10, restSeconds: 75, notes: 'Strict hamstring stretch' },
        { name: 'Bulgarian Split Squat', sets: 3, reps: 10, restSeconds: 60, notes: 'Per leg unilateral burn' },
        { name: 'Calf Raise', sets: 4, reps: 15, restSeconds: 30, notes: 'Short rest intervals' },
        { name: 'Hanging Leg Raise', sets: 3, reps: 12, restSeconds: 45, notes: 'Lower abs control' },
        { name: 'Mountain Climber', sets: 3, reps: 30, restSeconds: 30, notes: 'Leg stamina challenge' },
      ],
    },
    {
      focus: 'Active Recovery & Tissue Decompression',
      exercises: [
        { name: 'Cat-Cow Stretch', sets: 3, reps: 12, restSeconds: 30, notes: 'Flush spine and hips' },
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 45, notes: 'Open tight hip flexors and chest' },
        { name: 'Plank', sets: 3, reps: 45, restSeconds: 30, notes: 'Solid core stabilization' },
        { name: 'Bicycle Crunch', sets: 3, reps: 20, restSeconds: 30, notes: 'Blood flow to abdominals' },
      ],
    },
    {
      focus: 'Shoulders, Traps & Core Density',
      exercises: [
        { name: 'Overhead Dumbbell Press', sets: 4, reps: 8, restSeconds: 75, notes: 'Heavy strict pressing' },
        { name: 'Lateral Raise', sets: 4, reps: 15, restSeconds: 45, notes: 'Burnout medial delt' },
        { name: 'Face Pull', sets: 4, reps: 15, restSeconds: 45, notes: 'Posterior shoulder and posture' },
        { name: 'Ab Wheel Rollout', sets: 3, reps: 12, restSeconds: 60, notes: 'Maximum abdominal recruitment' },
        { name: 'Russian Twist', sets: 3, reps: 24, restSeconds: 30, notes: 'Fast rotational power' },
        { name: 'Plank', sets: 3, reps: 45, restSeconds: 30, notes: 'Weighted or extended lever plank' },
        { name: 'Burpee', sets: 3, reps: 12, restSeconds: 30, notes: 'Final metabolic push' },
      ],
    },
    {
      focus: 'Full Body Metabolic Gauntlet',
      exercises: [
        { name: 'Burpee', sets: 4, reps: 15, restSeconds: 45, notes: 'Full ground contact and vertical leap' },
        { name: 'Mountain Climber', sets: 4, reps: 30, restSeconds: 30, notes: 'Piston-like knee drive' },
        { name: 'Push-Up', sets: 4, reps: 15, restSeconds: 45, notes: 'Unbroken sets' },
        { name: 'Pull-Up', sets: 3, reps: 8, restSeconds: 60, notes: 'Upper body pulling power' },
        { name: 'Bodyweight Lunge', sets: 3, reps: 16, restSeconds: 45, notes: 'Speed lunges' },
        { name: 'Hanging Leg Raise', sets: 3, reps: 12, restSeconds: 45, notes: 'Compress abdominals hard' },
        { name: 'Bicycle Crunch', sets: 3, reps: 25, restSeconds: 30, notes: 'All-out abdominal fatigue' },
      ],
    },
    {
      focus: 'Total Body Flush & Mobility',
      exercises: [
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 30, notes: 'Total body restoration' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 12, restSeconds: 30, notes: 'Spinal wave and calming breaths' },
        { name: 'Calf Raise', sets: 3, reps: 15, restSeconds: 30, notes: 'Flush lactic acid' },
        { name: 'Plank', sets: 2, reps: 30, restSeconds: 30, notes: 'Quiet isometric stability' },
      ],
    },
  ],

  // 6. Core & Balance (Beginner / Intermediate - 21 Days)
  core: [
    {
      focus: 'Anti-Extension & Core Stability',
      exercises: [
        { name: 'Plank', sets: 4, reps: 40, restSeconds: 45, notes: 'Prevent any anterior pelvic tilt' },
        { name: 'Ab Wheel Rollout', sets: 3, reps: 8, restSeconds: 60, notes: 'Slow descent under full muscular tension' },
        { name: 'Hanging Leg Raise', sets: 3, reps: 10, restSeconds: 60, notes: 'Strict control, no swinging' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 10, restSeconds: 30, notes: 'Spinal mobility between core sets' },
      ],
    },
    {
      focus: 'Rotational Strength & Obliques',
      exercises: [
        { name: 'Russian Twist', sets: 4, reps: 20, restSeconds: 45, notes: 'Control rotation using core, not arms' },
        { name: 'Bicycle Crunch', sets: 4, reps: 20, restSeconds: 45, notes: 'Full extension of opposite leg' },
        { name: 'Mountain Climber', sets: 3, reps: 25, restSeconds: 30, notes: 'Dynamic core integration' },
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 30, notes: 'Thoracic rotational release' },
      ],
    },
    {
      focus: 'Unilateral Balance & Hip Stability',
      exercises: [
        { name: 'Bulgarian Split Squat', sets: 3, reps: 8, restSeconds: 60, notes: 'Stabilize front knee without wobble' },
        { name: 'Bodyweight Lunge', sets: 3, reps: 10, restSeconds: 45, notes: 'Pause 1 second at bottom of each stride' },
        { name: 'Calf Raise', sets: 3, reps: 15, restSeconds: 30, notes: 'Single-leg or double-leg balance focus' },
        { name: 'Plank', sets: 3, reps: 35, restSeconds: 45, notes: 'Solid midline alignment' },
      ],
    },
    {
      focus: 'Active Recovery & Spine Decompression',
      exercises: [
        { name: 'Cat-Cow Stretch', sets: 3, reps: 12, restSeconds: 30, notes: 'Articulate each spinal segment' },
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 45, notes: 'Deep hip capsule release' },
        { name: 'Plank', sets: 2, reps: 30, restSeconds: 30, notes: 'Mild abdominal contraction' },
        { name: 'Calf Raise', sets: 2, reps: 12, restSeconds: 30, notes: 'Ankle mobility' },
      ],
    },
    {
      focus: 'Posterior Core & Postural Control',
      exercises: [
        { name: 'Romanian Deadlift', sets: 3, reps: 10, restSeconds: 60, notes: 'Reinforce spinal stability under hinge' },
        { name: 'Face Pull', sets: 3, reps: 15, restSeconds: 45, notes: 'Upper back and posture muscle activation' },
        { name: 'Single-Arm Dumbbell Row', sets: 3, reps: 10, restSeconds: 60, notes: 'Anti-rotational pull' },
        { name: 'Plank', sets: 3, reps: 40, restSeconds: 45, notes: 'Solid plank alignment' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 10, restSeconds: 30, notes: 'Postural reset' },
      ],
    },
    {
      focus: 'Total Core Integration & Endurance',
      exercises: [
        { name: 'Plank', sets: 3, reps: 45, restSeconds: 45, notes: 'Endurance isometric brace' },
        { name: 'Hanging Leg Raise', sets: 3, reps: 10, restSeconds: 45, notes: 'Direct rectus abdominis activation' },
        { name: 'Russian Twist', sets: 3, reps: 20, restSeconds: 30, notes: 'Rotational stamina' },
        { name: 'Bicycle Crunch', sets: 3, reps: 20, restSeconds: 30, notes: 'Continuous core engagement' },
        { name: 'Ab Wheel Rollout', sets: 3, reps: 8, restSeconds: 60, notes: 'Peak core extension' },
      ],
    },
    {
      focus: 'Restoration & Balance Reset',
      exercises: [
        { name: 'World Greatest Stretch', sets: 3, reps: 6, restSeconds: 30, notes: 'Hip and thoracic mobilization' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 10, restSeconds: 30, notes: 'Gentle spinal wave' },
        { name: 'Bodyweight Lunge', sets: 2, reps: 8, restSeconds: 30, notes: 'Light hip opening' },
        { name: 'Plank', sets: 2, reps: 30, restSeconds: 30, notes: 'Stable posture hold' },
      ],
    },
  ],
};

/**
 * Builds the canonical 6 programs specified in Issue #987.
 */
function buildAllPrograms() {
  return [
    {
      goal: 'Foundation Fitness: 4-Week Total Body Conditioning',
      difficulty: 'beginner',
      lengthDays: 28,
      tags: ['beginner', 'foundation', 'full-body', 'conditioning'],
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      price: { amount: 1999, currency: 'INR', interval: 'one-time', periodDays: 28 },
      day: generateSchedule(28, TEMPLATES.foundation),
    },
    {
      goal: 'Strength Builder: 6-Week Progressive Overload Program',
      difficulty: 'intermediate',
      lengthDays: 42,
      tags: ['strength', 'hypertrophy', 'progressive-overload', 'gym'],
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      price: { amount: 2999, currency: 'INR', interval: 'one-time', periodDays: 42 },
      day: generateSchedule(42, TEMPLATES.strength),
    },
    {
      goal: 'Cardio Endurance: 5-Week Stamina and Aerobic Conditioning',
      difficulty: 'intermediate',
      lengthDays: 35,
      tags: ['cardio', 'endurance', 'hiit', 'aerobic', 'stamina'],
      image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=800&auto=format&fit=crop&q=80',
      price: { amount: 2499, currency: 'INR', interval: 'one-time', periodDays: 35 },
      day: generateSchedule(35, TEMPLATES.cardio),
    },
    {
      goal: 'Flexibility & Mobility: 4-Week Functional Joint Health',
      difficulty: 'beginner',
      lengthDays: 28,
      tags: ['flexibility', 'mobility', 'recovery', 'joint-health', 'yoga'],
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
      price: { amount: 1499, currency: 'INR', interval: 'one-time', periodDays: 28 },
      day: generateSchedule(28, TEMPLATES.flexibility),
    },
    {
      goal: 'Advanced Shred: 8-Week High-Intensity Fat Loss & Definition',
      difficulty: 'advanced',
      lengthDays: 56,
      tags: ['advanced', 'fat-loss', 'shred', 'conditioning', 'high-intensity'],
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=80',
      price: { amount: 3999, currency: 'INR', interval: 'one-time', periodDays: 56 },
      day: generateSchedule(56, TEMPLATES.shred),
    },
    {
      goal: 'Core & Balance: 3-Week Stability and Postural Control',
      difficulty: 'beginner',
      lengthDays: 21,
      tags: ['core', 'balance', 'intermediate', 'stability', 'posture'],
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
      price: { amount: 1299, currency: 'INR', interval: 'one-time', periodDays: 21 },
      day: generateSchedule(21, TEMPLATES.core),
    },
  ];
}

/**
 * Idempotently seeds all products using findOneAndUpdate with upsert: true and runValidators: true.
 */
async function seedProducts() {
  const results = [];
  for (const product of PRODUCTS) {
    const saved = await Product.findOneAndUpdate(
      { productId: product.productId },
      product,
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
    results.push(saved);
  }
  return results;
}

/**
 * Idempotently seeds all exercises and returns a map of name -> _id.
 */
async function seedExercises() {
  const exerciseMap = new Map();
  for (const exercise of EXERCISES) {
    const saved = await Exercise.findOneAndUpdate(
      { name: exercise.name },
      exercise,
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
    exerciseMap.set(saved.name, saved._id);
  }
  return exerciseMap;
}

/**
 * Idempotently seeds all programs with resolved Exercise ObjectIds.
 */
async function seedPrograms(exerciseMap) {
  const rawPrograms = buildAllPrograms();
  const seededPrograms = [];

  for (const rawProg of rawPrograms) {
    // Map exercise names in each scheduled day to real MongoDB Exercise ObjectIds
    const resolvedDays = rawProg.day.map((d) => {
      const resolvedExercises = d.exercises.map((ex) => {
        const exerciseId = exerciseMap.get(ex.name);
        if (!exerciseId) {
          throw new Error(`Exercise reference not found: "${ex.name}"`);
        }
        return {
          exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
        };
      });

      return {
        dayNumber: d.dayNumber,
        focus: d.focus,
        exercises: resolvedExercises,
      };
    });

    const programDocument = {
      goal: rawProg.goal,
      difficulty: rawProg.difficulty,
      lengthDays: rawProg.lengthDays,
      day: resolvedDays,
      tags: rawProg.tags,
      image: rawProg.image,
      price: rawProg.price,
    };

    const saved = await Program.findOneAndUpdate(
      { goal: programDocument.goal, difficulty: programDocument.difficulty },
      programDocument,
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
    seededPrograms.push(saved);
  }

  return seededPrograms;
}

/**
 * Main seeding execution function.
 */
async function seed() {
  if (!MONGO_URI) {
    console.error('MONGO_URI missing in server/.env — please add your connection string with password replaced');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...(process.env.MONGO_DB ? { dbName: process.env.MONGO_DB } : {}),
    });
    console.log(`Connected — database: ${mongoose.connection.name} host: ${mongoose.connection.host}`);

    // 1. Seed Products (non-destructive idempotent upsert)
    const savedProducts = await seedProducts();

    // 2. Seed Exercises (idempotent upsert)
    const exerciseMap = await seedExercises();

    // 3. Seed Programs (idempotent upsert with validated Exercise references)
    const savedPrograms = await seedPrograms(exerciseMap);

    // Summary output
    console.log('\n========================================');
    console.log('       FitMart Seeding Summary          ');
    console.log('========================================');
    console.log(`Products seeded:  ${savedProducts.length}`);
    console.log(`Exercises seeded: ${exerciseMap.size}`);
    console.log(`Programs seeded:  ${savedPrograms.length}`);
    console.log('----------------------------------------');
    for (const prog of savedPrograms) {
      console.log(`  ✓ ${prog.goal}`);
      console.log(`    - Difficulty: ${prog.difficulty}`);
      console.log(`    - Duration:   ${prog.lengthDays} days (${prog.day.length}/${prog.lengthDays} days scheduled)`);
      console.log(`    - Tags:       ${prog.tags.join(', ')}`);
      if (prog.price) {
        console.log(`    - Price:      ${prog.price.currency} ${prog.price.amount} (${prog.price.interval})`);
      }
    }
    console.log('========================================\n');

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
    try {
      await mongoose.disconnect();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = {
  seed,
  seedProducts,
  seedExercises,
  seedPrograms,
  buildAllPrograms,
  generateSchedule,
  PRODUCTS,
  EXERCISES,
  TEMPLATES,
};
