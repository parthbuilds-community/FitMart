import '@testing-library/jest-dom';

// Polyfills/Mocks for jsdom environments
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
  };
};

HTMLElement.prototype.scrollIntoView = HTMLElement.prototype.scrollIntoView || function() {};

