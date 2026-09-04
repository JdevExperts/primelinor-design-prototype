import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { formatInr, pluralUnit, quoteForQuantity } from "../../utils/pricing";
import { giftCollections } from "../../data/corporateGiftingData";
import { resolveGiftProducts } from "../../utils/giftingCatalogue";
import styles from "./GiftCollections.module.css";

/**
 * Every card is a canonical gift-kit Product resolved from the shared
 * catalogue (`productsBySlug`). Image, name, price and MOQ come straight
 * from that record — identical to the Products tab — and "View Details"
 * links to its real PDP. Curated entries that no longer resolve (renamed /
 * deactivated) are dropped by resolveGiftProducts, so no broken card.
 */
function CollectionCard({ product, onRequestQuote }) {
  const context = product.gifting?.context || null;
  const quote = quoteForQuantity(product, product.moq);
  const contentsSummary = context || product.spec;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <ProductVisual
          art={product.art}
          color={product.color}
          src={product.image}
          alt={product.imageAlt || `${product.name} — corporate gift kit`}
          ratio="4 / 3"
          scale={0.94}
        />
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.contents}>{contentsSummary}</p>

        <div className={styles.priceRow}>
          {quote.kind === "priced" ? (
            <span className={styles.price}>
              {formatInr(quote.unitPrice)}
              <span className={styles.priceUnit}> / {product.unit}</span>
            </span>
          ) : (
            <span className={styles.quotePrice}>Price on request</span>
          )}
          <span className={styles.moq}>
            MOQ {product.moq} {pluralUnit(product.unit, product.moq)}
          </span>
        </div>

        <div className={styles.actions}>
          <Button as={Link} to={`/products/${product.id}`} variant="secondary" size="sm">
            View Details
          </Button>
          <button
            type="button"
            className={styles.textAction}
            onClick={() =>
              onRequestQuote({
                product,
                productSlug: product.id,
                quantity: product.moq,
                quote,
                extraSummary: contentsSummary ? [`Contents: ${contentsSummary}`] : [],
              })
            }
          >
            Request Kit Quote
          </button>
        </div>
      </div>
    </article>
  );
}

export default function GiftCollections({ onRequestQuote, productsBySlug }) {
  const collections = resolveGiftProducts(giftCollections, productsBySlug);

  if (collections.length === 0) return null;

  return (
    <Section id="gift-collections" ariaLabelledBy="gift-collections-title">
      <SectionHeader
        titleId="gift-collections-title"
        eyebrow="Explore gift collections"
        title="Curated kits, ready to brand"
        description="Start from a ready combination — every kit can still be adjusted to your budget and quantity."
      />

      <ul className={styles.grid}>
        {collections.map((product) => (
          <li key={product.id}>
            <CollectionCard product={product} onRequestQuote={onRequestQuote} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
