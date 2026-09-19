class ApiError extends Error {
  constructor(statusCode = 500, message = "Something went wrong", options = {}) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.success = false;

    if (options.details !== undefined) {
      this.details = options.details;
    }

    if (options.cause !== undefined) {
      this.cause = options.cause;
    }

    Error.captureStackTrace(this, ApiError);
  }
}

module.exports = ApiError;