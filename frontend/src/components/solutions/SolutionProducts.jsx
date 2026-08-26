import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductBySlug } from "../../api/catalog";
import ProductCard from "../ui/ProductCard";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import styles from "./SolutionProducts.module.css";

/**
 * `recommendedProductIds` are real catalogue slugs (Phase 6A.1 §28) —
 * this used to resolve them against the static 5-product `listingProducts`
 * mock, which is why a solution page could only ever recommend one of
 * those 5 regardless of what its config listed, and silently dropped any
 * id that didn't happen to be in that array. Fetching each by slug from
 * the real Catalog API means every solution page's recommendations track
 * the live catalogue — a slug the API doesn't have (yet) is simply
 * omitted, same `.filter(Boolean)` behavior as before, just against real
 * data instead of a 5-item fixture.
 */
export default function SolutionProducts({ solution }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(solution.recommendedProductIds.map((slug) => getProductBySlug(slug)))
      .then((results) => {
        if (!cancelled) setProducts(results.filter(Boolean));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [solution.recommendedProductIds]);

  if (!products.length) return null;

  return (
    <Section ariaLabelledBy="solution-products-title">
      <SectionHeader
        titleId="solution-products-title"
        eyebrow="Recommended products"
        title={`Popular for ${solution.label}`}
      />

      <ul className={styles.grid}>
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              showSwatches
              compactMobile
              detailsTo={`/products/${product.id}`}
              tryHref={`/customize/${product.id}`}
            />
          </li>
        ))}
      </ul>

      {solution.recommendedCategories?.length ? (
        <div className={styles.categories}>
          <span className={styles.categoriesLabel}>Explore</span>
          <ul className={styles.categoriesList}>
            {solution.recommendedCategories.map((category) => (
              <li key={category.id}>
                <Link
                  to="/products"
                  state={{ category: category.id }}
                  className={styles.categoryLink}
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}
