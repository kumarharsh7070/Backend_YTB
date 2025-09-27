class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],   // ✅ match the name you use
    stack = ""     // ✅ fixed spelling
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;   // ✅ now correct

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
