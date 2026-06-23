import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

window.HTMLElement.prototype.scrollIntoView = vi.fn();