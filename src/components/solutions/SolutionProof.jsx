import Section from "../ui/Section";
import { trust } from "../../data/mockData";
import styles from "./SolutionProof.module.css";

/**
 * Reuses the homepage's honest reserved-slot testimonial data — never
 * invented per-solution. Rendered only when a solution's data points at a
 * real (if still unfilled) testimonial record; omitted everywhere else
 * rather than added on every page just for symmetry.
 */
export default function SolutionProof({ solution }) {
  const testimonial = trust.testimonials.find((item) => item.id === solution.proofTestimonialId);
  if (!testimonial) return null;

  return (
    <Section tone="muted" ariaLabelledBy="solution-proof-title">
      <div className={styles.card}>
        <span className={styles.quoteMark} aria-hidden="true">
          &ldquo;
        </span>
        <h2 id="solution-proof-title" className={styles.title}>
          Verified customer story
        </h2>
        <p className={styles.context}>{testimonial.context}</p>
        <p className={styles.note}>
          Published here once a customer approves it — we would rather leave
          this space open than fill it with a claim we can&rsquo;t show you.
        </p>
      </div>
    </Section>
  );
}
