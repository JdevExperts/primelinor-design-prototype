import {
  listingCategories,
  listingFilterOptions,
  listingProducts,
  printPlacements,
  productColors,
} from "../data/mockData";
import {
  apparelSizeGuide,
  apparelSizes,
  galleryViews,
  hoodieSizeGuide,
  productDetailOverrides,
  quickQuantities,
} from "../data/productDetail";

const categoryLabelById = Object.fromEntries(
  listingCategories.map((item) => [item.id, item.label]),
);

const materialLabelById = Object.fromEntries(
  listingFilterOptions.materials.map((item) => [item.id, item.label]),
);

const APPAREL = new Set(["tshirts", "polo", "hoodies"]);

const PLACEMENTS_BY_ART = {
  tshirt: ["left-chest", "right-chest", "front-center", "back-center", "sleeve"],
  polo: ["left-chest", "right-chest", "front-center", "back-center", "sleeve"],
  hoodie: ["left-chest", "right-chest", "front-center", "back-center", "sleeve"],
  tote: ["front-center", "back-center"],
  backpack: ["front-center"],
  cap: ["front-center"],
  bottle: ["front-center"],
  mug: ["front-center"],
  notebook: ["front-center"],
  pen: ["front-center"],
  giftbox: [],
  kit: [],
};

function dispatchFor(category) {
  if (category === "kits" || category === "gifts") return "10–14 working days";
  if (category === "bottles" || category === "bags") return "8–12 working days";
  return "7–10 working days";
}

function defaultHighlights(product) {
  const items = [];
  if (product.gsm) items.push(`${product.gsm} GSM`);
  if (product.material && materialLabelById[product.material]) {
    items.push(materialLabelById[product.material]);
  }
  if (product.colors?.length > 1) items.push("Multiple colors");
  if (product.customizable) items.push("Custom branding available");
  items.push(`MOQ ${product.moq}`);
  return items;
}

function defaultSpecifications(product, extras) {
  const rows = [];
  const unitLabel =
    product.unit === "piece"
      ? product.moq === 1
        ? "1 piece"
        : `${product.moq} pieces`
      : `${product.moq} ${product.unit}${product.moq === 1 ? "" : "s"}`;

  if (product.material) {
    rows.push({
      label: "Material",
      value: materialLabelById[product.material] || product.material,
    });
  }
  if (product.gsm) rows.push({ label: "GSM", value: `${product.gsm} GSM` });
  if (extras.fit) rows.push({ label: "Fit", value: extras.fit });
  if (extras.gender) rows.push({ label: "Gender", value: extras.gender });
  if (extras.sleeve) rows.push({ label: "Sleeve", value: extras.sleeve });
  if (extras.neck) rows.push({ label: "Neck", value: extras.neck });
  if (extras.variantType === "size" && extras.variants?.length) {
    rows.push({
      label: "Sizes",
      value: `${extras.variants[0].label}–${extras.variants[extras.variants.length - 1].label}`,
    });
  }
  rows.push({
    label: "Customization",
    value: product.customizable ? "Available" : "On request",
  });
  rows.push({ label: "MOQ", value: unitLabel });
  rows.push({ label: "Dispatch", value: extras.dispatchEstimate });
  return rows;
}

function categoryExtras(product) {
  const apparel = APPAREL.has(product.category);
  const hoodie = product.category === "hoodies";

  return {
    variantType: apparel ? "size" : null,
    variants: apparel ? apparelSizes : [],
    sizeGuide: hoodie ? hoodieSizeGuide : apparel ? apparelSizeGuide : null,
    placements: PLACEMENTS_BY_ART[product.art] || [],
    dispatchEstimate: dispatchFor(product.category),
    fit: apparel ? "Regular Fit" : null,
    gender: apparel ? "Unisex" : null,
    sleeve: apparel && product.category !== "hoodies" ? "Half Sleeve" : null,
    neck:
      product.category === "polo"
        ? "Polo Collar"
        : product.category === "tshirts"
          ? "Round Neck"
          : product.category === "hoodies"
            ? "Hooded"
            : null,
  };
}

export function getCategoryLabel(categoryId) {
  return categoryLabelById[categoryId] || "Products";
}

export function getColorMeta(colorId) {
  return productColors[colorId] || { label: colorId, hex: "#e3e6eb" };
}

export function getPlacementLabel(id) {
  return printPlacements[id]?.label || id;
}

export function getProductDetail(id) {
  const base = listingProducts.find((product) => product.id === id);
  if (!base) return null;

  const extras = categoryExtras(base);
  const override = productDetailOverrides[id] || {};
  const merged = { ...extras, ...override };

  const specifications = override.specifications || defaultSpecifications(base, merged);

  return {
    ...base,
    categoryLabel: getCategoryLabel(base.category),
    description:
      merged.description ||
      `${base.name} for teams and campaigns. ${base.spec}. Brand it and request a quotation for your quantity.`,
    longSpec: merged.longSpec || base.spec,
    variantType: merged.variantType,
    variants: merged.variants || [],
    sizeGuide: merged.sizeGuide || null,
    placements: merged.placements || [],
    dispatchEstimate: merged.dispatchEstimate,
    highlights: merged.highlights || defaultHighlights(base),
    specifications,
    relatedProductIds: merged.relatedProductIds || [],
    gallery: galleryViews.map((view) => ({
      ...view,
      image: null,
    })),
    fit: merged.fit,
    gender: merged.gender,
    sleeve: merged.sleeve,
    neck: merged.neck,
  };
}

export function getRelatedProducts(product, limit = 4) {
  const wanted = [...(product.relatedProductIds || [])];
  const seen = new Set([product.id]);
  const related = [];

  for (const id of wanted) {
    if (seen.has(id)) continue;
    const match = getProductDetail(id);
    if (!match) continue;
    seen.add(id);
    related.push(match);
    if (related.length === limit) return related;
  }

  for (const item of listingProducts) {
    if (seen.has(item.id)) continue;
    if (item.category !== product.category) continue;
    seen.add(item.id);
    related.push(getProductDetail(item.id));
    if (related.length === limit) return related;
  }

  for (const item of listingProducts) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    related.push(getProductDetail(item.id));
    if (related.length === limit) return related;
  }

  return related;
}

export function visibleQuickQuantities(moq) {
  const chips = quickQuantities.filter((value) => value >= moq);
  if (moq && !chips.includes(moq) && moq < quickQuantities[0]) {
    return [moq, ...chips];
  }
  return chips;
}
