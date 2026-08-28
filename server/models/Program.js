const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // Number of days (e.g., 28)
  category: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  image: { type: String },
  schedule: [{
    day: Number,
    exercises: [{
      exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
      sets: String,
      reps: String
    }]
  }]
});

module.exports = mongoose.model('Program', programSchema);