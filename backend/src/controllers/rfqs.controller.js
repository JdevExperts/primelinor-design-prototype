const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const { createRfq } = require("../services/rfqService");

function fakeSuccessResponse() {
  return { id: "00000000-0000-0000-0000-000000000000", reference: "PL-RQ-0000-000000", status: "NEW" };
}

// POST /api/v1/rfqs
exports.createRfq = asyncHandler(async (req, res) => {
  const payload = req.validated.body;

  if (payload.website) {
    return sendSuccess(res, { rfq: fakeSuccessResponse() }, 201);
  }

  const rfq = await createRfq(payload);
  sendSuccess(res, { rfq }, 201);
});
