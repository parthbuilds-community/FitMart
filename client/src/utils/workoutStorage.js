import { getAuthHeaders } from "./getAuthHeaders";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Retrieves all stored workout logs from the backend.
 */
export const getWorkoutLogs = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API}/api/workouts`, { headers });
    if (!res.ok) throw new Error("Failed to fetch workouts");
    return await res.json();
  } catch (err) {
    console.error(err);
    return {};
  }
};

/**
 * Alias for getWorkoutLogs as requested.
 */
export const getWorkouts = getWorkoutLogs;

/**
 * Retrieves workout data for a specific date (YYYY-MM-DD).
 */
export const getWorkoutByDate = async (date) => {
  const logs = await getWorkoutLogs();
  return logs[date] || null;
};

/**
 * Saves a workout entry.
 * Expects: { date, title, notes, exercises? }
 */
export const saveWorkout = async (entry) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API}/api/workouts`, {
      method: "POST",
      headers,
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error("Failed to save workout");
    return await res.json();
  } catch (err) {
    console.error(err);
  }
};

/**
 * Removes a workout entry for a date.
 */
export const deleteWorkout = async (date) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API}/api/workouts/${date}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete workout");
  } catch (err) {
    console.error(err);
  }
};

/**
 * Adds an exercise to a workout for a specific date.
 * Prevents duplicate exercises based on exercise ID.
 * Expects exercise: { id, name, bodyPart, target, equipment, gifUrl }
 */
export const addExerciseToWorkout = async (date, exercise) => {
  const workout = (await getWorkoutByDate(date)) || { date, title: "", notes: "", exercises: [] };
  const exercises = workout.exercises || [];

  if (exercises.some(e => e.id === exercise.id)) {
    console.warn(`Exercise with ID ${exercise.id} already exists in this workout`);
    return;
  }

  exercises.push(exercise);
  await saveWorkout({ ...workout, date, exercises });
};

/**
 * Removes an exercise from a workout for a specific date.
 */
export const removeExerciseFromWorkout = async (date, exerciseId) => {
  const workout = await getWorkoutByDate(date);
  if (!workout) return;

  const exercises = (workout.exercises || []).filter(e => e.id !== exerciseId);
  await saveWorkout({ ...workout, date, exercises });
};

/**
 * Formats data specifically for FullCalendar events list.
 */
export const getAllWorkoutEvents = async () => {
  const logs = await getWorkoutLogs();
  return Object.keys(logs)
    .filter(date => {
      const log = logs[date];
      // A workout is "valid" if it has a title, notes, or at least one exercise
      return (log.title && log.title.trim() !== "") ||
             (log.notes && log.notes.trim() !== "") ||
             (log.exercises && log.exercises.length > 0);
    })
    .map(date => ({
      title: logs[date].title || 'Logged Workout',
      date: date,
      allDay: true,
    }));
};
