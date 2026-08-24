import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ProductVisual from "../ui/ProductVisual";
import styles from "./SolutionHero.module.css";

/**
 * Reusable across all six solutions — every visible word and the CTA
 * targets come from `solution`. `heroImage` is admin-ready (same pattern
 * as the homepage banners and Corporate Gifting hero): null renders a
 * single composed ProductVisual placeholder instead of a photo.
 */
export default function SolutionHero({ solution, onRequestQuote }) {
  const hasPhoto = Boolean(solution.heroImage);

  return (
    <section className={styles.hero} aria-labelledby="solution-hero-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className="eyebrow">{solution.eyebrow}</p>
          <h1 id="solution-hero-title" className={styles.title}>
            {solution.heroTitle}
          </h1>
          <p className={styles.description}>{solution.heroCopy}</p>

          <div className={styles.ctas}>
            <Button variant="primary" size="lg" onClick={onRequestQuote}>
              {solution.primaryCtaLabel}
            </Button>
            <Button as={Link} to={solution.secondaryCtaTo} variant="secondary" size="lg" trailingIcon="arrowRight">
              {solution.secondaryCtaLabel}
            </Button>
          </div>
        </div>

        <div className={styles.visual}>
          {hasPhoto ? (
            <img className={styles.photo} src={solution.heroImage} alt={solution.heroAlt} />
          ) : (
            <div className={styles.placeholder}>
              <ProductVisual
                art={solution.art}
                color={solution.color}
                ratio="4 / 3.2"
                scale={1}
                surface="tint"
                alt={solution.heroAlt}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
