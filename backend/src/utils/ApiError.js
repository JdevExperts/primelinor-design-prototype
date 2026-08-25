/**
 * A deliberate, safe-to-show-the-client error. Anything thrown that is NOT
 * an ApiError is treated as unexpected by the error handler and masked with
 * a generic message — see middleware/errorHandler.js.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.expected = true;
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }
}

module.exports = ApiError;
