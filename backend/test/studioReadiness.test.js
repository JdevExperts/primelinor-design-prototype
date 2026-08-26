const test = require("node:test");
const assert = require("node:assert/strict");
const { isStudioReady } = require("../src/services/studioReadiness");

test("isStudioReady: false when not customizable, regardless of assets/zones", () => {
  const product = {
    customizable: false,
    assets: [{ type: "CUSTOMIZATION_FRONT" }],
    placementZones: [{ view: "FRONT" }],
  };
  assert.equal(isStudioReady(product), false);
});

test("isStudioReady: false when customizable but no customization asset exists", () => {
  const product = { customizable: true, assets: [], placementZones: [{ view: "FRONT" }] };
  assert.equal(isStudioReady(product), false);
});

test("isStudioReady: false when a front asset exists but no front placement zone", () => {
  const product = {
    customizable: true,
    assets: [{ type: "CUSTOMIZATION_FRONT" }],
    placementZones: [],
  };
  assert.equal(isStudioReady(product), false);
});

test("isStudioReady: false when the only placement zone is BACK, not FRONT", () => {
  const product = {
    customizable: true,
    assets: [{ type: "CUSTOMIZATION_FRONT" }],
    placementZones: [{ view: "BACK" }],
  };
  assert.equal(isStudioReady(product), false);
});

test("isStudioReady: true once a front asset and a front placement zone both exist", () => {
  const product = {
    customizable: true,
    assets: [{ type: "CUSTOMIZATION_FRONT" }],
    placementZones: [{ view: "FRONT" }],
  };
  assert.equal(isStudioReady(product), true);
});

test("isStudioReady: true with front + back both configured (back is optional, not required)", () => {
  const product = {
    customizable: true,
    assets: [{ type: "CUSTOMIZATION_FRONT" }, { type: "CUSTOMIZATION_BACK" }],
    placementZones: [{ view: "FRONT" }, { view: "BACK" }],
  };
  assert.equal(isStudioReady(product), true);
});

test("isStudioReady: false for a product with no customizable flag at all (undefined)", () => {
  assert.equal(isStudioReady({ assets: [], placementZones: [] }), false);
});
