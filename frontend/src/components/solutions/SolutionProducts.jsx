import { Link } from "react-router-dom";
import ProductCard from "../ui/ProductCard";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { listingProducts } from "../../data/mockData";
import styles from "./SolutionProducts.module.css";

export default function SolutionProducts({ solution }) {
  const products = solution.recommendedProductIds
    .map((id) => listingProducts.find((item) => item.id === id))
    .filter(Boolean);

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
