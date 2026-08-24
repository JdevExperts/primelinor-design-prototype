import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ProductVisual from "../ui/ProductVisual";
import { giftingHero } from "../../data/corporateGiftingData";
import styles from "./GiftingHero.module.css";

/**
 * Not a homepage-style campaign wall — one editorial hero. `desktopImage` /
 * `mobileImage` are admin-ready (same principle as the homepage banners): a
 * real photo swaps in as a data change. Until then a composed placeholder
 * (three ProductVisual tiles) fills the same slot.
 */
export default function GiftingHero({ onRequestQuote }) {
  const hasPhoto = Boolean(giftingHero.desktopImage);

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
          {hasPhoto ? (
            <img
              className={styles.photo}
              src={giftingHero.desktopImage}
              alt={giftingHero.altText}
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
