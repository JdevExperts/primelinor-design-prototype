import Button from "../ui/Button";
import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { brandingExamples, packagingOptions } from "../../data/corporateGiftingData";
import styles from "./BrandingPackaging.module.css";

/**
 * Branding (§27) and packaging (§28) combined into one section — both are
 * short, related, and this keeps the page from growing another near-empty
 * band. No printing-method terminology is exposed to the customer.
 */
export default function BrandingPackaging({ onRequestQuote }) {
  return (
    <Section ariaLabelledBy="branding-packaging-title">
      <SectionHeader
        titleId="branding-packaging-title"
        eyebrow="Branding & packaging"
        title="Your Brand, Across the Whole Kit"
        description="We customize products and packaging with your logo, and our team recommends the right branding method for each material — you don't need to choose one."
      />

      <ul className={styles.examples} aria-label="Branding examples">
        {brandingExamples.map((example) => (
          <li key={example.id} className={styles.example}>
            <div className={styles.exampleMedia}>
              <ProductVisual art={example.art} color={example.color} ratio="1 / 1" scale={0.86} />
              <span className={styles.logoMark} aria-hidden="true" />
            </div>
            <span className={styles.exampleLabel}>{example.label}</span>
          </li>
        ))}
      </ul>

      <div className={styles.packaging}>
        <h3 className={styles.packagingTitle}>Packaging</h3>
        <ul className={styles.packagingList}>
          {packagingOptions.map((option) => (
            <li key={option.id} className={styles.packagingItem}>
              <div className={styles.packagingMedia}>
                <ProductVisual art={option.art} color={option.color} ratio="1 / 1" scale={0.86} />
              </div>
              <div>
                <p className={styles.packagingItemTitle}>{option.title}</p>
                <p className={styles.packagingItemDescription}>{option.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <Button variant="secondary" size="md" onClick={onRequestQuote}>
          Ask About Custom Packaging
        </Button>
      </div>
    </Section>
  );
}
