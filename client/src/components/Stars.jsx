import { useId } from "react";

const starPath = "M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 19.897 4.665 24 6 15.595 0 9.748l8.332-1.73L12 .587z";

export default function Stars({ rating = 0, size = "sm" }) {
  const id = useId();
  const full = Math.floor(rating || 0);
  const half = (rating || 0) % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const sizeClass = size === "lg" ? "w-4 h-4" : "w-3 h-3";
  const color = size === "lg" ? "text-stone-700" : "text-stone-500";

  return (
    <span className={`inline-flex items-center gap-0.5 ${size === "lg" ? "text-base" : "text-xs"}`} aria-hidden>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`full-${i}`} className={`${sizeClass} ${color}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d={starPath} fill="currentColor" />
        </svg>
      ))}

      {half ? (
        <svg key="half" className={`${sizeClass} ${color}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id={`${id}-half`}><rect x="0" y="0" width="12" height="24" /></clipPath>
          </defs>
          <path d={starPath} fill="currentColor" style={{ opacity: 0.28 }} />
          <path d={starPath} fill="currentColor" clipPath={`url(#${id}-half)`} />
        </svg>
      ) : null}

      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`empty-${i}`} className={`${sizeClass} text-stone-300`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d={starPath} fill="currentColor" style={{ opacity: 0.28 }} />
        </svg>
      ))}
    </span>
  );
}
