import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ProductCard from "../ui/ProductCard";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { popularGiftingProductIds } from "../../data/corporateGiftingData";
import { listingProducts } from "../../data/mockData";
import styles from "./PopularGiftingProducts.module.css";

export default function PopularGiftingProducts() {
  const products = popularGiftingProductIds
    .map((id) => listingProducts.find((item) => item.id === id))
    .filter(Boolean);

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
