import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { howItWorks } from "../../data/mockData";
import styles from "./HowItWorks.module.css";

export default function HowItWorks() {
  return (
    <Section ariaLabelledBy="how-it-works-title">
      <SectionHeader
        titleId="how-it-works-title"
        eyebrow="How it works"
        title="Five steps from idea to delivery"
        align="center"
      />

      <ol className={styles.steps}>
        {howItWorks.map((step) => (
          <li key={step.id} className={styles.step}>
            <span className={styles.number} aria-hidden="true">
              {step.id}
            </span>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.description}>{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
