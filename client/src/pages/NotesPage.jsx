import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "../components/Navbar";
import { workoutLogSchema } from "../utils/formSchemas";
import { getWorkoutByDate, saveWorkout, removeExerciseFromWorkout } from "../utils/workoutStorage";

/**
 * NotesPage
 * Allows users to write workout details for a selected date.
 * Supports adding exercises, viewing exercise GIFs, and managing workout details.
 * Preserves content when navigating between notes and exercise selection.
 */
export default function NotesPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workoutLogSchema),
    defaultValues: { date: "", title: "", notes: "" },
  });

  useEffect(() => {
    // Get selectedDate from localStorage
    const storedDate = localStorage.getItem("selectedDate");
    if (!storedDate) {
      setError("No date selected. Please go back to the calendar and select a date.");
      return;
    }
    setDate(storedDate);
    // Set the date synchronously so the form is never submitted with an
    // empty date while the stored workout is still loading.
    reset({ date: storedDate });

    // Pre-fill if data exists
    getWorkoutByDate(storedDate).then(workout => {
      reset({
        date: storedDate,
        title: workout?.title || "",
        notes: workout?.notes || "",
      });
      setExercises(workout?.exercises || []);
    });
  }, [reset]);

  const handleSave = async (data) => {
    // Create entry object
    const entry = {
      date: data.date,
      title: data.title,
      notes: data.notes,
      exercises,
    };

    // Save functionality
    await saveWorkout(entry);
    setSaved(true);

    // Redirect to "/tracker" after a brief confirmation
    setTimeout(() => {
      navigate("/tracker");
    }, 1000);
  };

  const handleAddExercise = async () => {
    // Save draft state to backend (title/notes may be empty at this point)
    const title = getValues("title");
    const notes = getValues("notes");
    await saveWorkout({ date, title: title || "", notes: notes || "", exercises });

    // Determine suggested category
    const combinedText = `${title} ${notes}`.toLowerCase();
    let suggestedCategory = "chest"; // default
    if (combinedText.includes("back") || combinedText.includes("pull") || combinedText.includes("lat")) suggestedCategory = "back";
    else if (combinedText.includes("leg") || combinedText.includes("squat") || combinedText.includes("lower")) suggestedCategory = "legs";
    else if (combinedText.includes("arm") || combinedText.includes("bicep") || combinedText.includes("tricep")) suggestedCategory = "arms";
    else if (combinedText.includes("shoulder") || combinedText.includes("delt")) suggestedCategory = "shoulders";
    else if (combinedText.includes("abs") || combinedText.includes("core")) suggestedCategory = "abs";
    else if (combinedText.includes("cardio") || combinedText.includes("run")) suggestedCategory = "cardio";
    else if (combinedText.includes("chest") || combinedText.includes("push") || combinedText.includes("pec")) suggestedCategory = "chest";

    localStorage.setItem("selectedDate", date);
    navigate("/exercises", { state: { suggestedCategory } });
  };

  const handleRemoveExercise = async (exerciseId) => {
    await removeExerciseFromWorkout(date, exerciseId);
    setExercises(exercises.filter(e => e.id !== exerciseId));
  };

  const handleImageError = (exerciseId) => {
    setImageErrors((prev) => new Set([...prev, exerciseId]));
  };

  const formattedDate = date ? new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "";

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-10 text-center">
          <p className="text-3xl mb-4">∅</p>
          <p className="text-stone-700 font-medium mb-6">{error}</p>
          <button
            onClick={() => navigate("/tracker")}
            className="w-full bg-stone-900 text-white py-3 rounded-full hover:bg-stone-700 transition-all font-medium"
          >
            ← Back to Tracker
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-['DM_Sans',sans-serif]">
      <Navbar variant="product" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
        <button
          onClick={() => navigate("/tracker")}
          className="text-xs tracking-[0.2em] uppercase text-stone-400 hover:text-stone-900 transition-colors mb-12 flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Calendar
        </button>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm">
          <header className="mb-8 sm:mb-10 text-center md:text-left">
            <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-stone-400 mb-2 font-medium">Training Session For</p>
            <h1 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl text-stone-900">{formattedDate}</h1>
          </header>

          <form onSubmit={handleSubmit(handleSave)} className="space-y-8" noValidate>
            {/* Input field for "Workout Title" */}
            <div>
              <label htmlFor="workout-title" className="block text-xs text-stone-500 mb-2 tracking-wide uppercase">
                Workout Title
              </label>
              <input
                id="workout-title"
                type="text"
                placeholder="e.g. Chest Day"
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? "workout-title-error" : undefined}
                className={`w-full border-b bg-transparent py-3 text-2xl sm:text-3xl md:text-4xl text-stone-900
                           font-['DM_Serif_Display'] placeholder-stone-200 focus:outline-none transition-colors
                           ${errors.title
                    ? "border-red-400 focus:border-red-500"
                    : "border-stone-200 focus:border-stone-900"
                  }`}
                {...register("title")}
              />
              {errors.title && (
                <p id="workout-title-error" role="alert" className="text-xs text-red-600 mt-2">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Textarea for "Workout Notes" */}
            <div>
              <label htmlFor="workout-notes" className="block text-xs text-stone-500 mb-2 tracking-wide uppercase">
                Workout Notes
              </label>
              <textarea
                id="workout-notes"
                placeholder="List exercises, weight, reps..."
                rows={12}
                className="w-full border border-stone-200 bg-white rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-6 text-sm sm:text-base text-stone-700
                           placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors resize-none
                           min-h-75 sm:min-h-112.5 leading-relaxed"
                {...register("notes")}
              />
            </div>

            {/* Selected Exercises Section */}
            {exercises && exercises.length > 0 && (
              <div>
                <label className="block text-xs text-stone-500 mb-4 tracking-wide uppercase">
                  Selected Exercises ({exercises.length})
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden hover:border-stone-900 transition-all flex flex-col"
                    >
                      {/* Exercise Media Preview */}
                      <div className="w-full bg-stone-100 overflow-hidden aspect-video flex items-center justify-center">
                        {exercise.gifUrl && exercise.gifUrl.trim() !== "" && !imageErrors.has(exercise.id) ? (
                          <img
                            src={exercise.gifUrl}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(exercise.id)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-100">
                            <div className="text-center">
                              <p className="text-stone-400 text-2xl mb-1">🏋️</p>
                              <p className="text-stone-400 text-xs uppercase tracking-wide font-medium">
                                Exercise
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Exercise Details */}
                      <div className="p-4 flex flex-col grow">
                        <h4 className="font-['DM_Serif_Display'] text-base md:text-lg text-stone-900 mb-2 capitalize">
                          {exercise.name}
                        </h4>

                        <div className="space-y-1 text-xs text-stone-500 mb-4 grow">
                          {exercise.target && (
                            <p>
                              <span className="uppercase tracking-wide">Target:</span>{" "}
                              <span className="text-stone-700 capitalize">{exercise.target}</span>
                            </p>
                          )}
                          {exercise.equipment && (
                            <p>
                              <span className="uppercase tracking-wide">Equipment:</span>{" "}
                              <span className="text-stone-700 capitalize">{exercise.equipment}</span>
                            </p>
                          )}
                          {exercise.bodyPart && (
                            <p>
                              <span className="uppercase tracking-wide">Body Part:</span>{" "}
                              <span className="text-stone-700 capitalize">{exercise.bodyPart}</span>
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(exercise.id)}
                          className="text-xs text-stone-500 hover:text-stone-700 font-medium uppercase tracking-wide transition-colors"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Exercise Button */}
            <button
              type="button"
              onClick={handleAddExercise}
              className="w-full bg-stone-100 text-stone-900 text-sm py-4 rounded-full hover:bg-stone-900 hover:text-white transition-all font-medium border border-stone-200 hover:border-stone-900 active:scale-95"
            >
              + Add Your Exercise
            </button>

            {/* Save Button */}
            <button
              type="submit"
              className={`w-full text-sm py-4 rounded-full transition-all font-medium
                         ${saved ? "bg-stone-700 text-stone-300" : "bg-stone-900 text-white hover:bg-stone-700 shadow-lg shadow-stone-200/50"}`}
            >
              {saved ? "Saved ✓" : "Save Workout"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
