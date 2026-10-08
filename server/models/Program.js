const mongoose = require("mongoose");

const programExerciseSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },

    sets: {
      type: String,
      required: true,
    },

    reps: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const programDaySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
    },

    exercises: {
      type: [programExerciseSchema],
      required: true,
      validate: {
        validator: (exercises) =>
          exercises.length >= 4 && exercises.length <= 8,
        message: "Each day must contain between 4 and 8 exercises.",
      },
    },
  },
  { _id: false }
);

const programSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    category: {
      type: String,
      enum: [
  "Beginner",
  "Beginner-Intermediate",
  "Intermediate",
  "Advanced",
],
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    schedule: {
      type: [programDaySchema],
      required: true,
      validate: {
        validator: function (schedule) {
          return schedule.length === this.duration;
        },
        message: "Schedule must contain one entry for every program day.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Program", programSchema);