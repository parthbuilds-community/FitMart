const { getFallbackResponse } = require("../config/chatConfig");

describe("getFallbackResponse", () => {

  // ─────────────────────────────────────────────
  // TEST 1 — Protein keyword
  // ─────────────────────────────────────────────
  test("returns protein guidance when message contains protein keyword", () => {
    // Arrange
    const message = "best protein powder for beginners";

    // Act
    const response = getFallbackResponse(message);

    // Assert
    expect(response).toContain("1.6-2.2g per kg");
    expect(response).toContain("quality whey protein");
  });

  // ─────────────────────────────────────────────
  // TEST 2 — Workout keyword
  // ─────────────────────────────────────────────
  test("returns workout guidance when message contains workout keyword", () => {
    const message = "can you suggest a workout plan";

    const response = getFallbackResponse(message);

    expect(response).toContain("3-4 strength training sessions");
    expect(response).toContain("compound movements");
  });

  // ─────────────────────────────────────────────
  // TEST 3 — Exercise keyword
  // ─────────────────────────────────────────────
  test("returns workout guidance when message contains exercise keyword", () => {
    const message = "best exercise routine for beginners";

    const response = getFallbackResponse(message);

    expect(response).toContain("3-4 strength training sessions");
  });

  // ─────────────────────────────────────────────
  // TEST 4 — Weight loss keyword
  // ─────────────────────────────────────────────
  test("returns weight loss guidance when message contains weight loss keyword", () => {
    const message = "tips for weight loss";

    const response = getFallbackResponse(message);

    expect(response).toContain("moderate calorie deficit");
    expect(response).toContain("0.5-1kg loss per week");
  });

  // ─────────────────────────────────────────────
  // TEST 5 — Muscle keyword
  // ─────────────────────────────────────────────
  test("returns muscle gain guidance when message contains muscle keyword", () => {
    const message = "how can i build muscle";

    const response = getFallbackResponse(message);

    expect(response).toContain("slight calorie surplus");
    expect(response).toContain("progressive overload");
  });

  // ─────────────────────────────────────────────
  // TEST 6 — Gain keyword
  // ─────────────────────────────────────────────
  test("returns muscle gain guidance when message contains gain keyword", () => {
    const message = "weight gain tips";

    const response = getFallbackResponse(message);

    expect(response).toContain("slight calorie surplus");
  });

  // ─────────────────────────────────────────────
  // TEST 7 — Case-insensitive matching
  // ─────────────────────────────────────────────
  test("matches keywords regardless of case", () => {
    const message = "PROTEIN";

    const response = getFallbackResponse(message);

    expect(response).toContain("1.6-2.2g per kg");
  });

  // ─────────────────────────────────────────────
  // TEST 8 — Default fallback
  // ─────────────────────────────────────────────
  test("returns default response when no fitness keywords are found", () => {
    const message = "who won the cricket match today";

    const response = getFallbackResponse(message);

    expect(response).toContain("fitness journey");
    expect(response).toContain("workouts");
  });

});