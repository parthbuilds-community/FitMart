import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FitnessChatBot from "../components/FitnessChatBot";

describe("FitnessChatBot", () => {
  it("renders the floating action button", () => {
    render(<FitnessChatBot />);

    const openButton = screen.getByRole("button", {
      name: /open fitness assistant/i,
    });

    expect(openButton).toBeInTheDocument();
  });

  it("opens the chat window when the FAB is clicked", () => {
    render(<FitnessChatBot />);

    const openButton = screen.getByRole("button", {
      name: /open fitness assistant/i,
    });

    fireEvent.click(openButton);

    expect(
      screen.getByRole("heading", {
        name: /fitness assistant/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/ask about workouts, diet, protein/i)
    ).toBeInTheDocument();
  });

  it("shows quick reply buttons when opened", () => {
    render(<FitnessChatBot />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /open fitness assistant/i,
      })
    );

    expect(screen.getByText(/💪 Build muscle/i)).toBeInTheDocument();
    expect(screen.getByText(/🥗 Diet plan/i)).toBeInTheDocument();
    expect(screen.getByText(/🏃 Cardio tips/i)).toBeInTheDocument();
    expect(screen.getByText(/⚖️ Lose weight/i)).toBeInTheDocument();
  });
});
