export default function WorkoutLogSkeleton() {
  return (
    <div aria-label="Loading workout log" aria-busy="true" role="status">
      <div className="h-4 w-36 bg-stone-200 rounded-full animate-pulse mb-12" />

      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm">
        <div className="mb-8 sm:mb-10">
          <div className="h-3 w-32 bg-stone-100 rounded-full animate-pulse mb-4" />
          <div className="h-9 w-3/5 max-w-sm bg-stone-100 rounded-full animate-pulse" />
        </div>

        <div className="space-y-8">
          <div>
            <div className="h-3 w-28 bg-stone-100 rounded-full animate-pulse mb-5" />
            <div className="h-10 w-full bg-stone-100 rounded-lg animate-pulse" />
          </div>

          <div>
            <div className="h-3 w-28 bg-stone-100 rounded-full animate-pulse mb-5" />
            <div className="h-75 sm:h-112.5 w-full bg-stone-100 rounded-xl sm:rounded-2xl animate-pulse" />
          </div>

          <div className="h-13 w-full bg-stone-100 rounded-full animate-pulse" />
          <div className="h-13 w-full bg-stone-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
