const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  bodyPart: { type: String },
  target: { type: String },
  equipment: { type: String },
  gifUrl: { type: String }
}, { _id: false });

const workoutLogSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  date: { 
    type: String, 
    required: true,
    index: true 
  },
  title: { type: String, default: 'Logged Workout' },
  notes: { type: String, default: '' },
  exercises: { type: [exerciseSchema], default: [] }
}, {
  timestamps: true
});

// A user can only have one workout log per day
workoutLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
