import { adminGet, adminPatch, adminPost } from "./adminClient";

export const listForRfq = (rfqId) => adminGet(`/admin/rfqs/${rfqId}/quotations`);
export const createQuotation = (rfqId, payload) => adminPost(`/admin/rfqs/${rfqId}/quotations`, payload);
export const getQuotation = (id) => adminGet(`/admin/quotations/${id}`);
export const updateQuotation = (id, payload) => adminPatch(`/admin/quotations/${id}`, payload);
export const sendQuotation = (id) => adminPost(`/admin/quotations/${id}/send`);
export const acceptQuotation = (id) => adminPost(`/admin/quotations/${id}/accept`);
export const rejectQuotation = (id, nextRfqStatus) =>
  adminPost(`/admin/quotations/${id}/reject`, nextRfqStatus ? { nextRfqStatus } : {});
export const regenerateQuoteLink = (id) => adminPost(`/admin/quotations/${id}/link/regenerate`);
export const revokeQuoteLink = (id) => adminPost(`/admin/quotations/${id}/link/revoke`);
export const getQuotationPdfUrl = (id) => {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001/api/v1";
  return `${base}/admin/quotations/${id}/pdf`;
};
