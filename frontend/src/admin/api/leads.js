import { adminGet, adminPatch, adminPost } from "./adminClient";

export const listLeads = (filters) => adminGet("/admin/leads", filters);
export const getLead = (id) => adminGet(`/admin/leads/${id}`);
export const updateLead = (id, payload) => adminPatch(`/admin/leads/${id}`, payload);
export const convertLead = (id, payload) => adminPost(`/admin/leads/${id}/convert`, payload);
