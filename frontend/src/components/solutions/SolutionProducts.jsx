import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ProductCard from "../ui/ProductCard";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import styles from "./SolutionProducts.module.css";

/**
 * `solution.products` arrives already resolved by the backend (Solutions
 * Phase A §19/§20 — a real ordered SolutionProduct mapping, ACTIVE products
 * only), mapped through the same product-listing adapter every other
 * ProductCard uses. No per-slug fetch here anymore — the old
 * `recommendedProductIds.map(getProductBySlug)` approach did one request
 * per product; this reads a single already-fetched array instead.
 */
export default function SolutionProducts({ solution }) {
  const products = solution.products || [];

  return (
    <Section ariaLabelledBy="solution-products-title">
      <SectionHeader
        titleId="solution-products-title"
        eyebrow="Recommended products"
        title={`Popular for ${solution.label}`}
      />

      {products.length ? (
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
      ) : (
        // The backend rejects an ACTIVE Solution with zero active products
        // (Solutions Phase A §5/§21), so this should never render in
        // practice — this is defensive-only, never a silent blank section.
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Products for this solution are being updated.</p>
          <p className={styles.emptyCopy}>Tell us what you need and we&rsquo;ll help you find the right fit.</p>
          <div className={styles.emptyActions}>
            <Button as={Link} to="/products" variant="secondary" size="md">
              Browse Products
            </Button>
          </div>
        </div>
      )}

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
