import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import FitnessChatBot from "./FitnessChatBot";

describe("FitnessChatBot", () => {
  it("renders chatbot title", async () => {
    const user = userEvent.setup();

    render(<FitnessChatBot />);

    const openButton = screen.getByRole("button", {
      name: /open fitness assistant/i,
    });

    await user.click(openButton);

    expect(
        await screen.findByRole("heading", {
            name: /fitness assistant/i,
        })
    ).toBeInTheDocument();
  });
});