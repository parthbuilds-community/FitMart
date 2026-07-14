import { create } from "zustand";

/**
 * Zustand store for workout UI state.
 * Replaces fragile localStorage-based state sharing between
 * WorkoutCalendar, NotesPage, and ExercisePage.
 */
const useWorkoutStore = create((set) => ({
  /** Currently selected date string (YYYY-MM-DD) */
  selectedDate: "",

  /** Draft workout data preserved across page navigations */
  draftWorkout: {
    title: "",
    notes: "",
    exercises: [],
  },

  /** Set the selected date */
  setSelectedDate: (date) => set({ selectedDate: date }),

  /** Clear selected date */
  clearSelectedDate: () => set({ selectedDate: "" }),

  /** Set the entire draft workout */
  setDraftWorkout: (workout) => set({ draftWorkout: workout }),

  /** Update specific fields in the draft workout */
  updateDraftWorkout: (fields) =>
    set((state) => ({
      draftWorkout: { ...state.draftWorkout, ...fields },
    })),

  /** Clear the draft workout back to defaults */
  clearDraftWorkout: () =>
    set({
      draftWorkout: { title: "", notes: "", exercises: [] },
    }),
}));

export default useWorkoutStore;
