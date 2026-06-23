import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FitnessChatBot from "./FitnessChatBot";

describe("FitnessChatBot", () => {
  it("renders successfully", () => {
    render(<FitnessChatBot />);
    expect(document.body).toBeInTheDocument();
  });
});