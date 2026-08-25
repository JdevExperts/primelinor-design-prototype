/**
 * Shared colour maths for the illustration systems (catalogue ProductVisual
 * and the customization GarmentMockup) so both shade a product the same way.
 */

function channels(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Blend a hex colour toward white ("light") or black ("dark"). */
export function mix(hex, target, amount) {
  const t = target === "light" ? 255 : 0;
  return `rgb(${channels(hex)
    .map((v) => Math.round(v + (t - v) * amount))
    .join(", ")})`;
}

/** Perceived brightness test — pale products need a deeper backdrop. */
export function isLight(hex) {
  const [r, g, b] = channels(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
