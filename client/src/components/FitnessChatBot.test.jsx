import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FitnessChatBot from "./FitnessChatBot";

describe("FitnessChatBot", () => {
  it("renders without crashing", () => {
    render(<FitnessChatBot />);
    expect(true).toBe(true);
  });
});