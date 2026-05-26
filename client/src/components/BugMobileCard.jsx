import { useState } from "react";
import BugAvatar from "./BugAvatar";

const PLACEHOLDER_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60' viewBox='0 0 80 60'%3E%3Crect width='80' height='60' fill='%23e5e7eb'/%3E%3Cpath d='M30 20 Q40 10 50 20 L55 35 H25Z' fill='%23d1d5db'/%3E%3Ccircle cx='52' cy='18' r='6' fill='%23d1d5db'/%3E%3C/svg%3E";

function LazyScreenshot({ src, title }) {
  const [failed, setFailed] = useState(false);
  if (!src) return null;
  return (
    <img
      src={failed ? PLACEHOLDER_SRC : src}
      alt={`Screenshot for bug: ${title}`}
      loading="lazy"
      width={80}
      height={60}
      onError={() => setFailed(true)}
      className={`rounded object-cover border border-gray-200 ${failed ? "opacity-40" : ""}`}
    />
  );
}

const STATUS_OPTIONS = ["open", "in-progress", "resolved", "closed"];

const STATUS_COLORS = {
  open:        "bg-red-100 text-red-700 ring-red-300",
  "in-progress":"bg-yellow-100 text-yellow-700 ring-yellow-300",
  resolved:    "bg-green-100 text-green-700 ring-green-300",
  closed:      "bg-gray-100 text-gray-600 ring-gray-300",
};

export default function BugMobileCard({ bug, onStatusChange, updating }) {
  return (
    <article
      className={`
        rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3 transition-opacity
        ${updating ? "opacity-60 pointer-events-none" : ""}
      `}
      aria-label={`Bug report: ${bug.title}`}
      aria-busy={updating}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <BugAvatar name={bug.userName || bug.userEmail || "?"} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm leading-tight">{bug.title}</p>
          <p className="text-xs text-gray-500 truncate">{bug.userEmail}</p>
        </div>
        {/* Current status badge */}
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${
            STATUS_COLORS[bug.status] || STATUS_COLORS.open
          }`}
        >
          {bug.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600">{bug.description}</p>

      {/* Screenshot */}
      <LazyScreenshot src={bug.screenshotUrl} title={bug.title} />

      {/* Status picker buttons */}
      <div role="group" aria-label={`Update status for: ${bug.title}`}>
        <p className="text-xs font-medium text-gray-500 mb-1.5">
          Update status:
          {/* Inline saving indicator */}
          {updating && (
            <span
              aria-label="Saving…"
              className="ml-2 inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin align-middle"
            />
          )}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((s) => {
            const isActive = bug.status === s;
            return (
              <button
                key={s}
                disabled={updating}
                aria-pressed={isActive}       
                aria-label={`Set status to ${s}`}
                onClick={() => !isActive && onStatusChange(bug._id, s)}
                className={`
                  text-xs px-2.5 py-1 rounded-full border transition
                  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400
                  ${isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : updating
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                  }
                `}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date */}
      <p className="text-xs text-gray-400">
        Reported {new Date(bug.createdAt).toLocaleDateString()}
      </p>
    </article>
  );
}