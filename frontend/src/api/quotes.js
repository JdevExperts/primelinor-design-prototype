/**
 * Customer-facing, token-gated quotation API (Phase 4). Every function
 * takes the opaque token from the /quote/:token route — never an internal
 * id or human-readable reference, which must not grant access on their
 * own (Phase 4 §2).
 */
import { apiGet, apiPost } from "./http";

export function getQuoteByToken(token) {
  return apiGet(`/quotes/${encodeURIComponent(token)}`);
}

export function acceptQuote(token) {
  return apiPost(`/quotes/${encodeURIComponent(token)}/accept`);
}

export function declineQuote(token, message) {
  return apiPost(`/quotes/${encodeURIComponent(token)}/decline`, { message: message || undefined });
}

export function requestQuoteRevision(token, message) {
  return apiPost(`/quotes/${encodeURIComponent(token)}/request-revision`, { message: message || undefined });
}

/** Not a fetch — the PDF is opened/downloaded directly by the browser via this URL. */
export function getQuotePdfUrl(token) {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001/api/v1";
  return `${base}/quotes/${encodeURIComponent(token)}/pdf`;
}
