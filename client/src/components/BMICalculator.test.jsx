import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BMICalculator from "./BMICalculator";

describe("BMICalculator", () => {
  it("renders the calculator heading", () => {
    render(<BMICalculator />);

    expect(screen.getByText("Baseline Metrics")).toBeInTheDocument();
    expect(screen.getByText("Generate Analysis")).toBeInTheDocument();
  });

  it("allows the user to select a gender", () => {
    render(<BMICalculator />);

    const femaleButton = screen.getByRole("button", { name: "female" });

    fireEvent.click(femaleButton);

    expect(femaleButton).toHaveClass("bg-stone-900");
  });

  it("calculates and displays BMI results", () => {
    render(<BMICalculator />);

    const inputs = screen.getAllByRole("spinbutton");

    fireEvent.change(inputs[0], {
      target: { value: "70" },
    });

    fireEvent.change(inputs[1], {
      target: { value: "175" },
    });

    fireEvent.change(inputs[2], {
      target: { value: "25" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Generate Analysis" })
    );

    expect(screen.getByText("22.9")).toBeInTheDocument();
    expect(screen.getByText("Normal Weight")).toBeInTheDocument();
  });
});