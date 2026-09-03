import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ProductVisual from "../ui/ProductVisual";
import { giftingHero } from "../../data/corporateGiftingData";
import { resolveBlockImage } from "../../utils/giftingCatalogue";
import styles from "./GiftingHero.module.css";

/**
 * One editorial hero. Image priority: an explicit curated campaign photo
 * (`giftingHero.desktopImage`, admin-ready like the homepage banners) →
 * the real Promotional Products category image → a composed placeholder
 * (three ProductVisual tiles). A missing image never renders a broken
 * `<img>`.
 */
export default function GiftingHero({ onRequestQuote, resolverContext }) {
  const resolved = resolveBlockImage(giftingHero.imageSource, resolverContext || {});
  const photo = giftingHero.desktopImage
    ? { url: giftingHero.desktopImage, alt: giftingHero.altText }
    : resolved;

  return (
    <section className={styles.hero} aria-labelledby="gifting-hero-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className="eyebrow">{giftingHero.eyebrow}</p>
          <h1 id="gifting-hero-title" className={styles.title}>
            {giftingHero.title}
          </h1>
          <p className={styles.description}>{giftingHero.description}</p>

          <div className={styles.ctas}>
            <Button variant="primary" size="lg" onClick={onRequestQuote}>
              Request a Quote
            </Button>
            <Button
              as={Link}
              to={{ hash: "#build-kit" }}
              variant="secondary"
              size="lg"
              trailingIcon="arrowRight"
            >
              Build Your Kit
            </Button>
          </div>

          <Link to={{ hash: "#gifting-expert" }} className={styles.tertiary}>
            Talk to a Gifting Expert
          </Link>
        </div>

        <div className={styles.visual}>
          {photo ? (
            <img
              className={styles.photo}
              src={photo.url}
              alt={photo.alt || giftingHero.altText}
              loading="eager"
            />
          ) : (
            <div className={styles.collage} aria-hidden="true">
              <div className={`${styles.tile} ${styles.tileFeature}`}>
                <ProductVisual art="giftbox" color="#3c4a63" ratio="1 / 1" scale={0.92} surface="tint" />
              </div>
              <div className={`${styles.tile} ${styles.tileBottle}`}>
                <ProductVisual art="bottle" color="#dfe3e8" ratio="1 / 1" scale={0.9} />
              </div>
              <div className={`${styles.tile} ${styles.tileNotebook}`}>
                <ProductVisual art="notebook" color="#2b2b33" ratio="1 / 1" scale={0.9} />
              </div>
              <span className="visually-hidden">{giftingHero.altText}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
