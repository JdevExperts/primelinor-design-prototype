import Icon from "./Icon";
import ProductVisual from "./ProductVisual";
import styles from "./CategoryCard.module.css";

/**
 * The whole card is clickable, but only the inner button is focusable so the
 * keyboard order stays predictable.
 */
export default function CategoryCard({ category, ratio = "4 / 2.9" }) {
  const { name, art, color, image } = category;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <div className={styles.mediaInner}>
          <ProductVisual
            art={art}
            color={color}
            src={image}
            alt={`${name} — category photography placeholder`}
            ratio={ratio}
            scale={0.9}
          />
        </div>
      </div>
      <div className={styles.footer}>
        <button type="button" className={styles.trigger}>
          <span className={styles.name}>{name}</span>
        </button>
        <Icon name="arrowRight" size={18} className={styles.arrow} />
      </div>
    </article>
  );
}
