import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { trust } from "../../data/mockData";
import styles from "./GiftingTrust.module.css";

/**
 * Reuses the homepage's honest reserved-slot trust data rather than
 * inventing gifting-specific fake testimonials or client names — the
 * existing `trust.testimonials` entries already cover welcome kits, event
 * merchandise and festival/client gifting.
 */
export default function GiftingTrust() {
  return (
    <Section tone="muted" ariaLabelledBy="gifting-trust-title">
      <SectionHeader
        titleId="gifting-trust-title"
        eyebrow="Ideas from completed orders"
        title="Real work, shown honestly"
        description="Verified stories and photography from completed PrimeLinor orders will appear here — we would rather leave a space open than fill it with a claim we can't show you."
      />

      <ul className={styles.testimonials}>
        {trust.testimonials.map((testimonial) => (
          <li key={testimonial.id} className={styles.testimonial}>
            <span className={styles.quoteMark} aria-hidden="true">
              &ldquo;
            </span>
            <p className={styles.reservedTitle}>Verified customer story</p>
            <p className={styles.reservedContext}>{testimonial.context}</p>
          </li>
        ))}
      </ul>

      <ul className={styles.gallery}>
        {trust.gallery.map((item) => (
          <li key={item.id}>
            <ProductVisual art={item.art} color={item.color} src={item.image} alt={item.label} ratio="4 / 3" scale={0.88} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
