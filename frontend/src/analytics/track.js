/**
 * First-party, privacy-conservative website analytics (Phase 6C-1).
 *
 *  - visitorId : random id in localStorage, persists across visits. Not a
 *    fingerprint — cleared with site data like any cookie would be.
 *  - sessionId : random id that rolls over after 30 minutes of inactivity
 *    (§9). Survives a reload; a fresh id is minted once the gap exceeds
 *    the window.
 *  - Events are fire-and-forget via navigator.sendBeacon (fetch keepalive
 *    fallback). A failure here can NEVER interrupt navigation, a product
 *    view, search, an RFQ submit or a WhatsApp action (§14).
 *  - /admin/* and /quote/* are never tracked (§15).
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001/api/v1";
const ENDPOINT = `${API_BASE}/analytics/collect`;
const SESSION_WINDOW_MS = 30 * 60 * 1000;

const VID_KEY = "pl_vid";
const SID_KEY = "pl_sid";
const SID_EXP_KEY = "pl_sid_exp";
const UTM_KEY = "pl_utm";

function ls() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function uuid() {
  try {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return `x${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

function getVisitorId() {
  const store = ls();
  if (!store) return null;
  let id = store.getItem(VID_KEY);
  if (!id) {
    id = uuid();
    try {
      store.setItem(VID_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

function getSessionId() {
  const store = ls();
  if (!store) return null;
  const now = Date.now();
  let id = store.getItem(SID_KEY);
  const exp = Number(store.getItem(SID_EXP_KEY) || 0);
  if (!id || !exp || now > exp) {
    id = uuid();
    try {
      store.setItem(SID_KEY, id);
    } catch {
      /* ignore */
    }
  }
  try {
    store.setItem(SID_EXP_KEY, String(now + SESSION_WINDOW_MS));
  } catch {
    /* ignore */
  }
  return id;
}

/** Capture campaign params once and reuse them for the rest of the session. */
function getUtm() {
  const store = ls();
  let stored = null;
  try {
    stored = store ? JSON.parse(store.getItem(UTM_KEY) || "null") : null;
  } catch {
    stored = null;
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const fresh = {
      utmSource: params.get("utm_source") || undefined,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
    };
    if (fresh.utmSource || fresh.utmMedium || fresh.utmCampaign) {
      try {
        store?.setItem(UTM_KEY, JSON.stringify(fresh));
      } catch {
        /* ignore */
      }
      return fresh;
    }
  } catch {
    /* ignore */
  }
  return stored || {};
}

function isTrackablePath(path) {
  if (typeof path !== "string") return false;
  if (path.startsWith("/admin")) return false;
  if (path.startsWith("/quote/") || path === "/quote") return false;
  return true;
}

let lastKey = "";
let lastAt = 0;

/**
 * @param {string} eventType  one of the AnalyticsEventType values
 * @param {object} props       productId/productCode/categoryId/solutionId/
 *                             searchQuery/searchResultCount/metadata
 */
export function track(eventType, props = {}) {
  try {
    const path = window.location?.pathname || "/";
    if (!isTrackablePath(path)) return;

    const key = `${eventType}|${path}|${props.productId || ""}|${props.searchQuery || ""}`;
    const now = Date.now();
    if (key === lastKey && now - lastAt < 800) return; // debounce accidental duplicates
    lastKey = key;
    lastAt = now;

    const payload = {
      eventType,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      path,
      referrer: document.referrer || undefined,
      ...getUtm(),
      ...props,
    };
    if (!payload.visitorId) return;

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      if (ok) return;
    }
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "omit",
    }).catch(() => {});
  } catch {
    /* analytics must never break the page */
  }
}

export const trackPageView = () => track("PAGE_VIEW");
