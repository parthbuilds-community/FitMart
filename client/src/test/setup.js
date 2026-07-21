import '@testing-library/jest-dom';

// jsdom doesn't implement scrollIntoView; components that call it (e.g. auto-scrolling
// chat windows) would otherwise throw in tests.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}