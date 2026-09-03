import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import { welcomeKitFeature } from "../../data/corporateGiftingData";
import { resolveGiftProduct } from "../../utils/giftingCatalogue";
import styles from "./WelcomeKitFeature.module.css";

/**
 * The strongest single feature on the page. Each kit piece resolves to its
 * real catalogue product image where one exists (`item.productSlug`);
 * "Welcome Card" has no SKU and keeps its illustration. "Explore Welcome
 * Kits" links to the real welcome-kit PDP.
 */
export default function WelcomeKitFeature({ productsBySlug }) {
  const lookup = productsBySlug || new Map();
  const items = welcomeKitFeature.items.map((item) => {
    const product = item.productSlug ? resolveGiftProduct(item.productSlug, lookup) : null;
    return { ...item, image: product?.image || null, href: product ? `/products/${product.id}` : null };
  });

  return (
    <Section id="welcome-kit-feature" tone="tint" ariaLabelledBy="welcome-kit-title" spacious>
      <div className={styles.layout}>
        <div className={styles.kitBox}>
          <ul className={styles.items}>
            {items.map((item) => {
              const visual = (
                <>
                  <ProductVisual
                    art={item.art}
                    color={item.color}
                    src={item.image}
                    alt={item.image ? item.label : ""}
                    ratio="1 / 1"
                    scale={0.86}
                  />
                  <span className={styles.itemLabel}>{item.label}</span>
                </>
              );
              return (
                <li key={item.id} className={styles.item}>
                  {item.href ? (
                    <Link to={item.href} className={styles.itemLink}>
                      {visual}
                    </Link>
                  ) : (
                    visual
                  )}
                </li>
              );
            })}
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
            <Button as={Link} to={`/products/${welcomeKitFeature.productSlug}`} variant="primary" size="lg">
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
