const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bodyPart: { type: String, required: true },
  target: { type: String, required: true },
  equipment: { type: String },
  gifUrl: { type: String },
  instructions: [String]
});

module.exports = mongoose.model('Exercise', exerciseSchema);