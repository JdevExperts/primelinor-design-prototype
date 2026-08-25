import Icon from "../ui/Icon";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { giftingBenefits } from "../../data/corporateGiftingData";
import styles from "./GiftingBenefits.module.css";

export default function GiftingBenefits() {
  return (
    <Section tone="navy" ariaLabelledBy="gifting-benefits-title">
      <SectionHeader
        titleId="gifting-benefits-title"
        eyebrow="Why PrimeLinor"
        title="Built for how businesses actually gift"
        align="center"
      />

      <ul className={styles.strip}>
        {giftingBenefits.map((benefit) => (
          <li key={benefit.id} className={styles.item}>
            <span className={styles.icon} aria-hidden="true">
              <Icon name={benefit.icon} size={22} />
            </span>
            <p className={styles.title}>{benefit.title}</p>
            <p className={styles.description}>{benefit.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
