/**
 * Utility for managing workout logs in localStorage.
 * Aligned with specific user requirements for Notes and Titles.
 */

const STORAGE_KEY = 'fitmart_workout_logs';

/**
 * Retrieves all stored workout logs.
 */
export const getWorkoutLogs = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

/**
 * Alias for getWorkoutLogs as requested.
 */
export const getWorkouts = getWorkoutLogs;

/**
 * Retrieves workout data for a specific date (YYYY-MM-DD).
 */
export const getWorkoutByDate = (date) => {
  const logs = getWorkoutLogs();
  return logs[date] || null;
};

/**
 * Saves a workout entry.
 * Expects: { date, title, notes, exercises? }
 * Backward compatible with existing entries.
 */
export const saveWorkout = (entry) => {
  const { date, title, notes, exercises = [] } = entry;
  const logs = getWorkoutLogs();
  logs[date] = { 
    title, 
    notes,
    exercises: exercises || []
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

/**
 * Removes a workout entry for a date.
 */
export const deleteWorkout = (date) => {
  const logs = getWorkoutLogs();
  delete logs[date];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

/**
 * Adds an exercise to a workout for a specific date.
 * Prevents duplicate exercises based on exercise ID.
 * Expects exercise: { id, name, bodyPart, target, equipment, gifUrl }
 */
export const addExerciseToWorkout = (date, exercise) => {
  const workout = getWorkoutByDate(date);
  if (!workout) {
    console.warn(`No workout found for date ${date}`);
    return;
  }

  // Prevent duplicates
  const exercises = workout.exercises || [];
  if (exercises.some(e => e.id === exercise.id)) {
    console.warn(`Exercise with ID ${exercise.id} already exists in this workout`);
    return;
  }

  exercises.push(exercise);
  const updated = { ...workout, exercises };
  const logs = getWorkoutLogs();
  logs[date] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

/**
 * Removes an exercise from a workout for a specific date.
 */
export const removeExerciseFromWorkout = (date, exerciseId) => {
  const workout = getWorkoutByDate(date);
  if (!workout) return;

  const exercises = (workout.exercises || []).filter(e => e.id !== exerciseId);
  const updated = { ...workout, exercises };
  const logs = getWorkoutLogs();
  logs[date] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

/**
 * Formats data specifically for FullCalendar events list.
 */
export const getAllWorkoutEvents = () => {
  const logs = getWorkoutLogs();
  return Object.keys(logs).map(date => ({
    title: logs[date].title || 'Logged Workout',
    date: date, // FullCalendar can use 'date' or 'start'
    allDay: true,
  }));
};
