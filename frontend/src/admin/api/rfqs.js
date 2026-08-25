import { adminGet, adminPatch, adminPost } from "./adminClient";

export const listRfqs = (filters) => adminGet("/admin/rfqs", filters);
export const getRfq = (id) => adminGet(`/admin/rfqs/${id}`);
export const updateRfq = (id, payload) => adminPatch(`/admin/rfqs/${id}`, payload);
export const addNote = (id, body) => adminPost(`/admin/rfqs/${id}/notes`, { body });
export const addItem = (id, item) => adminPost(`/admin/rfqs/${id}/items`, item);
