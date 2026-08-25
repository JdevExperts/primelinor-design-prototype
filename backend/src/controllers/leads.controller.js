const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const { createLead } = require("../services/leadService");

/**
 * Honeypot: `website` is never rendered as a real field in any frontend
 * form. A bot filling every input on the page fills it; a real user never
 * sees it. Responding with a normal-looking (but fake) success avoids
 * signalling to the bot that it was caught.
 */
function fakeSuccessResponse() {
  return { id: "00000000-0000-0000-0000-000000000000", reference: "PL-LD-0000-000000", status: "NEW" };
}

// POST /api/v1/leads
exports.createLead = asyncHandler(async (req, res) => {
  const payload = req.validated.body;

  if (payload.website) {
    return sendSuccess(res, { lead: fakeSuccessResponse() }, 201);
  }

  const lead = await createLead(payload);
  sendSuccess(res, { lead }, 201);
});
