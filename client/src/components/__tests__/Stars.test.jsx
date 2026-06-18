import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Stars from "../Stars";

describe("Stars", () => {
  it("renders without crashing", () => {
    const { container } = render(<Stars rating={4} />);
    expect(container).toBeInTheDocument();
  });

  it("renders correct number of SVG icons for full stars", () => {
    const { container } = render(<Stars rating={3} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(5);
  });

  it("renders a half star for 0.5 rating", () => {
    const { container } = render(<Stars rating={3.5} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(5);
  });

  it("handles zero rating", () => {
    const { container } = render(<Stars rating={0} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(5);
  });

  it("handles max rating of 5", () => {
    const { container } = render(<Stars rating={5} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(5);
  });

  it("has aria-hidden attribute", () => {
    const { container } = render(<Stars rating={3} />);
    const span = container.firstChild;
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  it("applies size class correctly", () => {
    const { container } = render(<Stars rating={3} size="lg" />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("class")).toContain("w-4");
    expect(svg.getAttribute("class")).toContain("h-4");
  });
});
