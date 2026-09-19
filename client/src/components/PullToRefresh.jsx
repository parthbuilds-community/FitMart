import React from "react";
import { usePullToRefresh } from "../hooks/usePullToRefresh";

export default function PullToRefresh({ children, onRefresh, threshold = 70, maxPull = 120 }) {
  const { pullDistance, isRefreshing, isPulling } = usePullToRefresh({
    onRefresh,
    threshold,
    maxPull,
  });

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div className="relative min-h-full">
      {(isPulling || isRefreshing || pullDistance > 0) && (
        <div
          className="left-0 right-0 z-30 flex items-center justify-center pointer-events-none transition-all duration-150"
          style={{
            height: isRefreshing ? `${threshold}px` : `${pullDistance}px`,
            opacity: isRefreshing ? 1 : Math.max(progress, 0.2),
          }}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 text-white text-xs font-medium shadow-md">
            <svg
              className={`w-4 h-4 text-stone-200 ${isRefreshing ? "animate-spin" : ""}`}
              style={{
                transform: isRefreshing ? "none" : `rotate(${progress * 360}deg)`,
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {isRefreshing ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              )}
            </svg>
            <span>
              {isRefreshing
                ? "Refreshing..."
                : progress >= 1
                ? "Release to refresh"
                : "Pull to refresh"}
            </span>
          </div>
        </div>
      )}
      <div
        className="transition-transform duration-100 ease-out"
        style={{
          transform:
            pullDistance > 0 || isRefreshing
              ? `translateY(${isRefreshing ? threshold : pullDistance}px)`
              : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
