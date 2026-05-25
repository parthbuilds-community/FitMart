const WorkoutLog = require("../models/WorkoutLog");

/**
 * Retrieves a user's workout logs keyed by date for client compatibility.
 *
 * @param {string} userId - The authenticated Firebase UID.
 * @returns {Promise<Object>} Workout logs keyed by YYYY-MM-DD date.
 */
async function getWorkoutLogsByUser(userId) {
  const logs = await WorkoutLog.find({ userId });

  return logs.reduce((formattedLogs, log) => {
    formattedLogs[log.date] = {
      title: log.title,
      notes: log.notes,
      exercises: log.exercises,
    };
    return formattedLogs;
  }, {});
}

/**
 * Creates or updates one workout log belonging to a user.
 *
 * @param {string} userId - The authenticated Firebase UID.
 * @param {Object} entry - Workout input data.
 * @returns {Promise<Object>} The persisted workout log document.
 */
async function upsertWorkoutLog(userId, entry) {
  const { date, title = "", notes = "", exercises = [] } = entry;

  return WorkoutLog.findOneAndUpdate(
    { userId, date },
    { $set: { title, notes, exercises } },
    { new: true, upsert: true, runValidators: true },
  );
}

/**
 * Deletes a user's workout log for a date.
 *
 * @param {string} userId - The authenticated Firebase UID.
 * @param {string} date - Date in YYYY-MM-DD format.
 * @returns {Promise<Object|null>} The deleted workout log, when present.
 */
async function deleteWorkoutLog(userId, date) {
  return WorkoutLog.findOneAndDelete({ userId, date });
}

module.exports = {
  deleteWorkoutLog,
  getWorkoutLogsByUser,
  upsertWorkoutLog,
};
