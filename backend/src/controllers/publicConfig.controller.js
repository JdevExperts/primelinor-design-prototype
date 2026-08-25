const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");

/**
 * A tiny public config surface (Phase 4 §21) so the frontend never
 * hardcodes a phone number in a component — it asks the backend whether
 * WhatsApp handoff is actually configured for this deployment, and only
 * renders the button if so. No secrets live here; everything returned is
 * already meant to be customer-visible.
 */
// GET /api/v1/config/public
exports.getPublicConfig = asyncHandler(async (req, res) => {
  const whatsappNumber = process.env.WHATSAPP_NUMBER?.trim() || null;
  sendSuccess(res, {
    whatsappEnabled: Boolean(whatsappNumber),
    whatsappNumber,
    supportEmail: process.env.SUPPORT_EMAIL?.trim() || null,
  });
});
