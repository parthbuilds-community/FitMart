require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

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

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, ...(process.env.MONGO_DB ? { dbName: process.env.MONGO_DB } : {}) });
    console.log('Connected —', 'database:', mongoose.connection.name, 'host:', mongoose.connection.host, ' — seeding products');

    await Product.deleteMany({});
    const res = await Product.insertMany(PRODUCTS);
    console.log(`Inserted ${res.length} products`);

    await mongoose.disconnect();
    console.log('Disconnected. Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    try { await mongoose.disconnect(); } catch (e) { }
    process.exit(1);
  }
}

seed();
