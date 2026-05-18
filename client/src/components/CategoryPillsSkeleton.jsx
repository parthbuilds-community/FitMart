// this is skeleton feature on CategoryPillsSkeleton

export default function CategoryPillsSkeleton() {
  // Mimic: All, Equipment, Nutrition, Wearables
  const widths = ["w-12", "w-24", "w-20", "w-24"];

  return (
    <div className="flex gap-2 mb-5 sm:mb-8 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      {widths.map((w, i) => (
        <div
          key={i}
          className={`bg-stone-200 animate-pulse h-8 ${w} rounded-full flex-shrink-0`}
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}