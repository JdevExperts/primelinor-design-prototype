import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import QuoteModal from "../components/product/QuoteModal";
import SolutionBenefits from "../components/solutions/SolutionBenefits";
import SolutionChallenge from "../components/solutions/SolutionChallenge";
import SolutionFeature from "../components/solutions/SolutionFeature";
import SolutionFinalCta from "../components/solutions/SolutionFinalCta";
import SolutionHero from "../components/solutions/SolutionHero";
import SolutionProcess from "../components/solutions/SolutionProcess";
import SolutionProducts from "../components/solutions/SolutionProducts";
import SolutionProof from "../components/solutions/SolutionProof";
import { getSolution } from "../data/solutionsData";
import styles from "./SolutionDetail.module.css";

function SolutionNotFound() {
  useEffect(() => {
    document.title = "Solution not found — PrimeLinor";
  }, []);

  return (
    <main id="main" className={styles.missingPage}>
      <div className={`container ${styles.missing}`}>
        <p className="eyebrow">Solutions</p>
        <h1 className={styles.missingTitle}>Solution not found</h1>
        <p className={styles.missingCopy}>
          That solution isn&rsquo;t in this prototype yet. Browse the
          solutions directory or the full catalogue instead.
        </p>
        <div className={styles.missingActions}>
          <Button as={Link} to="/solutions" variant="primary" size="md">
            Browse Solutions
          </Button>
          <Button as={Link} to="/products" variant="secondary" size="md">
            Browse Products
          </Button>
        </div>
      </div>
    </main>
  );
}

/**
 * ONE reusable template for every solution — nothing here is per-slug JSX.
 * Everything visible comes from `solutionsData.js`; feature blocks render
 * only when a solution defines them, and the proof section renders only
 * when a solution points at a real reserved testimonial.
 */
function SolutionDetailView({ solution }) {
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    document.title = `${solution.label} — PrimeLinor`;
  }, [solution.label]);

  const openQuote = () => setQuoteOpen(true);

  return (
    <main id="main">
      <SolutionHero solution={solution} onRequestQuote={openQuote} />
      <SolutionChallenge solution={solution} />
      <SolutionProducts solution={solution} />

      {solution.featureSections.map((feature, index) => (
        <SolutionFeature
          key={feature.id}
          feature={feature}
          reversed={index % 2 === 1}
          tone={index % 2 === 1 ? "muted" : "white"}
        />
      ))}

      <SolutionBenefits solution={solution} />
      <SolutionProcess solution={solution} />
      <SolutionProof solution={solution} />
      <SolutionFinalCta solution={solution} onRequestQuote={openQuote} />

      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={{ name: `${solution.label} Enquiry` }}
        extraSummary={[`Solution: ${solution.label}`]}
      />
    </main>
  );
}

export default function SolutionDetail() {
  const { slug } = useParams();
  const solution = getSolution(slug);
  if (!solution) return <SolutionNotFound />;
  return <SolutionDetailView key={solution.slug} solution={solution} />;
}
