/**
 * Small, pure classification helper (Production Hardening Patch §10) so
 * "was this a unique-constraint violation on field X" is one testable
 * function instead of an inline `err.code === "P2002" && ...` check
 * repeated at each call site with slightly different shapes.
 */
const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

/** `field` is the Prisma column/map name (e.g. "version", "submission_id") to check the violated target for. */
function isUniqueConstraintOn(err, field) {
  return err?.code === UNIQUE_CONSTRAINT_VIOLATION && Boolean(err?.meta?.target?.includes(field));
}

module.exports = { UNIQUE_CONSTRAINT_VIOLATION, isUniqueConstraintOn };
