const ApiError = require("../utils/ApiError");

describe("ApiError", () => {
  test("creates an API error with status code and message", () => {
    const error = new ApiError(404, "Product not found");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);

    expect(error.name).toBe("ApiError");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Product not found");
    expect(error.success).toBe(false);
  });

  test("supports optional details", () => {
    const error = new ApiError(400, "Validation failed", {
      details: ["email is required"],
    });

    expect(error.details).toEqual(["email is required"]);
  });

  test("supports an error cause", () => {
    const cause = new Error("Database failure");

    const error = new ApiError(500, "Database error", {
      cause,
    });

    expect(error.cause).toBe(cause);
  });
});
