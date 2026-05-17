//  Add this skeleton Feature as  ProductCardSkeleton 

export default function ProductCardSkeleton({ index = 0 }) {
  const delay = { animationDelay: `${index * 60}ms` };

  return (
    <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="bg-stone-200 animate-pulse aspect-square w-full" style={delay} />

      <div className="p-3 sm:p-5 flex flex-col flex-1 gap-2 sm:gap-3">
        {/* Brand */}
        <div className="bg-stone-200 animate-pulse h-2.5 w-1/3 rounded-full" style={delay} />
        {/* Name */}
        <div className="bg-stone-200 animate-pulse h-3.5 w-3/4 rounded-full" style={delay} />
        <div className="bg-stone-200 animate-pulse h-3.5 w-1/2 rounded-full" style={delay} />
        {/* Stars */}
        <div className="bg-stone-200 animate-pulse h-2.5 w-1/4 rounded-full" style={delay} />
        {/* Price + button */}
        <div className="flex items-end justify-between mt-auto pt-1">
          <div className="space-y-1.5">
            <div className="bg-stone-200 animate-pulse h-4 w-16 rounded-full" style={delay} />
            <div className="bg-stone-200 animate-pulse h-3 w-10 rounded-full" style={delay} />
          </div>
          <div className="bg-stone-200 animate-pulse h-8 w-24 rounded-full" style={delay} />
        </div>
      </div>
    </div>
  );
}