import { apiGet } from "./http";

/** { whatsappEnabled, whatsappNumber, supportEmail } — see Phase 4 §21. */
export function getPublicConfig() {
  return apiGet("/config/public");
}
