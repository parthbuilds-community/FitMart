export default function WorkoutLogSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm">
      <header className="mb-8 sm:mb-10 text-center md:text-left flex flex-col items-center md:items-start gap-3">
        <div className="bg-stone-200 animate-pulse h-3 w-32 rounded-full" />
        <div className="bg-stone-200 animate-pulse h-8 sm:h-10 w-64 rounded-full" />
      </header>

      <div className="space-y-8">
        {/* Workout Title Skeleton */}
        <div>
          <div className="bg-stone-200 animate-pulse h-3 w-24 rounded-full mb-4" />
          <div className="bg-stone-200 animate-pulse h-10 sm:h-12 w-full md:w-3/4 rounded-xl" />
        </div>

        {/* Workout Notes Skeleton */}
        <div>
          <div className="bg-stone-200 animate-pulse h-3 w-32 rounded-full mb-4" />
          <div className="bg-stone-200 animate-pulse w-full rounded-xl sm:rounded-2xl min-h-75 sm:min-h-112.5" />
        </div>

        {/* Selected Exercises Section Skeleton */}
        <div>
          <div className="bg-stone-200 animate-pulse h-3 w-40 rounded-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden flex flex-col h-64"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-full bg-stone-200 animate-pulse aspect-video" />
                <div className="p-4 flex flex-col grow gap-3 justify-center">
                  <div className="bg-stone-200 animate-pulse h-4 w-1/2 rounded-full mb-1" />
                  <div className="space-y-2">
                    <div className="bg-stone-200 animate-pulse h-3 w-3/4 rounded-full" />
                    <div className="bg-stone-200 animate-pulse h-3 w-2/3 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="space-y-4">
          <div className="bg-stone-200 animate-pulse h-[3.25rem] w-full rounded-full" />
          <div className="bg-stone-200 animate-pulse h-[3.25rem] w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
