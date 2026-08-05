// Client-side Zod schemas for frontend forms.
//
// These mirror the backend validation in server/validation/requestSchemas.js so
// users get the same rules and error messages before the request ever hits the
// API. If client and server ever move into a shared package, these can be
// extracted to a single source of truth.
import { z } from "zod";

const workoutExerciseSchema = z
  .object({
    id: z.string().min(1, "id is required"),
    name: z.string().min(1, "name is required"),
    bodyPart: z.string().optional(),
    target: z.string().optional(),
    equipment: z.string().optional(),
    gifUrl: z.string().optional(),
  })
  .strict();

// Mirrors the backend `workoutLogBodySchema`, with one intentional difference:
// the UI requires a workout title before saving (the backend keeps `title`
// optional so stored drafts never fail server-side), so we enforce it here.
//
// Note: exercise entries are picked via a separate flow and are not part of the
// react-hook-form fields on NotesPage, so they are merged in after validation
// and validated by the backend on save (as before this refactor).
export const workoutLogSchema = z
  .object({
    date: z
      .string()
      .min(1, "No date selected. Please go back to the calendar and select a date."),
    title: z.string().trim().min(1, "Please enter a workout title."),
    notes: z.string().optional(),
    exercises: z.array(workoutExerciseSchema).optional(),
  })
  .strict();
