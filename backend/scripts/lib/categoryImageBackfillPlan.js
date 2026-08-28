/**
 * Pure decision logic for the category-image backfill, kept separate from
 * the script's DB/S3/filesystem side effects so it's unit-testable
 * without a database (mirrors legacySqlParser.js/catalogTransform.js's
 * split for the catalogue backfill).
 */

/**
 * CREATE: category has no image yet.
 * SKIP_ALREADY_UPLOADED: category's current image was uploaded by this
 *   system for THIS category (storageKey lives under its own
 *   `categories/<id>/` prefix) — rerunning the backfill must not create a
 *   new object or change the URL every time.
 * REPLACE: anything else — no existing image, or an existing image this
 *   system doesn't own (external/unmanaged URL with no storageKey), or
 *   `force` explicitly requested even though we own the current one.
 */
function decideAction({ existingImageUrl, existingImageStorageKey, categoryId, force = false }) {
  if (!existingImageUrl) return "CREATE";
  const ownedByThisCategory =
    Boolean(existingImageStorageKey) && existingImageStorageKey.startsWith(`categories/${categoryId}/`);
  if (ownedByThisCategory && !force) return "SKIP_ALREADY_UPLOADED";
  return "REPLACE";
}

/**
 * Only ever returns a key to delete when the previous image was owned by
 * this system (storageKey set) and differs from the newly uploaded key —
 * an external/unknown URL (storageKey null) is never a deletion
 * candidate, regardless of action.
 */
function resolveDeleteKey({ previousStorageKey, newKey }) {
  if (!previousStorageKey) return null;
  if (previousStorageKey === newKey) return null;
  return previousStorageKey;
}

/**
 * Content-hash-aware decision (category-image REPLACEMENT backfill) —
 * supersedes `decideAction` above as this script's actual decision logic:
 * that function only ever compared storage-key OWNERSHIP, so re-running
 * the backfill with genuinely NEW source content for an already-owned
 * category silently reported SKIP_ALREADY_UPLOADED instead of replacing
 * it. Comparing the local file's hash against the currently-live object's
 * hash (fetched by the caller — this stays a pure function) is what
 * actually distinguishes "rerun with the same file" (UNCHANGED) from "new
 * creative for a category we already manage" (REPLACE), per the task
 * brief's explicit instruction not to infer change from filename alone.
 *
 * Action vocabulary matches the brief exactly: REPLACE or UNCHANGED here
 * (MISSING_LOCAL / UNMATCHED are decided earlier, before a category ever
 * reaches this function, since they don't have a local file/hash to
 * compare at all).
 */
function decideActionFromHashes({ existingImageUrl, localHash, remoteHash, force = false }) {
  if (!existingImageUrl) return "REPLACE";
  if (remoteHash === localHash && !force) return "UNCHANGED";
  return "REPLACE";
}

module.exports = { decideAction, decideActionFromHashes, resolveDeleteKey };
