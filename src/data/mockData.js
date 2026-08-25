/**
 * COMPATIBILITY BARREL.
 *
 * mockData.js used to hold everything — nav config, homepage content, and
 * the actual product catalogue all in one 1,400+ line file with no clear
 * boundary between "will eventually come from a backend API" and "will
 * always be frontend-only config" (flagged in the pre-production audit).
 *
 * It's now split into three domain files:
 *
 *   catalogData.js   real product/catalog data — shrinks as pages move
 *                    onto the real Catalog API (src/api/catalog.js)
 *   homeData.js      homepage-only presentational content
 *   siteConfig.js    nav, mega menu, footer — never comes from an API
 *
 * This file re-exports all three so the many existing
 * `import { x } from "../../data/mockData"` call sites across the app keep
 * working unchanged. New code should import directly from the specific
 * domain file instead of from here.
 */
export * from "./catalogData";
export * from "./homeData";
export * from "./siteConfig";
