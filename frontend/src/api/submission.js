/**
 * One canonical builder for the envelope fields every Lead/RFQ submission
 * needs (submissionId, sourceType, sourcePath, utm) — every enquiry surface
 * (PDP, Studio, Corporate Gifting, Kit Builder, Solutions, About, Contact,
 * Header) calls this instead of re-deriving these fields itself, so the
 * shape can't drift between call sites.
 *
 * submissionId is a fresh client-generated UUID per logical submission
 * attempt (created once when a form/flow starts, not per HTTP call) — it's
 * what the backend's idempotency check keys on, so a retried request (double
 * click, flaky network) is deduped server-side rather than creating a
 * duplicate Lead/RFQ.
 *
 * UTM params are captured once per browser tab (sessionStorage) the first
 * time any page loads with utm_* in the query string, then reused for every
 * submission made later in that session — the enquiry might happen on a
 * different page than the one the visitor landed on.
 */
const UTM_STORAGE_KEY = "pl_utm";

function captureUtmFromLocation() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const utm = {
    source: params.get("utm_source") || undefined,
    medium: params.get("utm_medium") || undefined,
    campaign: params.get("utm_campaign") || undefined,
    content: params.get("utm_content") || undefined,
  };
  if (Object.values(utm).some(Boolean)) {
    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
  }
}

function readStoredUtm() {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

if (typeof window !== "undefined") {
  captureUtmFromLocation();
}

export function createSubmissionId() {
  return crypto.randomUUID();
}

/**
 * `sourceType` must be one of the backend's SourceType enum values
 * (HEADER_QUOTE, PDP, CUSTOMIZATION_STUDIO, CORPORATE_GIFTING, KIT_BUILDER,
 * SOLUTION, CONTACT, ABOUT, OTHER). `sourceContext` is a small free-form
 * object for page-specific detail (e.g. { productSlug } or { solutionSlug })
 * — kept intentionally small since it's stored as-is in the DB.
 */
export function buildSubmissionEnvelope({ submissionId, sourceType, sourceContext } = {}) {
  return {
    submissionId: submissionId || createSubmissionId(),
    sourceType,
    sourcePath: typeof window !== "undefined" ? window.location.pathname : "",
    sourceContext: sourceContext || undefined,
    utm: readStoredUtm(),
  };
}
