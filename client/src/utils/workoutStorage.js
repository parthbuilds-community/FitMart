import { getAuthHeaders } from "./getAuthHeaders";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Retrieves all stored workout logs from the backend.
 */
export const getWorkoutLogs = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API}/api/workouts`, { headers });
    if (!response.ok) throw new Error("Failed to fetch workouts");
    return await response.json();
  } catch (error) {
    console.error(error);
    return {};
  }
};

export const getWorkouts = getWorkoutLogs;

/**
 * Retrieves workout data for a specific date (YYYY-MM-DD).
 */
export const getWorkoutByDate = async (date) => {
  const logs = await getWorkoutLogs();
  return logs[date] || null;
};

/**
 * Creates or updates a workout entry.
 */
export const saveWorkout = async (entry) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API}/api/workouts`, {
    method: "POST",
    headers,
    body: JSON.stringify(entry),
  });

  if (!response.ok) throw new Error("Failed to save workout");
  return response.json();
};

/**
 * Removes a workout entry for a date.
 */
export const deleteWorkout = async (date) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API}/api/workouts/${date}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) throw new Error("Failed to delete workout");
};

/**
 * Adds one exercise while preserving the remainder of the workout entry.
 */
export const addExerciseToWorkout = async (date, exercise) => {
  const workout = (await getWorkoutByDate(date)) || {
    date,
    title: "",
    notes: "",
    exercises: [],
  };
  const exercises = workout.exercises || [];

  if (exercises.some((item) => item.id === exercise.id)) {
    return;
  }

  await saveWorkout({ ...workout, date, exercises: [...exercises, exercise] });
};

/**
 * Removes one exercise while preserving the remainder of the workout entry.
 */
export const removeExerciseFromWorkout = async (date, exerciseId) => {
  const workout = await getWorkoutByDate(date);
  if (!workout) return;

  const exercises = (workout.exercises || []).filter((item) => item.id !== exerciseId);
  await saveWorkout({ ...workout, date, exercises });
};

/**
 * Formats saved workouts for FullCalendar.
 */
export const getAllWorkoutEvents = async () => {
  const logs = await getWorkoutLogs();

  return Object.keys(logs)
    .filter((date) => {
      const log = logs[date];
      return (
        (log.title && log.title.trim() !== "") ||
        (log.notes && log.notes.trim() !== "") ||
        (log.exercises && log.exercises.length > 0)
      );
    })
    .map((date) => ({
      title: logs[date].title || "Logged Workout",
      date,
      allDay: true,
    }));
};
