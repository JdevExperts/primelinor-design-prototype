import Icon from "../ui/Icon";
import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { businessUseCases } from "../../data/mockData";
import styles from "./BusinessUseCases.module.css";

/**
 * Rendered as a scannable two-column list rather than another card grid, so
 * the "what are you buying for?" question reads differently from the product
 * sections above and below it.
 */
export default function BusinessUseCases() {
  return (
    <Section tone="muted" ariaLabelledBy="use-cases-title">
      <SectionHeader
        titleId="use-cases-title"
        eyebrow="Made for your business"
        title="Find products by what you are working on"
        description="Already know the team and the occasion? Start from your use case instead of the product type."
      />

      <ul className={styles.list}>
        {businessUseCases.map((useCase) => (
          <li key={useCase.id} className={styles.row}>
            <div className={styles.media}>
              <ProductVisual
                art={useCase.art}
                color={useCase.color}
                src={useCase.image}
                alt={`${useCase.title} — photography placeholder`}
                ratio="1 / 1"
                scale={0.96}
              />
            </div>

            <div className={styles.body}>
              <h3 className={styles.title}>
                <button type="button" className={styles.trigger}>
                  {useCase.title}
                </button>
              </h3>
              <p className={styles.description}>{useCase.description}</p>
            </div>

            <Icon name="arrowRight" size={18} className={styles.arrow} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
