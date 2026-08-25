/**
 * Validates req[source] against a Zod schema and stores the parsed/coerced
 * result on req.validated[source] (so controllers see clean types — real
 * numbers and booleans, not query-string text). Failures flow to the
 * centralized error handler as a 400 via next(err).
 *
 * Deliberately does NOT reassign req.query/req.params directly: in
 * Express 5, req.query is a getter with no setter, so `req.query = x`
 * silently no-ops in non-strict mode — a real, easy-to-miss trap, not a
 * theoretical one (caught during Phase 1 smoke testing).
 */
function validate(schema, source = "query") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(result.error);
    }
    req.validated = { ...req.validated, [source]: result.data };
    next();
  };
}

module.exports = validate;
