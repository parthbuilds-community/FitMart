import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FitnessChatBot from "./FitnessChatBot";

describe("FitnessChatBot", () => {
  it("renders the floating action button", () => {
    render(<FitnessChatBot />);

    expect(
      screen.getByRole("button", {
        name: /open fitness assistant/i,
      })
    ).toBeInTheDocument();
  });
});