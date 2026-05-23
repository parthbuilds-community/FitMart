const COLORS = [
  "bg-violet-500", "bg-blue-500",  "bg-emerald-500",
  "bg-amber-500",  "bg-rose-500",  "bg-cyan-500",
  "bg-pink-500",   "bg-indigo-500",
];

export default function BugAvatar({ name = "?", size = "md" }) {
  const initial = name.charAt(0).toUpperCase();

  const colorClass = COLORS[name.charCodeAt(0) % COLORS.length];

  const sizeClass = size === "sm"
    ? "w-7 h-7 text-xs"
    : "w-9 h-9 text-sm";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white select-none ${colorClass} ${sizeClass}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}