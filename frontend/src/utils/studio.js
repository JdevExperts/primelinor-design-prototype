import {
  customizableProducts,
  productColors,
} from "../data/mockData";
import { getProductDetail } from "./productDetail";
import {
  getProductAssets,
  studioBackPlacements,
  studioFrontPlacements,
} from "./studioAssets";

/** Homepage demo ids → catalogue products the studio can price. */
export const demoProductToCatalogue = {
  tshirt: "cotton-round-neck",
  polo: "premium-polo",
  hoodie: "pullover-hoodie",
  tote: "canvas-tote",
};

/** Lightweight product switcher inside the studio — not the full catalogue. */
export const studioSwitchIds = [
  "cotton-round-neck",
  "premium-polo",
  "pullover-hoodie",
  "canvas-tote",
];

export const studioSwitchLabels = {
  "cotton-round-neck": "Round Neck T-Shirt",
  "premium-polo": "Polo T-Shirt",
  "pullover-hoodie": "Hoodie",
  "canvas-tote": "Tote Bag",
};

const PREVIEWABLE_ART = new Set(
  customizableProducts.map((item) => item.mockup),
);

/**
 * Studio-only vector zone overrides. Homepage Try Your Logo keeps
 * `customizableProducts.zones` unchanged.
 */
const VECTOR_STUDIO_ZONES = {
  tshirt: {
    "left-chest": { cx: 62.5, cy: 34, w: 8, h: 5 },
    "front-center": { cx: 50, cy: 42, w: 20, h: 14 },
    "back-upper": { cx: 50, cy: 32, w: 16, h: 7 },
    "back-center": { cx: 50, cy: 44, w: 26, h: 18 },
  },
  polo: {
    "left-chest": { cx: 66.5, cy: 38.5, w: 7.5, h: 5 },
    "front-center": { cx: 50, cy: 48, w: 16, h: 12 },
    "back-upper": { cx: 50, cy: 32, w: 15, h: 6.5 },
    "back-center": { cx: 50, cy: 44, w: 24, h: 17 },
  },
  hoodie: {
    "left-chest": { cx: 61, cy: 43.5, w: 7.5, h: 5 },
    "front-center": { cx: 50, cy: 50.5, w: 16, h: 11 },
    "back-upper": { cx: 50, cy: 38, w: 15, h: 6.5 },
    "back-center": { cx: 50, cy: 44, w: 24, h: 16 },
  },
  tote: {
    "front-center": { cx: 50, cy: 63.6, w: 30, h: 22 },
    "back-center": { cx: 50, cy: 63.6, w: 30, h: 22 },
  },
};

export function resolveStudioSetup(productId) {
  const resolvedId = demoProductToCatalogue[productId] || productId;
  const listing = getProductDetail(resolvedId);
  if (!listing) return { status: "missing", listing: null };

  const template = customizableProducts.find(
    (item) => item.mockup === listing.art,
  );
  if (!template || !PREVIEWABLE_ART.has(listing.art) || listing.customizable === false) {
    return { status: "unsupported", listing };
  }

  const sourceColors = listing.colors?.length ? listing.colors : template.colors;
  const colors = sourceColors.filter((key) => productColors[key]);
  const assets = getProductAssets(listing.id);
  const frontPlacements = studioFrontPlacements(template, assets);
  const backPlacements = studioBackPlacements(template, assets);
  const extras = VECTOR_STUDIO_ZONES[template.mockup] || {};

  return {
    status: "ok",
    listing,
    preview: {
      name: listing.name,
      mockup: template.mockup,
      zones: { ...template.zones, ...extras },
    },
    assets,
    colors: colors.length ? colors : ["white"],
    placements: [...frontPlacements, ...backPlacements],
    frontPlacements,
    backPlacements,
    supportsBackPrint: backPlacements.length > 0,
  };
}

export function studioSwitchProducts() {
  return studioSwitchIds
    .map((id) => {
      const product = getProductDetail(id);
      if (!product) return null;
      return {
        ...product,
        switchLabel: studioSwitchLabels[id] || product.name,
      };
    })
    .filter(Boolean);
}
