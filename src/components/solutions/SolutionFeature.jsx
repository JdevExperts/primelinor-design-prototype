import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import styles from "./SolutionFeature.module.css";

/** One editorial block. `reversed` alternates image side for visual rhythm
 *  when a solution defines two feature sections. */
export default function SolutionFeature({ feature, reversed = false, tone = "white" }) {
  return (
    <Section tone={tone} ariaLabelledBy={`feature-${feature.id}-title`}>
      <div className={`${styles.layout} ${reversed ? styles.reversed : ""}`}>
        <div className={styles.media}>
          <ProductVisual
            art={feature.art}
            color={feature.color}
            ratio="4 / 2.8"
            scale={0.94}
            alt={`${feature.title} — photography placeholder`}
          />
        </div>
        <div className={styles.copy}>
          <h2 id={`feature-${feature.id}-title`} className={styles.title}>
            {feature.title}
          </h2>
          <p className={styles.description}>{feature.description}</p>
          {feature.ctaLabel && feature.ctaTo ? (
            <Button as={Link} to={feature.ctaTo} variant="secondary" size="md" trailingIcon="arrowRight">
              {feature.ctaLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
