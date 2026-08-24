import { printPlacements } from "../data/mockData";
import { productCustomizationAssets } from "../data/productAssets";

/** Customer-facing studio labels. Homepage / PDP keep printPlacements names. */
export const studioPlacementLabels = {
  "left-chest": "Left Chest",
  "front-center": "Center",
  "back-upper": "Upper Back",
  "back-center": "Center Back",
};

export function studioPlacementLabel(key) {
  return studioPlacementLabels[key] || printPlacements[key]?.label || key;
}

export function frontPlacementKeys(zones) {
  return Object.keys(zones).filter(
    (key) => printPlacements[key]?.view === "front",
  );
}

export function backPlacementKeys(zones) {
  return Object.keys(zones).filter(
    (key) => printPlacements[key]?.view === "back",
  );
}

export function studioFrontPlacements(template, assets) {
  if (assets?.studioFront?.length) return assets.studioFront;
  if (template.mockup === "tote") return ["front-center"];
  return ["left-chest", "front-center"];
}

export function studioBackPlacements(template, assets) {
  if (assets?.studioBack?.length) return assets.studioBack;
  if (template.mockup === "tote") return ["back-center"];
  return ["back-upper", "back-center"];
}

function isActiveSrc(item) {
  return Boolean(item?.src) && item.active !== false;
}

function pickSide(pack, side) {
  return isActiveSrc(pack?.[side]) ? pack[side] : null;
}

/**
 * Use a real product photo only when that colour has the requested side.
 * Otherwise the caller draws the vector mockup in the selected colour —
 * never a different colour's photograph.
 */
export function resolveProductPhoto(assets, colorKey, side) {
  if (!assets) return null;
  return pickSide(assets.byColor?.[colorKey], side);
}

export function resolvePlacementZone({
  assets,
  colorKey,
  side,
  placementKey,
  vectorZones,
  usingPhoto,
}) {
  if (!usingPhoto) return vectorZones?.[placementKey] || null;

  const colorPack = assets?.byColor?.[colorKey];
  const asset = colorPack?.[side];
  return (
    asset?.placementZones?.[placementKey] ||
    colorPack?.placementZones?.[side]?.[placementKey] ||
    assets?.placementZones?.[side]?.[placementKey] ||
    vectorZones?.[placementKey] ||
    null
  );
}

const MODEL_ZONE_ALIASES = {
  "left-chest": ["left-chest", "leftChest", "frontLeftChest"],
  "front-center": ["front-center", "center", "frontCenter"],
};

function pickAliasedZone(record, key) {
  if (!record) return null;
  for (const alias of MODEL_ZONE_ALIASES[key] || [key]) {
    if (record[alias]) return record[alias];
  }
  return null;
}

const LIGHT_COLORS = ["white", "melange", "sand"];
const DARK_COLORS = ["navy", "charcoal", "maroon"];

export function resolveLifestyle(assets, colorKey, type) {
  if (!assets) return null;

  const findIn = (items) =>
    items?.find((item) => item.type === type && isActiveSrc(item)) || null;

  const selected = findIn(assets.byColor?.[colorKey]?.gallery);
  if (selected) return selected;

  const shared = findIn(assets.gallery);
  if (shared) return shared;

  const related = LIGHT_COLORS.includes(colorKey) ? LIGHT_COLORS : DARK_COLORS;
  for (const key of [assets.defaultColor, ...related]) {
    if (!key || key === colorKey) continue;
    const found = findIn(assets.byColor?.[key]?.gallery);
    if (found) return found;
  }

  for (const pack of Object.values(assets.byColor || {})) {
    const found = findIn(pack.gallery);
    if (found) return found;
  }

  return null;
}

/** Model overlay zones are independent of product-photo coordinates. */
export function resolveModelPlacementZone(assets, colorKey, placementKey) {
  const model = resolveLifestyle(assets, colorKey, "model");
  if (!model) return null;
  return (
    pickAliasedZone(model.placementZones, placementKey) ||
    pickAliasedZone(model.modelPlacementZones, placementKey) ||
    pickAliasedZone(assets?.modelPlacementZones, placementKey) ||
    null
  );
}

export function resolveTeamPlacementZones(assets, colorKey, placementKey) {
  const team = resolveLifestyle(assets, colorKey, "team");
  if (!team) return null;
  const zones =
    team.teamPlacementZones?.[placementKey] ||
    assets?.teamPlacementZones?.[placementKey] ||
    null;
  return Array.isArray(zones) && zones.length ? zones : null;
}

export function studioGalleryItems(assets, colorKey, { hasBack }) {
  const frontPhoto = resolveProductPhoto(assets, colorKey, "productFront");
  const backPhoto = resolveProductPhoto(assets, colorKey, "productBack");
  const items = [
    {
      id: "front",
      label: "Front",
      previewKind: "product",
      productView: "front",
      src: frontPhoto?.src || null,
    },
  ];

  if (hasBack) {
    items.push({
      id: "back",
      label: "Back",
      previewKind: "product",
      productView: "back",
      src: backPhoto?.src || null,
    });
    items.push({
      id: "both",
      label: "Front + Back",
      previewKind: "product",
      productView: "both",
      src: frontPhoto?.src || null,
      srcBack: backPhoto?.src || null,
      split: true,
    });
  }

  const model = resolveLifestyle(assets, colorKey, "model");
  if (model) {
    items.push({
      id: "model",
      label: model.label || "Model",
      previewKind: "model",
      src: model.src,
      alt: model.alt,
      aspectRatio: model.aspectRatio,
    });
  }

  const lifestyle =
    resolveLifestyle(assets, colorKey, "team") ||
    resolveLifestyle(assets, colorKey, "lifestyle");
  if (lifestyle) {
    items.push({
      id: lifestyle.id || lifestyle.type,
      label: lifestyle.label || (lifestyle.type === "team" ? "Team" : "Lifestyle"),
      previewKind: "lifestyle",
      src: lifestyle.src,
      alt: lifestyle.alt,
      aspectRatio: lifestyle.aspectRatio,
    });
  }

  return items;
}

export function getProductAssets(productId) {
  return productCustomizationAssets[productId] || null;
}

export function hasPreviewKind(assets, colorKey, kind) {
  if (kind === "product") return true;
  if (kind === "model") return Boolean(resolveLifestyle(assets, colorKey, "model"));
  if (kind === "lifestyle") {
    return Boolean(
      resolveLifestyle(assets, colorKey, "team") ||
        resolveLifestyle(assets, colorKey, "lifestyle"),
    );
  }
  return false;
}
