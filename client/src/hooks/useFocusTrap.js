// src/hooks/useFocusTrap.js
import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "iframe",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

/**
 * Traps keyboard focus inside `containerRef` while `active` is true.
 *
 * - On activation, moves focus to `options.initialFocusRef` (or the first
 *   focusable element) and remembers the previously focused element.
 * - Cycles Tab / Shift+Tab through the focusable elements so focus can
 *   never leave the container, pulling focus back in if it ever escapes.
 * - Calls `options.onEscape` when Escape is pressed so the dialog can close.
 * - On deactivation, restores focus to the previously focused element
 *   (unless `options.restoreFocus` is false).
 *
 * Options are read through a ref so inline callbacks do not cause the
 * listener to be re-bound (and focus to be re-stolen) on every render.
 */
export default function useFocusTrap(containerRef, active, options = {}) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !active) return undefined;

    const { initialFocusRef, onEscape, restoreFocus = true } = optionsRef.current;
    const previouslyFocused = document.activeElement;

    // Move focus into the dialog: the requested element, else the first
    // focusable one (typically the close button).
    const initialTarget = initialFocusRef?.current || getFocusableElements(container)[0];
    initialTarget?.focus?.();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        const { onEscape: escapeHandler } = optionsRef.current;
        if (escapeHandler) {
          e.preventDefault();
          escapeHandler();
        }
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement;

      // Focus somehow landed outside the container: pull it back in.
      if (!container.contains(activeEl)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }

      if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const { restoreFocus: shouldRestore = true } = optionsRef.current;
      if (
        shouldRestore &&
        previouslyFocused &&
        typeof previouslyFocused.focus === "function" &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus();
      }
    };
  }, [containerRef, active]);
}
