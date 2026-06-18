const mongoose = require("mongoose");

const emailValidator = {
  validator: function(v) {
    if (v === null || v === undefined || v === '') return true;
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
  },
  message: props => `${props.value} is not a valid email address!`
};

const phoneValidator = {
  validator: function(v) {
    if (v === null || v === undefined || v === '') return true;
    return /^\+?[\d\s\-]{7,20}$/.test(v);
  },
  message: props => `${props.value} is not a valid phone number!`
};

const websiteValidator = {
  validator: function(v) {
    if (v === null || v === undefined || v === '') return true;
    return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
  },
  message: props => `${props.value} is not a valid website URL!`
};

const dailyScheduleSchema = new mongoose.Schema(
  {
    open: {
      type: String,
      validate: {
        validator: function(v) {
          if (v === null || v === undefined || v === '') return true;
          return /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
        },
        message: props => `${props.value} is not a valid 24-hour time format (HH:MM)`
      }
    },
    close: {
      type: String,
      validate: {
        validator: function(v) {
          if (v === null || v === undefined || v === '') return true;
          return /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
        },
        message: props => `${props.value} is not a valid 24-hour time format (HH:MM)`
      }
    },
    closed: { type: Boolean, default: false }
  },
  { _id: false }
);

const fitnessCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["gym", "yoga", "pilates", "fitness_studio"], required: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    rating: { type: Number, min: 0, max: 5, default: 4.0 },
    totalReviews: { type: Number, default: 0 },
    ratingBreakdown: {
      "5star": { type: Number, default: 0 },
      "4star": { type: Number, default: 0 },
      "3star": { type: Number, default: 0 },
      "2star": { type: Number, default: 0 },
      "1star": { type: Number, default: 0 }
    },
    imageUrl: { type: String },
    gallery: { type: [String], default: [] },
    contact: { type: String, validate: phoneValidator },
    alternateContact: { type: String, validate: phoneValidator },
    email: { type: String, validate: emailValidator },
    website: { type: String, validate: websiteValidator },
    isOpen: { type: Boolean, default: true },
    openingHours: {
      monday: { type: dailyScheduleSchema },
      tuesday: { type: dailyScheduleSchema },
      wednesday: { type: dailyScheduleSchema },
      thursday: { type: dailyScheduleSchema },
      friday: { type: dailyScheduleSchema },
      saturday: { type: dailyScheduleSchema },
      sunday: { type: dailyScheduleSchema }
    },
    amenities: { type: [String], default: [] },
    membershipPlans: [
      {
        plan: { type: String },
        price: { type: Number },
        currency: { type: String }
      }
    ],
    trainers: { type: Number, default: 0 },
    capacity: { type: Number },
    established: { type: Number },
    description: { type: String },
    specialties: { type: [String], default: [] },
    paymentMethods: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FitnessCenter", fitnessCenterSchema);

