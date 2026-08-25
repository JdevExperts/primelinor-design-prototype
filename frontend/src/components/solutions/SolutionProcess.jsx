import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import styles from "./SolutionProcess.module.css";

/** Same numbered-step visual language as the homepage How It Works section. */
export default function SolutionProcess({ solution }) {
  return (
    <Section ariaLabelledBy="solution-process-title">
      <SectionHeader
        titleId="solution-process-title"
        eyebrow="How it works"
        title="From enquiry to delivery"
        align="center"
      />

      <ol className={styles.steps}>
        {solution.processSteps.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.number} aria-hidden="true">
              {index + 1}
            </span>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.description}>{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
