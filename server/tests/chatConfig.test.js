const {
  PRODUCT_KEYWORDS,
  getFallbackResponse,
  PRODUCT_TEMPLATE,
} = require("../config/chatConfig");

describe("chatConfig exports", () => {
  test("should export PRODUCT_KEYWORDS array", () => {
    expect(Array.isArray(PRODUCT_KEYWORDS)).toBe(true);
    expect(PRODUCT_KEYWORDS.length).toBeGreaterThan(0);
  });

  test("should export getFallbackResponse function", () => {
    expect(typeof getFallbackResponse).toBe("function");
  });

  test("should export PRODUCT_TEMPLATE function", () => {
    expect(typeof PRODUCT_TEMPLATE).toBe("function");
  });
});

describe("getFallbackResponse", () => {
  test("returns protein response", () => {
    const response = getFallbackResponse("How much protein do I need?");
    expect(response).toContain("protein");
    expect(response).toContain("1.6-2.2g");
  });

  test("returns workout response", () => {
    const response = getFallbackResponse("Suggest a workout plan");
    expect(response).toContain("workout");
    expect(response).toContain("strength training");
  });

  test("returns weight loss response", () => {
    const response = getFallbackResponse("Tips for weight loss");
    expect(response).toContain("weight loss");
    expect(response).toContain("calorie deficit");
  });

  test("returns muscle gain response", () => {
    const response = getFallbackResponse("How can I gain muscle?");
    expect(response).toContain("muscle gain");
    expect(response).toContain("calorie surplus");
  });

  test("returns default response when no keyword matches", () => {
    const response = getFallbackResponse("Hello");
    expect(response).toContain("fitness journey");
  });

  test("matches keywords case-insensitively", () => {
    const response = getFallbackResponse("PROTEIN supplements");
    expect(response).toContain("protein");
  });

  test("protein keyword takes priority when multiple keywords exist", () => {
    const response = getFallbackResponse(
      "protein and workout routine"
    );

    expect(response).toContain("protein");
    expect(response).toContain("1.6-2.2g");
  });

  test("handles exercise keyword", () => {
    const response = getFallbackResponse(
      "Best exercise for beginners"
    );

    expect(response).toContain("workout");
  });

  test("handles gain keyword", () => {
    const response = getFallbackResponse(
      "How can I gain weight?"
    );

    expect(response).toContain("muscle gain");
  });
});

describe("PRODUCT_TEMPLATE", () => {
  test("formats product with name only", () => {
    const product = {
      name: "Whey Protein",
    };

    const result = PRODUCT_TEMPLATE(product);

    expect(result).toContain("Whey Protein");
    expect(result).toContain("Recommended Products");
  });

  test("formats product with brand", () => {
    const product = {
      name: "Whey Protein",
      brand: "Optimum Nutrition",
    };

    const result = PRODUCT_TEMPLATE(product);

    expect(result).toContain("Optimum Nutrition");
  });

  test("formats product with price", () => {
    const product = {
      name: "Whey Protein",
      price: 2999,
    };

    const result = PRODUCT_TEMPLATE(product);

    expect(result).toContain("₹2,999");
  });

  test("formats product with rating", () => {
    const product = {
      name: "Whey Protein",
      rating: 4.5,
    };

    const result = PRODUCT_TEMPLATE(product);

    expect(result).toContain("⭐4.5/5");
  });

  test("formats product with all fields", () => {
    const product = {
      name: "Whey Protein",
      brand: "Optimum Nutrition",
      price: 2999,
      rating: 4.5,
    };

    const result = PRODUCT_TEMPLATE(product);

    expect(result).toContain("Whey Protein");
    expect(result).toContain("Optimum Nutrition");
    expect(result).toContain("₹2,999");
    expect(result).toContain("⭐4.5/5");
  });
});