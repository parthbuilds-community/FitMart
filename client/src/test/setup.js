import "@testing-library/jest-dom";

// Mock scrollIntoView for jsdom environment
window.HTMLElement.prototype.scrollIntoView = function() {};