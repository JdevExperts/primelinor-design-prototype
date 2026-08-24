import Icon from "../ui/Icon";
import Section from "../ui/Section";
import styles from "./SolutionChallenge.module.css";

/**
 * Explains the buying context in plain terms, then a compact "where this
 * helps" chip row — combines the brief's separate Challenge and Use Cases
 * blocks into one section to keep the page within its section budget.
 */
export default function SolutionChallenge({ solution }) {
  return (
    <Section tone="muted" ariaLabelledBy="solution-challenge-title">
      <div className={styles.layout}>
        <div className={styles.copy}>
          <h2 id="solution-challenge-title" className={styles.title}>
            {solution.challengeTitle}
          </h2>
          <p className={styles.description}>{solution.challengeCopy}</p>
        </div>

        <ul className={styles.points}>
          {solution.challengePoints.map((point) => (
            <li key={point} className={styles.point}>
              <Icon name="check" size={16} className={styles.pointIcon} />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {solution.useCases?.length ? (
        <div className={styles.useCases}>
          <p className={styles.useCasesLabel}>Where this helps</p>
          <ul className={styles.useCasesList}>
            {solution.useCases.map((item) => (
              <li key={item} className={styles.useCase}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}
