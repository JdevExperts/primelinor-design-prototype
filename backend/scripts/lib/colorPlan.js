/**
 * Color master list (Phase 6A §20). The legacy DB has no color data at
 * all (no `colors` table), so this is the "if not: create a sensible
 * reusable Color master list" branch — merged with what the Phase 1 seed
 * already created (White/Navy/Charcoal/Grey Melange/Sand/Maroon), adding
 * only the colors still missing from the required minimum list.
 */
const REQUIRED_COLORS = [
  { slug: "white", name: "White", hex: "#e8eaee" },
  { slug: "black", name: "Black", hex: "#1a1a1a" },
  { slug: "navy", name: "Navy", hex: "#22304a" },
  { slug: "royal-blue", name: "Royal Blue", hex: "#1e40af" },
  { slug: "red", name: "Red", hex: "#b91c1c" },
  { slug: "grey", name: "Grey", hex: "#8a8f98" },
  { slug: "charcoal", name: "Charcoal", hex: "#2b2b33" },
  { slug: "maroon", name: "Maroon", hex: "#5c2733" },
  { slug: "green", name: "Green", hex: "#2f6f4f" },
  { slug: "sand", name: "Sand", hex: "#e3ddd0" },
];

module.exports = { REQUIRED_COLORS };
