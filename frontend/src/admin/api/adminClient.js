/**
 * Fetch wrapper for the admin API — separate from src/api/http.js because
 * admin auth rides an HttpOnly cookie (Phase 3 §42), so every request needs
 * `credentials: "include"`, and a 401 here means "redirect to /admin/login"
 * rather than a generic error toast.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001/api/v1";

export class AdminApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    if (details) this.details = details;
  }
}

async function request(path, options = {}) {
  let response;
  // A FormData body (product image uploads) must NOT get a manual
  // Content-Type — the browser sets its own multipart boundary, which a
  // forced "application/json" header would silently break.
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: options.body && !isFormData ? { "Content-Type": "application/json" } : undefined,
      ...options,
    });
  } catch {
    throw new AdminApiError("Could not reach the server. Check your connection and try again.");
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new AdminApiError("Unexpected response from the server.");
  }

  if (!response.ok || !body.success) {
    throw new AdminApiError(
      body?.message || "Something went wrong. Please try again.",
      response.status,
      body?.details,
    );
  }

  return body.data;
}

export function adminGet(path, params) {
  const query = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      query.set(key, value);
    }
  }
  const search = query.toString();
  return request(search ? `${path}?${search}` : path, { method: "GET" });
}

export function adminPost(path, payload) {
  return request(path, { method: "POST", body: JSON.stringify(payload ?? {}) });
}

export function adminPatch(path, payload) {
  return request(path, { method: "PATCH", body: JSON.stringify(payload ?? {}) });
}

export function adminPut(path, payload) {
  return request(path, { method: "PUT", body: JSON.stringify(payload ?? {}) });
}

export function adminDelete(path) {
  return request(path, { method: "DELETE" });
}

/** `formData` — a FormData instance; see request()'s isFormData branch. */
export function adminUpload(path, formData) {
  return request(path, { method: "POST", body: formData });
}
