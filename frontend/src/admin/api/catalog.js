import { adminGet, adminPatch, adminPut, adminPost, adminDelete, adminUpload } from "./adminClient";

// ── Products ─────────────────────────────────────────────────────────────────
export const listProductsAdmin = (params) => adminGet("/admin/catalog/products", params);
export const getProductAdmin = (id) => adminGet(`/admin/catalog/products/${id}`);
export const createProductAdmin = (payload) => adminPost("/admin/catalog/products", payload);
export const updateProductAdmin = (id, payload) => adminPatch(`/admin/catalog/products/${id}`, payload);
export const duplicateProductAdmin = (id, payload) => adminPost(`/admin/catalog/products/${id}/duplicate`, payload);

// ── Product attributes (generic framework) ───────────────────────────────────
export const setProductAttribute = (id, key, value) =>
  adminPut(`/admin/catalog/products/${id}/attributes/${key}`, { value });
export const removeProductAttribute = (id, key) =>
  adminDelete(`/admin/catalog/products/${id}/attributes/${key}`);
// Catalogue-review flag (PRODUCT_REVIEW_PENDING) — present ⇒ pending.
export const markProductReviewComplete = (id) => removeProductAttribute(id, "PRODUCT_REVIEW_PENDING");
export const reopenProductReview = (id) => setProductAttribute(id, "PRODUCT_REVIEW_PENDING", true);

// ── Product assets ───────────────────────────────────────────────────────────
export const uploadProductAsset = (productId, file, meta) => {
  const form = new FormData();
  form.append("file", file);
  Object.entries(meta || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") form.append(key, value);
  });
  return adminUpload(`/admin/catalog/products/${productId}/assets/upload`, form);
};
export const createProductAssetFromUrl = (productId, payload) =>
  adminPost(`/admin/catalog/products/${productId}/assets`, payload);
export const updateProductAsset = (productId, assetId, payload) =>
  adminPatch(`/admin/catalog/products/${productId}/assets/${assetId}`, payload);
export const deleteProductAsset = (productId, assetId) =>
  adminDelete(`/admin/catalog/products/${productId}/assets/${assetId}`);

// ── Placement zones ──────────────────────────────────────────────────────────
export const createPlacementZone = (productId, payload) =>
  adminPost(`/admin/catalog/products/${productId}/placement-zones`, payload);
export const updatePlacementZone = (productId, zoneId, payload) =>
  adminPatch(`/admin/catalog/products/${productId}/placement-zones/${zoneId}`, payload);
export const deletePlacementZone = (productId, zoneId) =>
  adminDelete(`/admin/catalog/products/${productId}/placement-zones/${zoneId}`);

// ── Categories ───────────────────────────────────────────────────────────────
export const listCategoriesAdmin = () => adminGet("/admin/catalog/categories");
export const createCategoryAdmin = (payload) => adminPost("/admin/catalog/categories", payload);
export const updateCategoryAdmin = (id, payload) => adminPatch(`/admin/catalog/categories/${id}`, payload);
export const uploadCategoryImage = (categoryId, file, alt) => {
  const form = new FormData();
  form.append("file", file);
  if (alt) form.append("alt", alt);
  return adminUpload(`/admin/catalog/categories/${categoryId}/image`, form);
};
export const removeCategoryImage = (categoryId) => adminDelete(`/admin/catalog/categories/${categoryId}/image`);

// ── Colors ───────────────────────────────────────────────────────────────────
export const listColorsAdmin = () => adminGet("/admin/catalog/colors");
export const createColorAdmin = (payload) => adminPost("/admin/catalog/colors", payload);
export const updateColorAdmin = (id, payload) => adminPatch(`/admin/catalog/colors/${id}`, payload);

// ── Tags ─────────────────────────────────────────────────────────────────────
export const listTagsAdmin = () => adminGet("/admin/catalog/tags");
export const createTagAdmin = (payload) => adminPost("/admin/catalog/tags", payload);

// ── Solutions ────────────────────────────────────────────────────────────────
export const listSolutionsAdmin = () => adminGet("/admin/catalog/solutions");
export const getSolutionAdmin = (id) => adminGet(`/admin/catalog/solutions/${id}`);
export const createSolutionAdmin = (payload) => adminPost("/admin/catalog/solutions", payload);
export const updateSolutionAdmin = (id, payload) => adminPatch(`/admin/catalog/solutions/${id}`, payload);
export const uploadSolutionImage = (solutionId, file, alt) => {
  const form = new FormData();
  form.append("file", file);
  if (alt) form.append("alt", alt);
  return adminUpload(`/admin/catalog/solutions/${solutionId}/image`, form);
};
export const removeSolutionImage = (solutionId) => adminDelete(`/admin/catalog/solutions/${solutionId}/image`);
export const addSolutionProduct = (solutionId, payload) => adminPost(`/admin/catalog/solutions/${solutionId}/products`, payload);
export const updateSolutionProduct = (solutionId, productId, payload) =>
  adminPatch(`/admin/catalog/solutions/${solutionId}/products/${productId}`, payload);
export const removeSolutionProduct = (solutionId, productId) =>
  adminDelete(`/admin/catalog/solutions/${solutionId}/products/${productId}`);
