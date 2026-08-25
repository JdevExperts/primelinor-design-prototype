import Icon from "../ui/Icon";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import styles from "./SolutionBenefits.module.css";

/**
 * Deliberately a plain checklist rather than the icon-circle strip already
 * used on the Corporate Gifting page — visual variety, and this section
 * repeats across all six solution pages.
 */
export default function SolutionBenefits({ solution }) {
  return (
    <Section tone="tint" ariaLabelledBy="solution-benefits-title">
      <SectionHeader
        titleId="solution-benefits-title"
        eyebrow="Why PrimeLinor"
        title={`Built for ${solution.label.toLowerCase()}`}
      />

      <ul className={styles.grid}>
        {solution.benefits.map((benefit) => (
          <li key={benefit.title} className={styles.item}>
            <Icon name="check" size={18} className={styles.icon} />
            <div>
              <p className={styles.title}>{benefit.title}</p>
              <p className={styles.description}>{benefit.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
