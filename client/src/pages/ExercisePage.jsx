import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { addExerciseToWorkout, getWorkoutByDate } from "../utils/workoutStorage";

const CATEGORIES = [
  { id: "chest", name: "Chest" },
  { id: "back", name: "Back" },
  { id: "arms", name: "Arms" },
  { id: "legs", name: "Legs" },
  { id: "shoulders", name: "Shoulders" },
  { id: "abs", name: "Abs" },
  { id: "cardio", name: "Cardio" },
];

export default function ExercisePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("chest");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [imageErrors, setImageErrors] = useState(new Set());

  // Get selected date from localStorage on mount
  useEffect(() => {
    const storedDate = localStorage.getItem("selectedDate");
    if (storedDate) {
      setSelectedDate(storedDate);
    }
  }, []);

  // Fetch exercises when category changes
  useEffect(() => {
    fetchExercises(selectedCategory);
  }, [selectedCategory]);

  const fetchExercises = async (bodyPart) => {
    setLoading(true);
    setError("");
    setExercises([]);
    setImageErrors(new Set());

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/exercises/${bodyPart}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch exercises. Status: ${response.status}`);
      }

      const data = await response.json();

      // Client-side debug logging
      if (data && data.length > 0) {
        const firstEx = data[0];
        console.log(`\n[Exercise Client] Received ${data.length} exercises for "${bodyPart}"`);
        console.log("  First exercise name:", firstEx.name);
        console.log("  First exercise gifUrl:", firstEx.gifUrl ? `✅ Present` : "❌ null");
        console.log("  First exercise imageUrl:", firstEx.imageUrl ? `✅ Present` : "❌ null");
        if (firstEx.gifUrl) {
          console.log("  GIF URL preview:", firstEx.gifUrl.substring(0, 100));
        }
        console.log("");
      }

      setExercises(data || []);
    } catch (err) {
      setError(err.message || "Failed to load exercises. Please try again.");
      console.error("Exercise fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseSelect = (exercise) => {
    if (!selectedDate) {
      alert("No date selected. Please go back and select a date first.");
      return;
    }

    // Add exercise to the workout
    addExerciseToWorkout(selectedDate, exercise);

    // Navigate back to notes page
    localStorage.setItem("selectedDate", selectedDate);
    navigate("/notes");
  };

  const handleImageError = (exerciseId) => {
    console.warn(`[Exercise Client] Image failed to load for exercise ID: ${exerciseId}`);
    setImageErrors((prev) => new Set([...prev, exerciseId]));
  };

  const handleBack = () => {
    navigate("/notes");
  };

  return (
    <div className="min-h-screen bg-stone-50 font-['DM_Sans',sans-serif]">
      <Navbar variant="product" />

      <main className="max-w-7xl mx-auto px-5 lg:px-10 py-12 sm:py-16">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="text-xs tracking-[0.2em] uppercase text-stone-400 hover:text-stone-900 transition-colors mb-12 flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Workout
        </button>

        <header className="mb-12 text-center md:text-left">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2 font-medium">Exercise library</p>
          <h1 className="font-['DM_Serif_Display'] text-4xl md:text-5xl lg:text-6xl text-stone-900 leading-tight">
            Choose Your Exercise
          </h1>
        </header>

        {/* Category Filter */}
        <section className="mb-12">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-6 py-3 rounded-full transition-all duration-300 font-medium tracking-wide
                  ${selectedCategory === cat.id
                    ? "bg-stone-900 text-white shadow-lg shadow-stone-200"
                    : "bg-white border border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Exercises Grid */}
        {loading && (
          <section className="min-h-100 border-2 border-dashed border-stone-200 rounded-3xl flex items-center justify-center bg-white/50">
            <div className="text-center p-8">
              <div className="inline-block w-12 h-12 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin mb-4"></div>
              <p className="text-stone-400 text-sm font-medium uppercase tracking-widest">
                Loading exercises...
              </p>
            </div>
          </section>
        )}

        {error && (
          <section className="min-h-100 border-2 border-dashed border-stone-300 rounded-3xl flex items-center justify-center bg-stone-50">
            <div className="text-center p-8">
              <p className="text-3xl mb-4">⚠️</p>
              <p className="text-stone-700 text-sm font-medium uppercase tracking-widest">
                {error}
              </p>
              <button
                onClick={() => fetchExercises(selectedCategory)}
                className="mt-6 text-xs px-6 py-2 rounded-full bg-stone-900 text-white hover:bg-stone-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </section>
        )}

        {!loading && !error && exercises.length === 0 && (
          <section className="min-h-100 border-2 border-dashed border-stone-200 rounded-3xl flex items-center justify-center bg-white/50">
            <div className="text-center p-8">
              <p className="text-3xl mb-4">∅</p>
              <p className="text-stone-400 text-sm font-medium uppercase tracking-widest">
                No exercises found
              </p>
              <p className="text-stone-300 text-xs mt-2">Try selecting a different category.</p>
            </div>
          </section>
        )}

        {!loading && !error && exercises.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-900 hover:shadow-lg transition-all duration-300 group flex flex-col"
              >
                {/* Exercise Media Container */}
                <div className="w-full bg-stone-100 overflow-hidden aspect-square flex items-center justify-center">
                  {exercise.gifUrl && exercise.gifUrl.trim() !== "" && !imageErrors.has(exercise.id) ? (
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => handleImageError(exercise.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-100 group-hover:bg-stone-200 transition-colors">
                      <div className="text-center">
                        <p className="text-stone-400 text-2xl mb-2">🏋️</p>
                        <p className="text-stone-400 text-xs uppercase tracking-wide font-medium">
                          Exercise illustration
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Exercise Details */}
                <div className="p-5 md:p-6 flex flex-col grow">
                  <h3 className="font-['DM_Serif_Display'] text-lg md:text-xl text-stone-900 mb-2 capitalize line-clamp-2">
                    {exercise.name}
                  </h3>

                  <div className="space-y-2 mb-5 text-xs text-stone-500 grow">
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
                    onClick={() => handleExerciseSelect(exercise)}
                    className="w-full bg-stone-900 text-white text-xs py-3 rounded-full hover:bg-stone-700 transition-all font-medium active:scale-95"
                  >
                    Add to Workout →
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
