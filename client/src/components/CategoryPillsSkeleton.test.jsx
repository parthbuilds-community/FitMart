import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CategoryPillsSkeleton from "./CategoryPillsSkeleton";

describe("CategoryPillsSkeleton", () => {
  it("renders four loading pill placeholders", () => {
    const { container } = render(<CategoryPillsSkeleton />);

    expect(container.firstChild).toHaveClass("flex");
    expect(container.firstChild.children).toHaveLength(4);
  });
});