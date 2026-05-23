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
      style={{ minWidth: 80 }}
    />
  );
}


const STATUS_OPTIONS = ["open", "in-progress", "resolved", "closed"];

export default function BugRow({ bug, index, onStatusChange, updating }) {
  const isEven = index % 2 === 0;

  return (
    <tr
      className={`
        ${isEven ? "bg-white" : "bg-gray-50"}
        transition-colors
        ${updating ? "opacity-60 pointer-events-none" : "hover:bg-blue-50"}
      `}
      aria-busy={updating} 
    >
      {/* Row number */}
      <td className="px-4 py-3 text-center text-gray-400 text-sm">{index + 1}</td>

      {/* User info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <BugAvatar name={bug.userName || bug.userEmail || "?"} />
          <div>
            <p className="text-sm font-medium text-gray-800 leading-tight">
              {bug.userName || "—"}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[160px]">
              {bug.userEmail}
            </p>
          </div>
        </div>
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <p className="text-sm text-gray-800 font-medium">{bug.title}</p>
      </td>

      {/* Description */}
      <td className="px-4 py-3 max-w-xs">
        <p className="text-sm text-gray-600 line-clamp-2">{bug.description}</p>
      </td>

      {/* Screenshot */}
      <td className="px-4 py-3">
        <LazyScreenshot src={bug.screenshotUrl} title={bug.title} />
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {new Date(bug.createdAt).toLocaleDateString()}
      </td>

      {/* Status select */}
      <td className="px-4 py-3">
        <div className="relative flex items-center gap-1.5">
          <select
            value={bug.status}
            disabled={updating}
            aria-label={`Change status of bug: ${bug.title}`}
            onChange={(e) => onStatusChange(bug._id, e.target.value)}
            className={`
              text-sm border rounded px-2 py-1 pr-7 appearance-none focus:outline-none
              focus:ring-2 focus:ring-blue-400 cursor-pointer transition
              ${updating
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              }
            `}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          {/* Saving spinner — shown only while in-flight */}
          {updating && (
            <span
              aria-label="Saving…"
              className="inline-block w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"
            />
          )}
        </div>
      </td>
    </tr>
  );
}