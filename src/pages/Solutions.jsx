import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import SolutionCard from "../components/solutions/SolutionCard";
import QuoteModal from "../components/product/QuoteModal";
import { solutions } from "../data/solutionsData";
import styles from "./Solutions.module.css";

export default function Solutions() {
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    document.title = "Solutions — PrimeLinor";
  }, []);

  return (
    <main id="main">
      <section className={styles.hero} aria-labelledby="solutions-hero-title">
        <div className={`container ${styles.heroInner}`}>
          <p className="eyebrow">Solutions</p>
          <h1 id="solutions-hero-title" className={styles.heroTitle}>
            Built Around Your Business Need
          </h1>
          <p className={styles.heroCopy}>
            From uniforms and event merchandise to onboarding kits and
            promotional campaigns, explore solutions built around how
            businesses actually buy custom products.
          </p>
          <div className={styles.heroCtas}>
            <Button as="a" href="#solution-cards" variant="primary" size="lg">
              Explore Solutions
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setQuoteOpen(true)}>
              Request a Quote
            </Button>
          </div>
        </div>
      </section>

      <section id="solution-cards" className={styles.cardsSection} aria-label="Solutions">
        <div className="container">
          <ul className={styles.grid}>
            {solutions.map((solution) => (
              <li key={solution.slug}>
                <SolutionCard solution={solution} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.support} aria-labelledby="solutions-support-title">
        <div className="container">
          <div className={styles.supportPanel}>
            <div>
              <h2 id="solutions-support-title" className={styles.supportTitle}>
                Not Sure Where to Start?
              </h2>
              <p className={styles.supportCopy}>
                Tell us what you&rsquo;re buying for, an approximate quantity
                and a budget if you know it — we&rsquo;ll recommend the right
                products.
              </p>
            </div>
            <div className={styles.supportCtas}>
              <Button variant="primary" size="md" onClick={() => setQuoteOpen(true)}>
                Request a Quote
              </Button>
              <Button as={Link} to="/products" variant="secondary" size="md">
                Browse Products
              </Button>
            </div>
          </div>
        </div>
      </section>

      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={{ name: "Solutions Enquiry" }}
        extraSummary={[]}
      />
    </main>
  );
}
