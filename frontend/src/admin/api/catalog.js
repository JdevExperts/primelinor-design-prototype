import { adminGet, adminPatch, adminPost, adminDelete, adminUpload } from "./adminClient";

// ── Products ─────────────────────────────────────────────────────────────────
export const listProductsAdmin = (params) => adminGet("/admin/catalog/products", params);
export const getProductAdmin = (id) => adminGet(`/admin/catalog/products/${id}`);
export const createProductAdmin = (payload) => adminPost("/admin/catalog/products", payload);
export const updateProductAdmin = (id, payload) => adminPatch(`/admin/catalog/products/${id}`, payload);
export const duplicateProductAdmin = (id, payload) => adminPost(`/admin/catalog/products/${id}/duplicate`, payload);

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

// ── Colors ───────────────────────────────────────────────────────────────────
export const listColorsAdmin = () => adminGet("/admin/catalog/colors");
export const createColorAdmin = (payload) => adminPost("/admin/catalog/colors", payload);
export const updateColorAdmin = (id, payload) => adminPatch(`/admin/catalog/colors/${id}`, payload);

// ── Tags ─────────────────────────────────────────────────────────────────────
export const listTagsAdmin = () => adminGet("/admin/catalog/tags");
export const createTagAdmin = (payload) => adminPost("/admin/catalog/tags", payload);
