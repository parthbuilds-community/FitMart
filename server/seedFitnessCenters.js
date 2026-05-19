// seedFitnessCenters.js
require("dotenv").config();
const mongoose = require("./db");
const FitnessCenter = require("./models/FitnessCenter");

async function seed() {
  try {
    const count = await FitnessCenter.countDocuments();
    if (count > 0) {
      console.log("Fitness centers already seeded — exiting.");
      process.exit(0);
    }

    const centers = [
      {
        "name": "Vikhroli Strength & Wellness",
        "type": "gym",
        "address": "Shop 12, Near Vikhroli Station, LBS Marg",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400079",
        "country": "India",
        "lat": 19.082,
        "lng": 72.957,
        "rating": 4.6,
        "totalReviews": 342,
        "ratingBreakdown": {
          "5star": 210,
          "4star": 98,
          "3star": 24,
          "2star": 7,
          "1star": 3
        },
        "imageUrl": "https://content.jdmagicbox.com/v2/comp/mumbai/g8/022pxx22.xx22.241202211656.u3g8/catalogue/powerpulse-gym-mumbai-gyms-AG5UMLrynU.jpg",
        "gallery": [
          "https://content.jdmagicbox.com/v2/comp/mumbai/g8/022pxx22.xx22.241202211656.u3g8/catalogue/powerpulse-gym-mumbai-gyms-AG5UMLrynU.jpg"
        ],
        "contact": "+91 98200 00001",
        "alternateContact": "+91 98200 00011",
        "email": "contact@vikhrolistrength.com",
        "website": "www.vikhrolistrength.com",
        "isOpen": true,
        "openingHours": {
          "monday": "06:00-22:00",
          "tuesday": "06:00-22:00",
          "wednesday": "06:00-22:00",
          "thursday": "06:00-22:00",
          "friday": "06:00-22:00",
          "saturday": "07:00-20:00",
          "sunday": "08:00-18:00"
        },
        "amenities": ["Cardio Equipment", "Free Weights", "Lockers", "Showers", "Parking", "WiFi"],
        "membershipPlans": [
          { "plan": "Monthly", "price": 2500, "currency": "INR" },
          { "plan": "Quarterly", "price": 6500, "currency": "INR" },
          { "plan": "Yearly", "price": 22000, "currency": "INR" }
        ],
        "trainers": 8,
        "capacity": 120,
        "established": 2019,
        "description": "A premium strength and wellness gym located near Vikhroli Station. Features state-of-the-art equipment and certified trainers.",
        "specialties": ["Strength Training", "Bodybuilding", "Weight Loss Programs"],
        "paymentMethods": ["Cash", "Credit Card", "Debit Card", "UPI", "NetBanking"]
      },
      {
        "name": "Powai Yoga Collective",
        "type": "yoga",
        "address": "Studio 4, Hiranandani Gardens, Powai",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400076",
        "country": "India",
        "lat": 19.119,
        "lng": 72.897,
        "rating": 4.8,
        "totalReviews": 567,
        "ratingBreakdown": {
          "5star": 410,
          "4star": 120,
          "3star": 28,
          "2star": 6,
          "1star": 3
        },
        "imageUrl": "https://ind.5bestincity.com/profileimages/india/charus-gym-gym-vikhroli-mumbai-maharashtra/57223-99cha-3.jpg",
        "gallery": [
          "https://ind.5bestincity.com/profileimages/india/charus-gym-gym-vikhroli-mumbai-maharashtra/57223-99cha-3.jpg"
        ],
        "contact": "+91 98200 00002",
        "alternateContact": "+91 98200 00012",
        "email": "hello@powaiyogacollective.com",
        "website": "www.powaiyogacollective.com",
        "isOpen": true,
        "openingHours": {
          "monday": "07:00-20:30",
          "tuesday": "07:00-20:30",
          "wednesday": "07:00-20:30",
          "thursday": "07:00-20:30",
          "friday": "07:00-20:30",
          "saturday": "08:00-19:00",
          "sunday": "08:00-17:00"
        },
        "amenities": ["Mats Provided", "Changing Rooms", "Herbal Tea", "Meditation Corner", "Lockers"],
        "membershipPlans": [
          { "plan": "Drop-in Class", "price": 500, "currency": "INR" },
          { "plan": "10 Class Pass", "price": 4000, "currency": "INR" },
          { "plan": "Monthly Unlimited", "price": 3500, "currency": "INR" },
          { "plan": "Yearly", "price": 30000, "currency": "INR" }
        ],
        "trainers": 6,
        "capacity": 40,
        "established": 2020,
        "description": "A serene yoga studio in the heart of Hiranandani Gardens. Offering Hatha, Vinyasa, and Restorative yoga classes for all levels.",
        "specialties": ["Hatha Yoga", "Vinyasa Flow", "Pranayama", "Meditation"],
        "paymentMethods": ["Cash", "Credit Card", "UPI", "Online Transfer"]
      },
      {
        "name": "Ghatkopar Pilates Studio",
        "type": "pilates",
        "address": "2nd Floor, Gautam Complex, Ghatkopar East",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400077",
        "country": "India",
        "lat": 19.071,
        "lng": 72.899,
        "rating": 4.4,
        "totalReviews": 189,
        "ratingBreakdown": {
          "5star": 95,
          "4star": 60,
          "3star": 22,
          "2star": 8,
          "1star": 4
        },
        "imageUrl": "https://movementsyoga.com/wp-content/uploads/1-Hot-Pilates-Main-img.jpg",
        "gallery": [
          "https://movementsyoga.com/wp-content/uploads/1-Hot-Pilates-Main-img.jpg"
        ],
        "contact": "+91 98200 00003",
        "alternateContact": "+91 98200 00013",
        "email": "info@ghatkoparpilates.com",
        "website": "www.ghatkoparpilates.com",
        "isOpen": false,
        "openingHours": {
          "monday": "08:00-20:00",
          "tuesday": "08:00-20:00",
          "wednesday": "08:00-20:00",
          "thursday": "08:00-20:00",
          "friday": "08:00-20:00",
          "saturday": "09:00-18:00",
          "sunday": "Closed"
        },
        "amenities": ["Reformer Machines", "Private Sessions", "Changing Area", "Water Dispenser"],
        "membershipPlans": [
          { "plan": "Single Session", "price": 800, "currency": "INR" },
          { "plan": "5 Sessions", "price": 3500, "currency": "INR" },
          { "plan": "10 Sessions", "price": 6500, "currency": "INR" },
          { "plan": "Monthly Unlimited", "price": 6000, "currency": "INR" }
        ],
        "trainers": 4,
        "capacity": 25,
        "established": 2021,
        "description": "Specialized Pilates studio focusing on core strength, flexibility, and posture correction. Currently closed for renovation.",
        "specialties": ["Mat Pilates", "Reformer Pilates", "Injury Rehabilitation"],
        "paymentMethods": ["Cash", "Credit Card", "UPI"]
      },
      {
        "name": "Andheri Fitness Studio",
        "type": "fitness_studio",
        "address": "Near Metro, Andheri West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400058",
        "country": "India",
        "lat": 19.118,
        "lng": 72.829,
        "rating": 4.2,
        "totalReviews": 276,
        "ratingBreakdown": {
          "5star": 120,
          "4star": 98,
          "3star": 35,
          "2star": 15,
          "1star": 8
        },
        "imageUrl": "https://img.fitimg.in/studio-profile-F56CABB1B4D359.jpg",
        "gallery": [
          "https://img.fitimg.in/studio-profile-F56CABB1B4D359.jpg"
        ],
        "contact": "+91 98200 00004",
        "alternateContact": "+91 98200 00014",
        "email": "connect@andherifitness.com",
        "website": "www.andherifitness.com",
        "isOpen": true,
        "openingHours": {
          "monday": "05:30-23:00",
          "tuesday": "05:30-23:00",
          "wednesday": "05:30-23:00",
          "thursday": "05:30-23:00",
          "friday": "05:30-23:00",
          "saturday": "06:00-22:00",
          "sunday": "06:00-22:00"
        },
        "amenities": ["Functional Training Area", "Lockers", "Showers", "Cafe", "Parking"],
        "membershipPlans": [
          { "plan": "Monthly", "price": 3000, "currency": "INR" },
          { "plan": "3 Months", "price": 8000, "currency": "INR" },
          { "plan": "6 Months", "price": 14000, "currency": "INR" },
          { "plan": "Yearly", "price": 25000, "currency": "INR" }
        ],
        "trainers": 10,
        "capacity": 150,
        "established": 2018,
        "description": "Modern fitness studio near Andheri Metro. Offers a mix of cardio, strength, and functional training.",
        "specialties": ["HIIT", "Functional Training", "Circuit Training", "Personal Training"],
        "paymentMethods": ["Cash", "Credit Card", "Debit Card", "UPI", "Wallet"]
      },
      {
        "name": "BKC Powerhouse Gym",
        "type": "gym",
        "address": "Bandra Kurla Complex, Near MCA",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400051",
        "country": "India",
        "lat": 19.066,
        "lng": 72.87,
        "rating": 4.7,
        "totalReviews": 423,
        "ratingBreakdown": {
          "5star": 290,
          "4star": 100,
          "3star": 22,
          "2star": 8,
          "1star": 3
        },
        "imageUrl": "https://img.freepik.com/free-photo/strong-man-training-gym_1303-23478.jpg?semt=ais_hybrid&w=740&q=80",
        "gallery": [
          "https://img.freepik.com/free-photo/strong-man-training-gym_1303-23478.jpg?semt=ais_hybrid&w=740&q=80"
        ],
        "contact": "+91 98200 00005",
        "alternateContact": "+91 98200 00015",
        "email": "info@bkcpowerhouse.com",
        "website": "www.bkcpowerhouse.com",
        "isOpen": true,
        "openingHours": {
          "monday": "05:00-00:00",
          "tuesday": "05:00-00:00",
          "wednesday": "05:00-00:00",
          "thursday": "05:00-00:00",
          "friday": "05:00-00:00",
          "saturday": "05:00-23:00",
          "sunday": "06:00-22:00"
        },
        "amenities": ["Premium Equipment", "Steam Room", "Sauna", "Juice Bar", "Valet Parking", "Personal Lockers", "Towel Service"],
        "membershipPlans": [
          { "plan": "Monthly", "price": 5000, "currency": "INR" },
          { "plan": "Quarterly", "price": 13500, "currency": "INR" },
          { "plan": "Half Yearly", "price": 24000, "currency": "INR" },
          { "plan": "Yearly", "price": 42000, "currency": "INR" }
        ],
        "trainers": 15,
        "capacity": 200,
        "established": 2017,
        "description": "Premium powerhouse gym in BKC. Features international standard equipment and celebrity trainers.",
        "specialties": ["Powerlifting", "Bodybuilding", "Athletic Training", "Nutrition Counseling"],
        "paymentMethods": ["Cash", "Credit Card", "Debit Card", "UPI", "NetBanking", "EMI"]
      },
      {
        "name": "Powai Strength Lab",
        "type": "gym",
        "address": "Hiranandani Estate, Powai",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400076",
        "country": "India",
        "lat": 19.1195,
        "lng": 72.8967,
        "rating": 4.3,
        "totalReviews": 198,
        "ratingBreakdown": {
          "5star": 105,
          "4star": 62,
          "3star": 18,
          "2star": 9,
          "1star": 4
        },
        "imageUrl": "https://www.shutterstock.com/image-photo/bodybuilder-pumping-his-biceps-dumbbell-260nw-2471712207.jpg",
        "gallery": [
          "https://www.shutterstock.com/image-photo/bodybuilder-pumping-his-biceps-dumbbell-260nw-2471712207.jpg"
        ],
        "contact": "+91 98200 00006",
        "alternateContact": "+91 98200 00016",
        "email": "info@powerstrengthlab.com",
        "website": "www.powaistrengthlab.com",
        "isOpen": true,
        "openingHours": {
          "monday": "06:00-22:00",
          "tuesday": "06:00-22:00",
          "wednesday": "06:00-22:00",
          "thursday": "06:00-22:00",
          "friday": "06:00-22:00",
          "saturday": "07:00-21:00",
          "sunday": "07:00-20:00"
        },
        "amenities": ["Power Racks", "Olympic Weights", "Cardio Zone", "Lockers", "Supplements Store"],
        "membershipPlans": [
          { "plan": "Monthly", "price": 2800, "currency": "INR" },
          { "plan": "3 Months", "price": 7500, "currency": "INR" },
          { "plan": "Yearly", "price": 26000, "currency": "INR" }
        ],
        "trainers": 7,
        "capacity": 100,
        "established": 2020,
        "description": "Strength-focused gym in Powai. Perfect for serious lifters and athletes.",
        "specialties": ["Powerlifting", "Strongman Training", "Strength & Conditioning"],
        "paymentMethods": ["Cash", "Credit Card", "UPI"]
      },
      {
        "name": "Vibe Yoga Studio - Andheri",
        "type": "yoga",
        "address": "JVLR Road, Andheri East",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400093",
        "country": "India",
        "lat": 19.11,
        "lng": 72.879,
        "rating": 4.5,
        "totalReviews": 312,
        "ratingBreakdown": {
          "5star": 185,
          "4star": 95,
          "3star": 22,
          "2star": 7,
          "1star": 3
        },
        "imageUrl": "https://www.verywellhealth.com/thmb/Nux1ov0gbgO3j4tzLd31aHPq6S0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-2155324511-b3e15462c6dc46e0b6060656638f04dd.jpg",
        "gallery": [
          "https://www.verywellhealth.com/thmb/Nux1ov0gbgO3j4tzLd31aHPq6S0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-2155324511-b3e15462c6dc46e0b6060656638f04dd.jpg"
        ],
        "contact": "+91 98200 00007",
        "alternateContact": "+91 98200 00017",
        "email": "hello@vibeyoga.com",
        "website": "www.vibeyoga.com",
        "isOpen": true,
        "openingHours": {
          "monday": "07:30-21:00",
          "tuesday": "07:30-21:00",
          "wednesday": "07:30-21:00",
          "thursday": "07:30-21:00",
          "friday": "07:30-21:00",
          "saturday": "08:00-20:00",
          "sunday": "08:00-18:00"
        },
        "amenities": ["Eco-friendly Mats", "Essential Oils", "Changing Rooms", "Tea Bar", "Reading Lounge"],
        "membershipPlans": [
          { "plan": "Drop-in", "price": 600, "currency": "INR" },
          { "plan": "5 Classes", "price": 2500, "currency": "INR" },
          { "plan": "10 Classes", "price": 4500, "currency": "INR" },
          { "plan": "Monthly Unlimited", "price": 4000, "currency": "INR" }
        ],
        "trainers": 5,
        "capacity": 35,
        "established": 2021,
        "description": "Vibrant yoga studio on JVLR. Focuses on mindful movement and breathwork.",
        "specialties": ["Vinyasa", "Yin Yoga", "Kundalini", "Sound Healing"],
        "paymentMethods": ["Cash", "Credit Card", "UPI", "Google Pay"]
      },
      {
        "name": "Ghatkopar Core Pilates",
        "type": "pilates",
        "address": "Linking Road, Ghatkopar",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400077",
        "country": "India",
        "lat": 19.07,
        "lng": 72.9,
        "rating": 4.1,
        "totalReviews": 134,
        "ratingBreakdown": {
          "5star": 60,
          "4star": 45,
          "3star": 18,
          "2star": 8,
          "1star": 3
        },
        "imageUrl": "https://www.popsci.com/wp-content/uploads/2025/10/Pilates-started-in-a-WWI-prisoner-of-war-camp.png",
        "gallery": [
          "https://www.popsci.com/wp-content/uploads/2025/10/Pilates-started-in-a-WWI-prisoner-of-war-camp.png"
        ],
        "contact": "+91 98200 00008",
        "alternateContact": "+91 98200 00018",
        "email": "core@ghatkoparpilates.com",
        "website": "www.ghatkoparcorepilates.com",
        "isOpen": false,
        "openingHours": {
          "monday": "09:00-19:00",
          "tuesday": "09:00-19:00",
          "wednesday": "09:00-19:00",
          "thursday": "09:00-19:00",
          "friday": "09:00-19:00",
          "saturday": "10:00-17:00",
          "sunday": "Closed"
        },
        "amenities": ["Pilates Reformer", "Cadillac", "Wunda Chair", "Small Props"],
        "membershipPlans": [
          { "plan": "Single Session", "price": 900, "currency": "INR" },
          { "plan": "5 Pack", "price": 4000, "currency": "INR" },
          { "plan": "10 Pack", "price": 7500, "currency": "INR" }
        ],
        "trainers": 3,
        "capacity": 15,
        "established": 2022,
        "description": "Boutique Pilates studio on Linking Road. Temporarily closed. Specializes in core conditioning and postural alignment.",
        "specialties": ["Clinical Pilates", "Pre-natal Pilates", "Post-rehab"],
        "paymentMethods": ["Cash", "Credit Card", "UPI"]
      },
      {
        "name": "Zen Fitness Studio - Vikhroli",
        "type": "fitness_studio",
        "address": "Near Powai Road, Vikhroli",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400079",
        "country": "India",
        "lat": 19.08,
        "lng": 72.958,
        "rating": 4.0,
        "totalReviews": 156,
        "ratingBreakdown": {
          "5star": 65,
          "4star": 58,
          "3star": 20,
          "2star": 8,
          "1star": 5
        },
        "imageUrl": "https://thumbs.dreamstime.com/b/fitness-class-exercising-studio-gym-60910552.jpg",
        "gallery": [
          "https://thumbs.dreamstime.com/b/fitness-class-exercising-studio-gym-60910552.jpg"
        ],
        "contact": "+91 98200 00009",
        "alternateContact": "+91 98200 00019",
        "email": "zen@zenfitness.com",
        "website": "www.zenfitnessvikhroli.com",
        "isOpen": true,
        "openingHours": {
          "monday": "07:00-21:30",
          "tuesday": "07:00-21:30",
          "wednesday": "07:00-21:30",
          "thursday": "07:00-21:30",
          "friday": "07:00-21:30",
          "saturday": "08:00-20:00",
          "sunday": "08:00-18:00"
        },
        "amenities": ["Group Classes", "Locker Room", "Water Station", "Workout Towels"],
        "membershipPlans": [
          { "plan": "Monthly", "price": 2200, "currency": "INR" },
          { "plan": "Quarterly", "price": 5800, "currency": "INR" },
          { "plan": "Yearly", "price": 20000, "currency": "INR" }
        ],
        "trainers": 6,
        "capacity": 80,
        "established": 2019,
        "description": "Community-focused fitness studio near Powai Road. Known for friendly atmosphere and varied group classes.",
        "specialties": ["Zumba", "Aerobics", "Cross Training", "Senior Fitness"],
        "paymentMethods": ["Cash", "Credit Card", "UPI", "Paytm"]
      },
      {
        "name": "Urban Flex Gym - Lower Parel",
        "type": "gym",
        "address": "Near Kamala Mills, Lower Parel",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400013",
        "country": "India",
        "lat": 19.017,
        "lng": 72.836,
        "rating": 4.55,
        "totalReviews": 389,
        "ratingBreakdown": {
          "5star": 240,
          "4star": 110,
          "3star": 28,
          "2star": 8,
          "1star": 3
        },
        "imageUrl": "https://media.gettyimages.com/id/1183038884/photo/view-of-a-row-of-treadmills-in-a-gym-with-people.jpg?s=612x612&w=gi&k=20&c=-udh0-LUuB1Mr1rF7D4nbuaUOJ_x6JvZCYoLdfOJF3w=",
        "gallery": [
          "https://media.gettyimages.com/id/1183038884/photo/view-of-a-row-of-treadmills-in-a-gym-with-people.jpg?s=612x612&w=gi&k=20&c=-udh0-LUuB1Mr1rF7D4nbuaUOJ_x6JvZCYoLdfOJF3w="
        ],
        "contact": "+91 98200 00010",
        "alternateContact": "+91 98200 00020",
        "email": "urbanflex@urbanflex.com",
        "website": "www.urbanflexgym.com",
        "isOpen": true,
        "openingHours": {
          "monday": "05:00-00:00",
          "tuesday": "05:00-00:00",
          "wednesday": "05:00-00:00",
          "thursday": "05:00-00:00",
          "friday": "05:00-00:00",
          "saturday": "06:00-23:00",
          "sunday": "06:00-22:00"
        },
        "amenities": ["Rooftop Gym", "Smoothie Bar", "Steam Room", "Personal Training Rooms", "Parking", "Luxury Lockers"],
        "membershipPlans": [
          { "plan": "Monthly", "price": 4500, "currency": "INR" },
          { "plan": "Quarterly", "price": 12000, "currency": "INR" },
          { "plan": "Half Yearly", "price": 21000, "currency": "INR" },
          { "plan": "Yearly", "price": 38000, "currency": "INR" }
        ],
        "trainers": 12,
        "capacity": 180,
        "established": 2016,
        "description": "Trendy urban gym near Kamala Mills. Popular among young professionals. Features premium equipment and stunning city views.",
        "specialties": ["HIIT", "Boxing", "Spinning", "CrossFit Style Training"],
        "paymentMethods": ["Cash", "Credit Card", "Debit Card", "UPI", "NetBanking", "EMI"]
      }
    ];

    await FitnessCenter.insertMany(centers);
    console.log("Inserted fitness centers:", centers.length);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();