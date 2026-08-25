import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { formatInr, pluralUnit, quoteForQuantity } from "../../utils/pricing";
import { getProductDetail } from "../../utils/productDetail";
import { giftCollections } from "../../data/corporateGiftingData";
import styles from "./GiftCollections.module.css";

/** Normalises a catalogue-backed or concept collection into one card shape. */
function resolveCollection(entry) {
  if (entry.kind === "catalogue") {
    const product = getProductDetail(entry.productId);
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      contentsSummary: product.spec,
      art: product.art,
      color: product.color,
      image: product.image,
      pricingProduct: product,
      moq: product.moq,
      unit: product.unit,
      href: `/products/${product.id}`,
    };
  }

  return {
    id: entry.id,
    name: entry.name,
    contentsSummary: entry.contentsSummary,
    art: entry.art,
    color: entry.color,
    image: null,
    pricingProduct: entry,
    moq: entry.moq,
    unit: entry.unit,
    href: null,
  };
}

function CollectionCard({ collection, onRequestQuote }) {
  const quote = quoteForQuantity(collection.pricingProduct, collection.moq);

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <ProductVisual
          art={collection.art}
          color={collection.color}
          src={collection.image}
          alt={`${collection.name} — kit photography placeholder`}
          ratio="4 / 3"
          scale={0.94}
        />
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{collection.name}</h3>
        <p className={styles.contents}>{collection.contentsSummary}</p>

        <div className={styles.priceRow}>
          {quote.kind === "priced" ? (
            <span className={styles.price}>
              {formatInr(quote.unitPrice)}
              <span className={styles.priceUnit}> / {collection.unit}</span>
            </span>
          ) : (
            <span className={styles.quotePrice}>Price on request</span>
          )}
          <span className={styles.moq}>
            MOQ {collection.moq} {pluralUnit(collection.unit, collection.moq)}
          </span>
        </div>

        <div className={styles.actions}>
          {collection.href ? (
            <>
              <Button as={Link} to={collection.href} variant="secondary" size="sm">
                View Details
              </Button>
              <button
                type="button"
                className={styles.textAction}
                onClick={() =>
                  onRequestQuote({
                    product: collection.pricingProduct,
                    quantity: collection.moq,
                    quote,
                    extraSummary: [`Contents: ${collection.contentsSummary}`],
                  })
                }
              >
                Request Kit Quote
              </button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  onRequestQuote({
                    product: collection.pricingProduct,
                    quantity: collection.moq,
                    quote,
                    extraSummary: [`Contents: ${collection.contentsSummary}`],
                  })
                }
              >
                Request Kit Quote
              </Button>
              <Link to={{ hash: "#build-kit" }} className={styles.textAction}>
                Build a similar kit
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default function GiftCollections({ onRequestQuote }) {
  const collections = giftCollections.map(resolveCollection).filter(Boolean);

  return (
    <Section id="gift-collections" ariaLabelledBy="gift-collections-title">
      <SectionHeader
        titleId="gift-collections-title"
        eyebrow="Explore gift collections"
        title="Curated kits, ready to brand"
        description="Start from a ready combination — every kit can still be adjusted to your budget and quantity."
      />

      <ul className={styles.grid}>
        {collections.map((collection) => (
          <li key={collection.id}>
            <CollectionCard collection={collection} onRequestQuote={onRequestQuote} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
