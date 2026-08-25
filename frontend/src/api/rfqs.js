import { apiPost } from "./http";
import { buildSubmissionEnvelope } from "./submission";

/**
 * `items[].productId`/`colorId`/`variantId` are the catalogue's real
 * identifiers — the product SLUG, color SLUG, and variant CODE respectively
 * (the same values already used as `id` throughout the frontend catalogue
 * shape — see src/api/adapters.js). A described/custom item (Kit Builder,
 * a conceptual gifting collection) omits productId and sets `description`
 * instead.
 *
 * @param {{
 *   contact: {name, phone, email?, companyName?},
 *   message?: string,
 *   deliveryCity?: string,
 *   deliveryPin?: string,
 *   requirementData?: object,
 *   items: Array<{
 *     productId?: string, description?: string, colorId?: string, variantId?: string,
 *     quantity?: number,
 *     customizationData?: { front?: {enabled, placementKey?, artworkAssetId?}, back?: {...} },
 *   }>,
 *   sourceType: string, sourceContext?: object, submissionId?: string,
 * }} input
 * @returns {Promise<{id, reference, status, itemCount, createdAt}>}
 */
export async function submitRfq({
  contact,
  message,
  deliveryCity,
  deliveryPin,
  requirementData,
  items,
  sourceType,
  sourceContext,
  submissionId,
}) {
  const envelope = buildSubmissionEnvelope({ submissionId, sourceType, sourceContext });
  const { rfq } = await apiPost("/rfqs", {
    contact,
    message,
    deliveryCity,
    deliveryPin,
    requirementData,
    items,
    ...envelope,
  });
  return rfq;
}
