import '@testing-library/jest-dom';

// jsdom doesn't implement matchMedia or scrollIntoView; components that use
// them (e.g. FitnessChatBot's mobile-scroll-lock effect) need a stub.
if (typeof window !== 'undefined') {
  window.matchMedia =
    window.matchMedia ||
    ((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));

  window.HTMLElement.prototype.scrollIntoView =
    window.HTMLElement.prototype.scrollIntoView || (() => {});
}
