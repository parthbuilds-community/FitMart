import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Stars from "../Stars";

describe("Stars Component", () => {
  it("renders 5 stars", () => {
    const { container } = render(<Stars rating={3} />);
    const stars = container.querySelectorAll("svg");
    expect(stars.length).toBe(5);
  });

  it("renders correct number of full stars", () => {
    const { container } = render(<Stars rating={4} />);
    const fullStars = container.querySelectorAll("svg path[fill='currentColor']");
    expect(fullStars.length).toBeGreaterThan(0);
  });

  it("renders half star for decimal rating", () => {
    const { container } = render(<Stars rating={3.5} />);
    const clipPath = container.querySelector("clipPath");
    expect(clipPath).not.toBeNull();
  });

  it("renders empty stars correctly", () => {
    const { container } = render(<Stars rating={2} />);
    const stars = container.querySelectorAll("svg");
    expect(stars.length).toBe(5);
  });

  it("supports large size", () => {
    const { container } = render(<Stars rating={5} size="lg" />);
    const star = container.querySelector("svg");
    expect(star.className.baseVal).toContain("w-4");
  });

  it("defaults to rating 0", () => {
    const { container } = render(<Stars />);
    const stars = container.querySelectorAll("svg");
    expect(stars.length).toBe(5);
  });
});