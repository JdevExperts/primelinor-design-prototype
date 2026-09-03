/**
 * Pure helpers for the thread-grouped Quotations list. A "thread" is every
 * version sharing one quotationGroupId; the list shows one row per thread
 * (its latest version), never one row per version.
 */

/**
 * Strip a trailing "-V<n>" version suffix from a search term so that
 * searching an old version's full reference (PL-QT-2026-000011-V1) still
 * matches the stored group reference (PL-QT-2026-000011) and surfaces the
 * whole thread (§4). A term without the suffix is returned unchanged.
 */
function bareGroupReference(term) {
  return String(term || "").replace(/-v\d+\s*$/i, "").trim();
}

/**
 * Reduce a flat list of version rows to just the latest (highest
 * `version`) row per `quotationGroupId`. Latest is decided by version
 * number only, never by updatedAt (§2). Returns a new array; input order
 * is otherwise preserved by group's first appearance.
 */
function latestPerGroup(rows) {
  const byGroup = new Map();
  for (const row of rows || []) {
    const current = byGroup.get(row.quotationGroupId);
    if (!current || row.version > current.version) byGroup.set(row.quotationGroupId, row);
  }
  return [...byGroup.values()];
}

/** Count of versions per group id, from a flat version-row list. */
function versionCountByGroup(rows) {
  const counts = new Map();
  for (const row of rows || []) {
    counts.set(row.quotationGroupId, (counts.get(row.quotationGroupId) || 0) + 1);
  }
  return counts;
}

module.exports = { bareGroupReference, latestPerGroup, versionCountByGroup };
