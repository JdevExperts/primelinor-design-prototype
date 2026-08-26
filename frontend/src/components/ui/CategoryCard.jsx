import { Link } from "react-router-dom";
import Icon from "./Icon";
import ProductVisual from "./ProductVisual";
import styles from "./CategoryCard.module.css";

/**
 * The whole card is clickable, but only the inner control is focusable so
 * the keyboard order stays predictable — previously a plain, handler-less
 * `<button>`, so every category tile was a dead click.
 *
 * Navigation reuses the same category → Product Listing handoff Solutions
 * pages already use (`Link to="/products" state={{ category }}`, read by
 * ProductListing's `applyLocationState`) rather than inventing a second
 * pattern. `category.targetCategory` is a real backend category slug; a
 * category with no real catalogue equivalent yet (e.g. Visiting Cards)
 * sets `href` instead for an explicit safe destination.
 */
export default function CategoryCard({ category, ratio = "4 / 2.9" }) {
  const { name, art, color, image, alt, targetCategory, href } = category;

  const linkProps = href
    ? { to: href }
    : { to: "/products", state: targetCategory ? { category: targetCategory } : undefined };

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <div className={styles.mediaInner}>
          <ProductVisual
            art={art}
            color={color}
            src={image}
            alt={alt || `${name} — category photography placeholder`}
            ratio={ratio}
            scale={0.9}
          />
        </div>
      </div>
      <div className={styles.footer}>
        <Link {...linkProps} className={styles.trigger}>
          <span className={styles.name}>{name}</span>
        </Link>
        <Icon name="arrowRight" size={18} className={styles.arrow} />
      </div>
    </article>
  );
}
