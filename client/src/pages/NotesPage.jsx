import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WorkoutLogSkeleton from "../components/WorkoutLogSkeleton";
import {
  getWorkoutByDate,
  removeExerciseFromWorkout,
  saveWorkout,
} from "../utils/workoutStorage";

export default function NotesPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState(new Set());

  useEffect(() => {
    let active = true;

    const loadWorkout = async () => {
      const storedDate = localStorage.getItem("selectedDate");

      if (!storedDate) {
        if (active) {
          setError("No date selected. Please go back to the calendar and select a date.");
          setLoading(false);
        }
        return;
      }

      if (active) setDate(storedDate);

      try {
        // Promise.resolve preserves compatibility with the local-storage implementation.
        const workout = await Promise.resolve(getWorkoutByDate(storedDate));
        if (active && workout) {
          setTitle(workout.title || "");
          setNotes(workout.notes || "");
          setExercises(workout.exercises || []);
        }
      } catch {
        if (active) {
          setError("Unable to load this workout. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadWorkout();

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a workout title.");
      return;
    }

    await Promise.resolve(saveWorkout({ date, title, notes, exercises }));
    setSaved(true);
    setTimeout(() => navigate("/tracker"), 1000);
  };

  const handleAddExercise = async () => {
    await Promise.resolve(saveWorkout({ date, title, notes, exercises }));
    localStorage.setItem("selectedDate", date);
    navigate("/exercises");
  };

  const handleRemoveExercise = async (exerciseId) => {
    await Promise.resolve(removeExerciseFromWorkout(date, exerciseId));
    setExercises((current) => current.filter((exercise) => exercise.id !== exerciseId));
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-stone-50 font-['DM_Sans',sans-serif]">
      <Navbar variant="product" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
        {loading ? (
          <WorkoutLogSkeleton />
        ) : error ? (
          <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-2xl p-10 text-center">
            <p className="text-stone-700 font-medium mb-6">{error}</p>
            <button
              onClick={() => navigate("/tracker")}
              className="w-full bg-stone-900 text-white py-3 rounded-full hover:bg-stone-700 transition-all font-medium"
            >
              Back to Tracker
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate("/tracker")}
              className="text-xs tracking-[0.2em] uppercase text-stone-400 hover:text-stone-900 transition-colors mb-12 flex items-center gap-2 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">{"<-"}</span>
              Back to Calendar
            </button>

            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm">
              <header className="mb-8 sm:mb-10 text-center md:text-left">
                <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-stone-400 mb-2 font-medium">
                  Training Session For
                </p>
                <h1 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl text-stone-900">
                  {formattedDate}
                </h1>
              </header>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs text-stone-500 mb-2 tracking-wide uppercase">
                    Workout Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      setSaved(false);
                    }}
                    placeholder="e.g. Chest Day"
                    className="w-full border-b border-stone-200 bg-transparent py-3 text-2xl sm:text-3xl md:text-4xl text-stone-900 font-['DM_Serif_Display'] placeholder-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-500 mb-2 tracking-wide uppercase">
                    Workout Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(event) => {
                      setNotes(event.target.value);
                      setSaved(false);
                    }}
                    placeholder="List exercises, weight, reps..."
                    rows={12}
                    className="w-full border border-stone-200 bg-white rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-6 text-sm sm:text-base text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors resize-none min-h-75 sm:min-h-112.5 leading-relaxed"
                  />
                </div>

                {exercises.length > 0 && (
                  <div>
                    <p className="block text-xs text-stone-500 mb-4 tracking-wide uppercase">
                      Selected Exercises ({exercises.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden flex flex-col"
                        >
                          <div className="w-full bg-stone-100 overflow-hidden aspect-video flex items-center justify-center">
                            {exercise.gifUrl && !imageErrors.has(exercise.id) ? (
                              <img
                                src={exercise.gifUrl}
                                alt={exercise.name}
                                className="w-full h-full object-cover"
                                onError={() =>
                                  setImageErrors((current) => new Set([...current, exercise.id]))
                                }
                              />
                            ) : (
                              <p className="text-stone-400 text-xs uppercase tracking-wide font-medium">
                                Exercise
                              </p>
                            )}
                          </div>
                          <div className="p-4 flex flex-col grow">
                            <h2 className="font-['DM_Serif_Display'] text-lg text-stone-900 mb-2 capitalize">
                              {exercise.name}
                            </h2>
                            <p className="text-xs text-stone-500 mb-4 grow capitalize">
                              {[exercise.target, exercise.equipment].filter(Boolean).join(" / ")}
                            </p>
                            <button
                              onClick={() => handleRemoveExercise(exercise.id)}
                              className="text-xs text-stone-500 hover:text-stone-900 uppercase tracking-wide transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddExercise}
                  className="w-full bg-stone-100 text-stone-900 text-sm py-4 rounded-full hover:bg-stone-900 hover:text-white transition-all font-medium border border-stone-200 hover:border-stone-900"
                >
                  + Add Your Exercise
                </button>
                <button
                  onClick={handleSave}
                  className={`w-full text-sm py-4 rounded-full transition-all font-medium ${
                    saved
                      ? "bg-stone-700 text-stone-300"
                      : "bg-stone-900 text-white hover:bg-stone-700 shadow-lg shadow-stone-200/50"
                  }`}
                >
                  {saved ? "Saved" : "Save Workout"}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
