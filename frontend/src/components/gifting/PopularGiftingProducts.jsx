import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ProductCard from "../ui/ProductCard";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { popularGiftingProductSlugs } from "../../data/corporateGiftingData";
import { resolveGiftProducts } from "../../utils/giftingCatalogue";
import styles from "./PopularGiftingProducts.module.css";

/**
 * The most-requested individual gifting products — resolved from the shared
 * catalogue by slug and rendered with the same ProductCard the Products
 * listing uses, so the image, code and price match exactly. Unresolved /
 * inactive slugs are skipped.
 */
export default function PopularGiftingProducts({ productsBySlug }) {
  const products = resolveGiftProducts(popularGiftingProductSlugs, productsBySlug);

  if (products.length === 0) return null;

  return (
    <Section ariaLabelledBy="popular-gifting-title">
      <SectionHeader
        titleId="popular-gifting-title"
        eyebrow="Popular for corporate gifting"
        title="Individual products, ready to brand"
        description="Prefer to pick pieces one at a time instead of a kit? These are the most requested."
        action={
          <Button as={Link} to="/products" variant="secondary" size="md" trailingIcon="arrowRight">
            View all products
          </Button>
        }
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
    </Section>
  );
}
