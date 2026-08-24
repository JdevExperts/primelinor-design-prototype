import { Link } from "react-router-dom";
import Button from "../ui/Button";
import styles from "./SolutionFinalCta.module.css";

const VARIANT_BY_INDEX = ["primary", "secondary"];

export default function SolutionFinalCta({ solution, onRequestQuote }) {
  const { finalCta } = solution;

  return (
    <section className={styles.section} aria-labelledby="solution-final-title">
      <div className="container">
        <div className={styles.panel}>
          <p className="eyebrow">{solution.label}</p>
          <h2 id="solution-final-title" className={styles.title}>
            {finalCta.title}
          </h2>
          {finalCta.subtitle ? <p className={styles.subtitle}>{finalCta.subtitle}</p> : null}

          <div className={styles.ctas}>
            {finalCta.ctas.map((cta, index) => {
              const variant = VARIANT_BY_INDEX[index] || "secondary";
              if (cta.type === "quote") {
                return (
                  <Button key={cta.label} variant={variant} size="lg" onClick={onRequestQuote}>
                    {cta.label}
                  </Button>
                );
              }
              return (
                <Button key={cta.label} as={Link} to={cta.to} variant={variant} size="lg">
                  {cta.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
