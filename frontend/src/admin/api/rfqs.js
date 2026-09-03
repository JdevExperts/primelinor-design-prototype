import { adminGet, adminPatch, adminPost, adminDelete } from "./adminClient";

export const listRfqs = (filters) => adminGet("/admin/rfqs", filters);
export const getRfq = (id) => adminGet(`/admin/rfqs/${id}`);
export const updateRfq = (id, payload) => adminPatch(`/admin/rfqs/${id}`, payload);
export const addNote = (id, body) => adminPost(`/admin/rfqs/${id}/notes`, { body });
export const addItem = (id, item) => adminPost(`/admin/rfqs/${id}/items`, item);

// Working requirement (Phase C)
export const addWorkingItem = (id, item) => adminPost(`/admin/rfqs/${id}/working-items`, item);
export const updateWorkingItem = (id, itemId, patch) =>
  adminPatch(`/admin/rfqs/${id}/working-items/${itemId}`, patch);
export const removeWorkingItem = (id, itemId) => adminDelete(`/admin/rfqs/${id}/working-items/${itemId}`);
export const reorderWorkingItems = (id, orderedIds) =>
  adminPost(`/admin/rfqs/${id}/working-items/reorder`, { orderedIds });
