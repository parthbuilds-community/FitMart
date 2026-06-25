import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FitnessChatBot from "./FitnessChatBot";

describe("FitnessChatBot", () => {
  it("renders chatbot component", () => {
    render(<FitnessChatBot />);
    expect(document.body).toBeInTheDocument();
  });
});