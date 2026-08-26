/**
 * The target category taxonomy (Phase 6A §9/§10). Existing Phase-1 seed
 * slugs (`tshirts`, `polo`, `bottles`, `bags`, `kits`) are deliberately
 * REUSED rather than recreated under new slugs — re-parenting them under a
 * new parent category preserves every existing `?category=<slug>` link
 * and every product row's existing `categoryId` FK, satisfying §10's
 * "preserve compatibility through clean slug values" without a single
 * product needing to move.
 *
 * `key` here is an internal lookup key the backfill script uses to route
 * products to a category id after upsert — not the slug.
 */
const CATEGORY_TREE = [
  {
    key: "apparel",
    slug: "apparel",
    name: "Apparel",
    sortOrder: 1,
    children: [
      { key: "t-shirts", slug: "tshirts", name: "T-Shirts", sortOrder: 1 },
      { key: "polo-tshirts", slug: "polo", name: "Polo T-Shirts", sortOrder: 2 },
      { key: "hoodies", slug: "hoodies", name: "Hoodies & Sweatshirts", sortOrder: 3 },
      { key: "uniforms", slug: "uniforms", name: "Uniforms", sortOrder: 4 },
    ],
  },
  {
    key: "accessories",
    slug: "accessories",
    name: "Accessories",
    sortOrder: 2,
    children: [
      { key: "caps", slug: "caps", name: "Caps", sortOrder: 1 },
      { key: "bags", slug: "bags", name: "Bags", sortOrder: 2 },
      { key: "tote-bags", slug: "tote-bags", name: "Tote Bags", sortOrder: 3 },
    ],
  },
  {
    key: "drinkware",
    slug: "drinkware",
    name: "Drinkware",
    sortOrder: 3,
    children: [
      { key: "bottles", slug: "bottles", name: "Bottles", sortOrder: 1 },
      { key: "tumblers", slug: "tumblers", name: "Tumblers / Sippers", sortOrder: 2 },
      { key: "mugs", slug: "mugs", name: "Mugs", sortOrder: 3 },
    ],
  },
  {
    key: "stationery",
    slug: "stationery",
    name: "Stationery",
    sortOrder: 4,
    children: [
      { key: "pens", slug: "pens", name: "Pens", sortOrder: 1 },
      { key: "notebooks", slug: "notebooks", name: "Notebooks & Diaries", sortOrder: 2 },
    ],
  },
  {
    key: "gifting",
    slug: "gifting",
    name: "Gifting",
    sortOrder: 5,
    children: [
      { key: "corporate-gifts", slug: "corporate-gifts", name: "Corporate Gifts", sortOrder: 1 },
      { key: "gift-kits", slug: "kits", name: "Gift Kits", sortOrder: 2 },
      { key: "promotional", slug: "promotional", name: "Promotional Products", sortOrder: 3 },
    ],
  },
];

/** Flat list of every {key, slug, name, sortOrder, parentKey} — easier for the script to iterate/upsert than the nested tree. */
function flattenCategoryTree() {
  const flat = [];
  for (const parent of CATEGORY_TREE) {
    flat.push({ key: parent.key, slug: parent.slug, name: parent.name, sortOrder: parent.sortOrder, parentKey: null });
    for (const child of parent.children) {
      flat.push({ key: child.key, slug: child.slug, name: child.name, sortOrder: child.sortOrder, parentKey: parent.key });
    }
  }
  return flat;
}

module.exports = { CATEGORY_TREE, flattenCategoryTree };
