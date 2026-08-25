/**
 * Frontend catalog API client — the only place page components should
 * reach for product/category data going forward. Keeps `fetch` calls out
 * of pages.
 *
 * Dev fixture mode (VITE_USE_MOCK_CATALOG=true, dev builds only): serves
 * the existing mock catalogue instead of calling the real API, for
 * frontend-only work with no backend running. This is an explicit opt-in,
 * never a silent fallback — production always calls the real API and lets
 * a real failure surface as a real error state. See ProductListing/
 * ProductDetail for how that error state is shown.
 */
import { apiGet } from "./http";
import { mapApiProductToDetailShape, mapApiProductToListingShape } from "./adapters";

const USE_FIXTURES = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_CATALOG === "true";

async function loadFixtures() {
  const { listingProducts, listingCategories } = await import("../data/catalogData");
  return { listingProducts, listingCategories };
}

async function loadDetailFixtures() {
  const { getProductDetail, getRelatedProducts } = await import("../utils/productDetail");
  return { getProductDetail, getRelatedProducts };
}

export async function getProducts(params = {}) {
  if (USE_FIXTURES) {
    const { listingProducts } = await loadFixtures();
    return { products: listingProducts.filter((p) => p.active !== false), total: listingProducts.length };
  }

  const data = await apiGet("/products", { params });
  return {
    products: data.products.map(mapApiProductToListingShape),
    total: data.total,
  };
}

export async function getProductBySlug(slug) {
  if (USE_FIXTURES) {
    const { getProductDetail, getRelatedProducts } = await loadDetailFixtures();
    const product = getProductDetail(slug);
    if (!product) return null;
    return {
      ...product,
      relatedProducts: getRelatedProducts(product),
      assets: [],
      placementZones: [],
    };
  }

  try {
    const data = await apiGet(`/products/${slug}`);
    return mapApiProductToDetailShape(data.product);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function getCategories() {
  if (USE_FIXTURES) {
    const { listingCategories } = await loadFixtures();
    return listingCategories;
  }

  const data = await apiGet("/categories");
  return data.categories;
}
