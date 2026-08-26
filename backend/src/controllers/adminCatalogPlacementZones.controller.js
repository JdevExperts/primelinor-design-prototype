const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const placementZoneAdmin = require("../services/catalogAdmin/placementZoneAdmin");
const { serializePlacementZoneAdmin } = require("../services/serializeCatalogAdmin");

exports.create = asyncHandler(async (req, res) => {
  const zone = await placementZoneAdmin.createZone(req.validated.params.id, req.validated.body);
  sendSuccess(res, { placementZone: serializePlacementZoneAdmin(zone) }, 201);
});

exports.update = asyncHandler(async (req, res) => {
  const zone = await placementZoneAdmin.updateZone(req.validated.params.id, req.validated.params.zoneId, req.validated.body);
  sendSuccess(res, { placementZone: serializePlacementZoneAdmin(zone) });
});

exports.remove = asyncHandler(async (req, res) => {
  await placementZoneAdmin.deleteZone(req.validated.params.id, req.validated.params.zoneId);
  sendSuccess(res, { deleted: true });
});
