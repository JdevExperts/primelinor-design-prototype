import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import Section from "../ui/Section";
import styles from "./GiftingFinalCta.module.css";

/**
 * Two related closing blocks in one file: an understated expert-support
 * strip, then the page's strong final conversion panel. Kept together since
 * both just need `onRequestQuote` and neither is heavy enough to justify a
 * separate component.
 */
export default function GiftingFinalCta({ onRequestQuote }) {
  return (
    <>
      <Section id="gifting-expert" tone="muted" ariaLabelledBy="gifting-expert-title">
        <div className={styles.expert}>
          <div>
            <h2 id="gifting-expert-title" className={styles.expertTitle}>
              Not Sure What to Put in the Kit?
            </h2>
            <p className={styles.expertCopy}>
              Tell us the occasion, budget and quantity — our team will help
              recommend a combination.
            </p>
          </div>
          <div className={styles.expertCtas}>
            <Button variant="primary" size="md" icon="chat" onClick={onRequestQuote}>
              Talk to a Gifting Expert
            </Button>
            <Button variant="secondary" size="md" onClick={onRequestQuote}>
              Request a Quote
            </Button>
          </div>
        </div>
      </Section>

      <section id="final-cta" className={styles.final} aria-labelledby="gifting-final-title">
        <div className="container">
          <div className={styles.panel}>
            <p className="eyebrow">Start your project</p>
            <h2 id="gifting-final-title" className={styles.finalTitle}>
              Ready to Create a Gift Your Team Will Remember?
            </h2>
            <p className={styles.finalCopy}>
              Share what you need and the quantity you are considering. Our
              team will come back with pricing, samples and timelines.
            </p>
            <div className={styles.finalCtas}>
              <Button variant="primary" size="lg" onClick={onRequestQuote}>
                Request a Quote
              </Button>
              <Button
                as={Link}
                to={{ hash: "#build-kit" }}
                variant="accent"
                size="lg"
                trailingIcon="arrowRight"
              >
                Build Your Kit
              </Button>
            </div>
            <p className={styles.note}>
              <Icon name="chat" size={16} />
              No account needed. Prefer to talk it through? Chat with an
              expert.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
