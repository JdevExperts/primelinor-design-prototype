import Button from "../ui/Button";
import Icon from "../ui/Icon";
import styles from "./FinalCTA.module.css";

export default function FinalCTA() {
  return (
    <section
      id="request-quote"
      className={styles.section}
      aria-labelledby="final-cta-title"
    >
      <div className="container">
        <div className={styles.panel}>
          <p className="eyebrow">Start your project</p>

          <h2 id="final-cta-title" className={styles.title}>
            Ready to create something for your brand?
          </h2>

          <p className={styles.description}>
            Share what you need and the quantity you are considering. Our team
            will come back with pricing, samples and timelines.
          </p>

          <div className={styles.ctas}>
            <Button variant="primary" size="lg">
              Request a Quote
            </Button>
            <Button variant="accent" size="lg" icon="upload">
              Try Your Logo
            </Button>
          </div>

          <p className={styles.note}>
            <Icon name="chat" size={16} className={styles.noteIcon} />
            No account needed. Prefer to talk it through? Continue on WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}
