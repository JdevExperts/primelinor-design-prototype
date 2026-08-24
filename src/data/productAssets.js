/**
 * Customization + gallery imagery, keyed by catalogue product id.
 *
 * Catalogue cards keep using `image` / `art` on listing records. This file is
 * the richer set Product Detail can later reuse (Front, Back, Model, Team,
 * Detail) without a second image database.
 *
 * Fallback when rendering a controlled preview:
 *   1. selected-color productFront / productBack
 *   2. product defaultColor asset for that side
 *   3. vector GarmentMockup
 *
 * Admin-ready fields (mock only — no admin UI):
 *   src, alt, active, sortOrder, objectFit, aspectRatio,
 *   placementZones, supportsLogoOverlay, type, label
 *
 * Controlled product photos (productFront / productBack) should be:
 *   front- or back-facing, centered, full product visible, plain background,
 *   little perspective, consistent crop between front/back, high-res,
 *   no existing logo, even lighting, margin around the product.
 * Use object-fit: contain so placement percentages stay valid.
 *
 * Same-model guideline: across colours of one product, prefer the same model,
 * pose, framing, lighting and background so White → Navy does not change
 * the person in the photo.
 *
 * Prototype files live under public/images/products/{slug}/.
 * Swap in real PrimeLinor photography by changing `src` only.
 */

function productSide(src, alt, sortOrder = 1) {
  return {
    src,
    alt,
    active: true,
    sortOrder,
    objectFit: "contain",
    aspectRatio: "2 / 3",
  };
}

function galleryItem({
  id,
  type,
  label,
  src,
  alt,
  sortOrder = 10,
  aspectRatio = "2 / 3",
  supportsLogoOverlay = false,
  placementZones,
  teamPlacementZones,
}) {
  return {
    id,
    type,
    label,
    src,
    alt,
    active: true,
    sortOrder,
    aspectRatio,
    supportsLogoOverlay,
    ...(placementZones ? { placementZones } : {}),
    ...(teamPlacementZones ? { teamPlacementZones } : {}),
  };
}

/**
 * Photo-space print zones as % of the image frame (not the vector viewBox).
 * Calibrated for a centred 3:4 studio crop with margin around the product.
 * A colour-specific asset may override these if its crop differs.
 */
const TSHIRT_PHOTO_ZONES = {
  productFront: {
    "left-chest": { cx: 61, cy: 36.5, w: 7, h: 4.4 },
    "front-center": { cx: 50, cy: 43, w: 18, h: 13 },
  },
  productBack: {
    "back-upper": { cx: 50, cy: 33, w: 14, h: 6.5 },
    "back-center": { cx: 50, cy: 46, w: 24, h: 17 },
  },
};

const POLO_PHOTO_ZONES = {
  productFront: {
    "left-chest": { cx: 64, cy: 38.5, w: 6.5, h: 4.2 },
    "front-center": { cx: 50, cy: 49, w: 16, h: 12 },
  },
  productBack: {
    "back-upper": { cx: 50, cy: 33, w: 13, h: 6 },
    "back-center": { cx: 50, cy: 46, w: 22, h: 16 },
  },
};

const HOODIE_PHOTO_ZONES = {
  productFront: {
    "left-chest": { cx: 60.5, cy: 41.5, w: 6.5, h: 4.2 },
    "front-center": { cx: 50, cy: 48.5, w: 15, h: 11 },
  },
  productBack: {
    "back-upper": { cx: 50, cy: 36, w: 13, h: 6 },
    "back-center": { cx: 50, cy: 47, w: 22, h: 15 },
  },
};

const TOTE_PHOTO_ZONES = {
  productFront: {
    "front-center": { cx: 50, cy: 56, w: 28, h: 22 },
  },
  productBack: {
    "back-center": { cx: 50, cy: 56, w: 28, h: 22 },
  },
};

const APPAREL_FRONT = ["left-chest", "front-center"];
const APPAREL_BACK = ["back-upper", "back-center"];
const TOTE_FRONT = ["front-center"];
const TOTE_BACK = ["back-center"];

const TSHIRT_MODEL_ZONES = {
  "left-chest": { cx: 58.5, cy: 39.5, w: 7.2, h: 5 },
  "front-center": { cx: 50, cy: 45, w: 16, h: 12 },
};

const TSHIRT_TEAM_ZONES_4 = {
  "left-chest": [
    { cx: 18.5, cy: 42, w: 4.4, h: 5.6 },
    { cx: 41.5, cy: 41, w: 4.4, h: 5.6 },
    { cx: 62, cy: 41, w: 4.4, h: 5.6 },
    { cx: 84, cy: 42, w: 4.4, h: 5.6 },
  ],
  "front-center": [
    { cx: 16, cy: 46, w: 7.5, h: 9.5 },
    { cx: 39, cy: 45, w: 7.5, h: 9.5 },
    { cx: 60, cy: 45, w: 7.5, h: 9.5 },
    { cx: 82, cy: 46, w: 7.5, h: 9.5 },
  ],
};

const TSHIRT_TEAM_ZONES_5 = {
  "left-chest": [
    { cx: 14, cy: 44, w: 3.8, h: 4.8 },
    { cx: 32, cy: 43, w: 3.8, h: 4.8 },
    { cx: 50, cy: 42, w: 3.8, h: 4.8 },
    { cx: 68, cy: 43, w: 3.8, h: 4.8 },
    { cx: 86, cy: 44, w: 3.8, h: 4.8 },
  ],
  "front-center": [
    { cx: 12, cy: 48, w: 6.2, h: 8.2 },
    { cx: 30, cy: 47, w: 6.2, h: 8.2 },
    { cx: 48.5, cy: 46, w: 6.2, h: 8.2 },
    { cx: 66, cy: 47, w: 6.2, h: 8.2 },
    { cx: 84, cy: 48, w: 6.2, h: 8.2 },
  ],
};

function tshirtLifestyleGallery(
  color,
  {
    modelRatio = "2 / 3",
    teamRatio = "3 / 2",
    teamZones = TSHIRT_TEAM_ZONES_4,
  } = {},
) {
  return [
    galleryItem({
      id: "model",
      type: "model",
      label: "Model",
      src: `/images/products/${TSHIRT}/${color}-model.png`,
      alt: `Indian model wearing a plain ${color} round neck T-shirt`,
      sortOrder: 20,
      aspectRatio: modelRatio,
      supportsLogoOverlay: true,
      placementZones: TSHIRT_MODEL_ZONES,
    }),
    galleryItem({
      id: "team",
      type: "team",
      label: "Team",
      src: `/images/products/${TSHIRT}/${color}-team.png`,
      alt: `Corporate team wearing matching plain ${color} T-shirts`,
      sortOrder: 21,
      aspectRatio: teamRatio,
      supportsLogoOverlay: true,
      teamPlacementZones: teamZones,
    }),
  ];
}

const TSHIRT = "tshirt";
const POLO = "polo";
const HOODIE = "hoodie";
const TOTE = "tote";

export const productCustomizationAssets = {
  "cotton-round-neck": {
    slug: TSHIRT,
    defaultColor: "white",
    supportsBackPrint: true,
    studioFront: APPAREL_FRONT,
    studioBack: APPAREL_BACK,
    placementZones: TSHIRT_PHOTO_ZONES,
    modelPlacementZones: TSHIRT_MODEL_ZONES,
    gallery: tshirtLifestyleGallery("white", {
      modelRatio: "2 / 3",
      teamRatio: "3 / 2",
    }),
    byColor: {
      navy: {
        productFront: productSide(
          `/images/products/${TSHIRT}/navy-front.png`,
          "Navy round neck T-shirt, front, no branding",
        ),
        productBack: productSide(
          `/images/products/${TSHIRT}/navy-back.png`,
          "Navy round neck T-shirt, back, no branding",
          2,
        ),
        gallery: tshirtLifestyleGallery("navy"),
      },
      charcoal: {
        productFront: productSide(
          `/images/products/${TSHIRT}/charcoal-front.png`,
          "Charcoal round neck T-shirt, front, no branding",
        ),
        productBack: productSide(
          `/images/products/${TSHIRT}/charcoal-back.png`,
          "Charcoal round neck T-shirt, back, no branding",
          2,
        ),
        gallery: tshirtLifestyleGallery("charcoal", {
          teamZones: TSHIRT_TEAM_ZONES_5,
        }),
      },
      white: {
        productFront: productSide(
          `/images/products/${TSHIRT}/white-front.png`,
          "White round neck T-shirt, front, no branding",
        ),
        productBack: productSide(
          `/images/products/${TSHIRT}/white-back.png`,
          "White round neck T-shirt, back, no branding",
          2,
        ),
        gallery: tshirtLifestyleGallery("white", {
          modelRatio: "2 / 3",
          teamRatio: "3 / 2",
        }),
      },
      melange: {
        productFront: productSide(
          `/images/products/${TSHIRT}/melange-front.png`,
          "Grey melange round neck T-shirt, front, no branding",
        ),
        productBack: productSide(
          `/images/products/${TSHIRT}/melange-back.png`,
          "Grey melange round neck T-shirt, back, no branding",
          2,
        ),
        gallery: tshirtLifestyleGallery("melange", {
          teamZones: TSHIRT_TEAM_ZONES_5,
        }),
      },
      sand: {
        productFront: productSide(
          `/images/products/${TSHIRT}/sand-front.png`,
          "Sand round neck T-shirt, front, no branding",
        ),
        productBack: productSide(
          `/images/products/${TSHIRT}/sand-back.png`,
          "Sand round neck T-shirt, back, no branding",
          2,
        ),
        gallery: tshirtLifestyleGallery("sand"),
      },
    },
  },

  "premium-polo": {
    slug: POLO,
    defaultColor: "navy",
    supportsBackPrint: true,
    studioFront: APPAREL_FRONT,
    studioBack: APPAREL_BACK,
    placementZones: POLO_PHOTO_ZONES,
    modelPlacementZones: {
      "left-chest": { cx: 57, cy: 42, w: 5, h: 3.2 },
      "front-center": { cx: 50, cy: 48, w: 11, h: 8.5 },
    },
    byColor: {
      navy: {
        productFront: productSide(
          `/images/products/${POLO}/navy-front.png`,
          "Navy polo T-shirt, front, no branding",
        ),
        productBack: productSide(
          `/images/products/${POLO}/navy-back.png`,
          "Navy polo T-shirt, back, no branding",
          2,
        ),
        gallery: [
          galleryItem({
            id: "model",
            type: "model",
            label: "Model",
            src: `/images/products/${POLO}/navy-model.png`,
            alt: "Indian model wearing a plain navy polo T-shirt",
            sortOrder: 20,
            supportsLogoOverlay: true,
            placementZones: {
              "left-chest": { cx: 57, cy: 42, w: 5, h: 3.2 },
              "front-center": { cx: 50, cy: 48, w: 11, h: 8.5 },
            },
          }),
        ],
      },
      white: {
        productFront: productSide(
          `/images/products/${POLO}/white-front.png`,
          "White polo T-shirt, front, no branding",
        ),
      },
    },
    gallery: [
      galleryItem({
        id: "model",
        type: "model",
        label: "Model",
        src: `/images/products/${POLO}/navy-model.png`,
        alt: "Indian model wearing a polo T-shirt",
        sortOrder: 20,
        supportsLogoOverlay: true,
        placementZones: {
          "left-chest": { cx: 57, cy: 42, w: 5, h: 3.2 },
          "front-center": { cx: 50, cy: 48, w: 11, h: 8.5 },
        },
      }),
    ],
  },

  "pullover-hoodie": {
    slug: HOODIE,
    defaultColor: "navy",
    supportsBackPrint: true,
    studioFront: APPAREL_FRONT,
    studioBack: APPAREL_BACK,
    placementZones: HOODIE_PHOTO_ZONES,
    modelPlacementZones: {
      "left-chest": { cx: 56, cy: 45, w: 5, h: 3.2 },
      "front-center": { cx: 50, cy: 49.5, w: 11, h: 8 },
    },
    byColor: {
      navy: {
        productFront: productSide(
          `/images/products/${HOODIE}/navy-front.png`,
          "Navy pullover hoodie, front, no branding",
        ),
        productBack: productSide(
          `/images/products/${HOODIE}/navy-back.png`,
          "Navy pullover hoodie, back, no branding",
          2,
        ),
        gallery: [
          galleryItem({
            id: "model",
            type: "model",
            label: "Model",
            src: `/images/products/${HOODIE}/navy-model.png`,
            alt: "Indian model wearing a plain navy hoodie",
            sortOrder: 20,
            supportsLogoOverlay: true,
            placementZones: {
              "left-chest": { cx: 56, cy: 45, w: 5, h: 3.2 },
              "front-center": { cx: 50, cy: 49.5, w: 11, h: 8 },
            },
          }),
        ],
      },
    },
    gallery: [
      galleryItem({
        id: "model",
        type: "model",
        label: "Model",
        src: `/images/products/${HOODIE}/navy-model.png`,
        alt: "Indian model wearing a hoodie",
        sortOrder: 20,
        supportsLogoOverlay: true,
        placementZones: {
          "left-chest": { cx: 56, cy: 45, w: 5, h: 3.2 },
          "front-center": { cx: 50, cy: 49.5, w: 11, h: 8 },
        },
      }),
    ],
  },

  "canvas-tote": {
    slug: TOTE,
    defaultColor: "sand",
    supportsBackPrint: true,
    studioFront: TOTE_FRONT,
    studioBack: TOTE_BACK,
    placementZones: TOTE_PHOTO_ZONES,
    gallery: [
      galleryItem({
        id: "lifestyle",
        type: "lifestyle",
        label: "Lifestyle",
        src: `/images/products/${TOTE}/sand-lifestyle.png`,
        alt: "Canvas tote bag in a workplace lifestyle setting",
        sortOrder: 20,
        aspectRatio: "3 / 2",
      }),
    ],
    byColor: {
      sand: {
        productFront: productSide(
          `/images/products/${TOTE}/sand-front.png`,
          "Sand canvas tote bag, front, no branding",
        ),
        productBack: productSide(
          `/images/products/${TOTE}/sand-back.png`,
          "Sand canvas tote bag, back, no branding",
          2,
        ),
        gallery: [
          galleryItem({
            id: "lifestyle",
            type: "lifestyle",
            label: "Lifestyle",
            src: `/images/products/${TOTE}/sand-lifestyle.png`,
            alt: "Canvas tote bag in a workplace lifestyle setting",
            sortOrder: 20,
            aspectRatio: "3 / 2",
          }),
        ],
      },
    },
  },
};
