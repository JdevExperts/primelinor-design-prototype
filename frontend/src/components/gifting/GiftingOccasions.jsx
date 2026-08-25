import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { giftOccasions } from "../../data/corporateGiftingData";
import styles from "./GiftingOccasions.module.css";

/**
 * Horizontal tiles rather than another vertical image-card grid — deliberate
 * variety from GiftingUseCases and GiftCollections above it.
 */
export default function GiftingOccasions() {
  return (
    <Section tone="muted" ariaLabelledBy="gifting-occasions-title">
      <SectionHeader
        titleId="gifting-occasions-title"
        eyebrow="Every occasion"
        title="Gifting for Every Occasion"
        align="center"
      />

      <ul className={styles.grid}>
        {giftOccasions.map((occasion) => (
          <li key={occasion.id} className={styles.tile}>
            <div className={styles.media}>
              <ProductVisual art={occasion.art} color={occasion.color} ratio="1 / 1" scale={0.88} />
            </div>
            <div className={styles.body}>
              <h3 className={styles.title}>{occasion.title}</h3>
              <p className={styles.description}>{occasion.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
