export default function WorkoutLogSkeleton() {
  return (
    <div className="bg-white border border-stone-100 rounded-2xl p-6 space-y-5 animate-pulse">
      {/* Title */}
      <div className="h-6 w-1/3 bg-stone-200 rounded-full" />

      {/* Workout field */}
      <div className="space-y-2">
        <div className="h-3 w-1/4 bg-stone-200 rounded-full" />
        <div className="h-24 w-full bg-stone-100 border border-stone-200 rounded-2xl" />
      </div>

      {/* Notes field */}
      <div className="space-y-2">
        <div className="h-3 w-1/4 bg-stone-200 rounded-full" />
        <div className="h-32 w-full bg-stone-100 border border-stone-200 rounded-2xl" />
      </div>

      {/* Button */}
      <div className="h-10 w-32 bg-stone-200 rounded-full" />
    </div>
  );
}