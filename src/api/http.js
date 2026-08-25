/**
 * Small shared fetch wrapper — no axios, no React Query. The API is a
 * handful of read-only GET endpoints; a thin wrapper is all this needs.
 *
 * Unwraps the backend's `{ success, data }` / `{ success: false, message }`
 * envelope and throws a plain Error with a safe, user-showable message on
 * failure, so callers never have to think about the envelope shape.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4001/api/v1";

export class ApiRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiGet(path, { params } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, value);
    }
  }

  let response;
  try {
    response = await fetch(url.toString());
  } catch {
    throw new ApiRequestError("Could not reach the server. Check your connection and try again.");
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiRequestError("Unexpected response from the server.");
  }

  if (!response.ok || !body.success) {
    throw new ApiRequestError(body?.message || "Something went wrong. Please try again.", response.status);
  }

  return body.data;
}

async function unwrap(responsePromise) {
  let response;
  try {
    response = await responsePromise;
  } catch {
    throw new ApiRequestError("Could not reach the server. Check your connection and try again.");
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiRequestError("Unexpected response from the server.");
  }

  if (!response.ok || !body.success) {
    throw new ApiRequestError(body?.message || "Something went wrong. Please try again.", response.status);
  }

  return body.data;
}

export async function apiPost(path, payload) {
  return unwrap(
    fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

/** `file` is a browser File/Blob — sent as multipart/form-data under field name "file". */
export async function apiUpload(path, file) {
  const formData = new FormData();
  formData.append("file", file);
  return unwrap(fetch(`${API_BASE_URL}${path}`, { method: "POST", body: formData }));
}
