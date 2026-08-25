import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import { welcomeKitFeature } from "../../data/corporateGiftingData";
import styles from "./WelcomeKitFeature.module.css";

/**
 * The strongest single feature on the page. Items sit inside one bordered
 * "kit" panel rather than as separate floating cards, so the composition
 * reads as one curated kit even with placeholder illustrations.
 */
export default function WelcomeKitFeature() {
  return (
    <Section id="welcome-kit-feature" tone="tint" ariaLabelledBy="welcome-kit-title" spacious>
      <div className={styles.layout}>
        <div className={styles.kitBox} aria-hidden="true">
          <ul className={styles.items}>
            {welcomeKitFeature.items.map((item) => (
              <li key={item.id} className={styles.item}>
                <ProductVisual art={item.art} color={item.color} ratio="1 / 1" scale={0.86} />
                <span className={styles.itemLabel}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.copy}>
          <p className="eyebrow">{welcomeKitFeature.eyebrow}</p>
          <h2 id="welcome-kit-title" className={styles.title}>
            {welcomeKitFeature.title}
          </h2>
          <p className={styles.description}>{welcomeKitFeature.description}</p>

          <ul className={styles.itemList} aria-label="What's inside">
            {welcomeKitFeature.items.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>

          <div className={styles.ctas}>
            <Button as={Link} to={`/products/${welcomeKitFeature.productId}`} variant="primary" size="lg">
              Explore Welcome Kits
            </Button>
            <Button as={Link} to={{ hash: "#build-kit" }} variant="secondary" size="lg">
              Build Your Kit
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
