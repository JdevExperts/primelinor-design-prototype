import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import { giftingCollections } from "../../data/mockData";
import styles from "./CorporateGifting.module.css";

/* One tall feature, two stacked supports and a wide closing tile — varied
   proportions on a shared grid so the group reads as a curated collection. */
const SLOT = ["feature", "support", "support", "wide"];

export default function CorporateGifting() {
  return (
    <Section
      id="corporate-gifting"
      tone="tint"
      spacious
      ariaLabelledBy="gifting-title"
    >
      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className="eyebrow">Corporate gifting</p>
          <h2 id="gifting-title" className={styles.title}>
            Gifting your team will actually keep
          </h2>
          <p className={styles.description}>
            We help HR, marketing and operations teams put together considered
            gifts — from a single welcome kit design to a festival rollout
            across offices. Choose a ready collection or build a kit around
            your budget.
          </p>

          <div className={styles.ctas}>
            <Button as={Link} to="/corporate-gifting" variant="primary" size="lg">
              Explore Corporate Gifting
            </Button>
            <Button
              as={Link}
              to={{ pathname: "/corporate-gifting", hash: "#build-kit" }}
              variant="quiet"
              size="lg"
              trailingIcon="arrowRight"
            >
              Build Your Kit
            </Button>
          </div>
        </div>

        <ul className={styles.collections}>
          {giftingCollections.map((collection, index) => {
            const slot = SLOT[index] || "support";
            const isWide = slot === "wide";
            const isFeature = slot === "feature";

            return (
              <li key={collection.id} className={styles[`${slot}Slot`]}>
                <article className={`${styles.card} ${styles[slot]}`}>
                  <div className={styles.media}>
                    <div className={styles.mediaInner}>
                      <ProductVisual
                        art={collection.art}
                        color={collection.color}
                        src={collection.image}
                        surface={isFeature ? "warm" : "default"}
                        alt={`${collection.title} — lifestyle photography placeholder`}
                        ratio={isFeature ? "auto" : isWide ? "4 / 2" : "4 / 2.9"}
                        scale={isWide ? 0.9 : 0.94}
                        className={isFeature ? styles.featureVisual : ""}
                      />
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>
                      {/* No dedicated collection deep-links exist on
                          /corporate-gifting yet (Phase: homepage
                          simplification) — routes there rather than
                          leaving a dead click, matching the same fallback
                          Footer.jsx's footerLinkRoutes already uses for
                          these exact same collection labels. */}
                      <Link to="/corporate-gifting" className={styles.trigger}>
                        {collection.title}
                      </Link>
                    </h3>
                    <p className={styles.cardText}>{collection.description}</p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
