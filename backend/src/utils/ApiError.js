/**
 * A deliberate, safe-to-show-the-client error. Anything thrown that is NOT
 * an ApiError is treated as unexpected by the error handler and masked with
 * a generic message — see middleware/errorHandler.js.
 *
 * `details` is an optional, safe-to-expose object (never raw internals) —
 * e.g. the id of an existing draft a caller should open instead.
 */
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.expected = true;
    if (details) this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static notFound(message = "Not found", details) {
    return new ApiError(404, message, details);
  }

  static conflict(message, details) {
    return new ApiError(409, message, details);
  }
}

module.exports = ApiError;
