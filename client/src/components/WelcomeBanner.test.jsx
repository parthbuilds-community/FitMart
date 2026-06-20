import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WelcomeBanner from "./WelcomeBanner";

describe("WelcomeBanner", () => {
  it("renders welcome message", () => {
    render(<WelcomeBanner />);

    expect(
      screen.getByText(/welcome to fitmart/i)
    ).toBeInTheDocument();
  });

  it("renders dismiss button", () => {
    render(<WelcomeBanner />);

    expect(
      screen.getByRole("button", {
        name: /dismiss welcome banner/i,
      })
    ).toBeInTheDocument();
  });
});