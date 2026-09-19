import { useState, useEffect, useRef, useCallback } from "react";

export function usePullToRefresh({ onRefresh, threshold = 70, maxPull = 120 }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startYRef = useRef(0);
  const isTopRef = useRef(false);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY <= 0 && e.touches.length === 1) {
      startYRef.current = e.touches[0].clientY;
      isTopRef.current = true;
    } else {
      isTopRef.current = false;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!isTopRef.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      if (diff > 0 && window.scrollY <= 0) {
        // Resistance curve for smooth feeling
        const distance = Math.min(diff * 0.45, maxPull);
        setPullDistance(distance);
        setIsPulling(true);

        // Prevent default overscroll bounce if pulling down
        if (e.cancelable && diff > 10) {
          e.preventDefault();
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    },
    [isRefreshing, maxPull]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isTopRef.current || isRefreshing) return;

    if (pullDistance >= threshold && onRefresh) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      try {
        await onRefresh();
      } catch (err) {
        console.error("Pull to refresh failed:", err);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setIsPulling(false);
    isTopRef.current = false;
  }, [pullDistance, threshold, onRefresh, isRefreshing]);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullDistance, isRefreshing, isPulling, threshold };
}
