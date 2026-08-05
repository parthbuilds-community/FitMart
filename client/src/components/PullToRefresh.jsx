// src/components/PullToRefresh.jsx
import { useEffect, useRef, useState } from "react";

const THRESHOLD = 72; // px of pull needed to trigger a refresh
const MAX_PULL = 120; // max visual pull distance
const RESISTANCE = 0.45; // friction applied to the pull distance
const INDICATOR_HEIGHT = 56; // matches the h-14 indicator slot
const MIN_SPINNER_MS = 500; // keep the spinner visible for at least this long

function RefreshIndicator({ progress, refreshing }) {
  const label = refreshing
    ? "Refreshing"
    : progress >= 1
      ? "Release to refresh"
      : "Pull to refresh";

  return (
    <div className="flex flex-col items-center gap-1.5">
      {refreshing ? (
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
      ) : (
        <svg
          className="h-6 w-6 text-stone-900"
          style={{ transform: `rotate(${progress * 180}deg)` }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v12m0 0l-5-5m5 5l5-5" />
        </svg>
      )}
      <span className="text-[10px] font-medium tracking-widest uppercase text-stone-400">
        {label}
      </span>
    </div>
  );
}

/**
 * Native-feeling pull to refresh for touch devices.
 * Attaches non-passive touch listeners (so the browser overscroll can be
 * suppressed while pulling) and only arms the gesture when the window is
 * scrolled to the very top. Calls onRefresh once the pull passes THRESHOLD.
 */
export default function PullToRefresh({ onRefresh, disabled = false, children }) {
  const containerRef = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || disabled) return;

    // Gesture state lives in closures so the effect binds its listeners once.
    let startY = null;
    let pulling = false;
    let distance = 0;
    let cancelled = false;

    const setDistance = (value) => {
      distance = value;
      setPullDistance(value);
    };

    const onTouchStart = (e) => {
      if (refreshingRef.current) return;
      if (window.scrollY > 0) return;
      if (e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      pulling = true;
    };

    const onTouchMove = (e) => {
      if (!pulling || startY === null) return;
      const deltaY = e.touches[0].clientY - startY;
      if (deltaY <= 0 || window.scrollY > 0) {
        pulling = false;
        setDistance(0);
        return;
      }
      // Suppress the browser's native overscroll / pull-to-refresh while dragging.
      if (e.cancelable) e.preventDefault();
      setDistance(Math.min(deltaY * RESISTANCE, MAX_PULL));
    };

    const finish = () => {
      if (!pulling) return;
      pulling = false;
      startY = null;

      if (distance >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        setDistance(0);

        const startedAt = Date.now();
        Promise.resolve(onRefreshRef.current && onRefreshRef.current())
          .catch(() => {})
          .finally(() => {
            const elapsed = Date.now() - startedAt;
            setTimeout(() => {
              if (cancelled) return;
              refreshingRef.current = false;
              setRefreshing(false);
              setPullDistance(0);
            }, Math.max(0, MIN_SPINNER_MS - elapsed));
          });
      } else {
        setDistance(0);
      }
    };

    const opts = { passive: false };
    el.addEventListener("touchstart", onTouchStart, opts);
    el.addEventListener("touchmove", onTouchMove, opts);
    el.addEventListener("touchend", finish);
    el.addEventListener("touchcancel", finish);

    return () => {
      cancelled = true;
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", finish);
      el.removeEventListener("touchcancel", finish);
    };
  }, [disabled]);

  const progress = refreshing ? 1 : Math.min(pullDistance / THRESHOLD, 1);
  const contentY = refreshing ? INDICATOR_HEIGHT : pullDistance;
  const indicatorY = refreshing ? 0 : pullDistance - INDICATOR_HEIGHT;
  const settling = pullDistance === 0 || refreshing;

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull indicator */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex h-14 items-center justify-center"
        style={{
          transform: `translateY(${indicatorY}px)`,
          opacity: pullDistance > 0 || refreshing ? 1 : 0,
          transition: settling ? "transform 0.25s ease, opacity 0.2s ease" : "none",
        }}
      >
        <RefreshIndicator progress={progress} refreshing={refreshing} />
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${contentY}px)`,
          transition: settling ? "transform 0.25s ease" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
