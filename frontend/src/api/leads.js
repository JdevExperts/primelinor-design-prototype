import { apiPost } from "./http";
import { buildSubmissionEnvelope } from "./submission";

/**
 * @param {{ contact: {name, phone, email?, companyName?}, message: string,
 *   sourceType: string, sourceContext?: object, submissionId?: string }} input
 * @returns {Promise<{id, reference, status, createdAt}>}
 */
export async function submitLead({ contact, message, sourceType, sourceContext, submissionId }) {
  const envelope = buildSubmissionEnvelope({ submissionId, sourceType, sourceContext });
  const { lead } = await apiPost("/leads", { contact, message, ...envelope });
  return lead;
}
