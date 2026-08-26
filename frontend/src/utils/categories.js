/**
 * Flattens the backend's (up to) two-level category tree — top-level
 * categories each with one level of active children (services/serialize.js's
 * `serializeCategory`) — into the leaf categories any product can actually
 * belong to. A top-level category with no children is itself a leaf.
 *
 * Shared by Product Listing's category filter and the Homepage "Shop by
 * category" section so both read the exact same real slug/name/image data
 * from one place, rather than each re-deriving it (or, worse, one of them
 * duplicating category records in frontend config).
 */
export function flattenToLeafCategories(categories) {
  const leaves = [];
  for (const cat of categories || []) {
    if (cat.children?.length) {
      for (const child of cat.children) {
        leaves.push({ slug: child.slug, name: child.name, image: child.image || null });
      }
    } else {
      leaves.push({ slug: cat.slug, name: cat.name, image: cat.image || null });
    }
  }
  return leaves;
}
