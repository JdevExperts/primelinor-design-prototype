import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import QuoteModal from "../components/product/QuoteModal";
import { submitLead } from "../api/leads";
import SolutionBenefits from "../components/solutions/SolutionBenefits";
import SolutionChallenge from "../components/solutions/SolutionChallenge";
import SolutionFeature from "../components/solutions/SolutionFeature";
import SolutionFinalCta from "../components/solutions/SolutionFinalCta";
import SolutionHero from "../components/solutions/SolutionHero";
import SolutionProcess from "../components/solutions/SolutionProcess";
import SolutionProducts from "../components/solutions/SolutionProducts";
import SolutionProof from "../components/solutions/SolutionProof";
import { getSolutionBySlug } from "../api/catalog";
import Seo from "../components/layout/Seo";
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
          That solution doesn&rsquo;t exist or may have been removed. Browse
          the solutions directory or the full catalogue instead.
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
 * Everything visible comes from the Solution API (Solutions Phase A/D);
 * feature blocks render only when a solution defines them, and the proof
 * section renders only when a solution points at a real reserved
 * testimonial.
 */
function SolutionDetailView({ solution }) {
  const [quoteOpen, setQuoteOpen] = useState(false);

  const openQuote = () => setQuoteOpen(true);

  return (
    <main id="main">
      <Seo
        title={`${solution.label} — PrimeLinor`}
        description={solution.hubDescription || solution.heroCopy}
        ogImage={solution.heroImage}
      />
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
        onSubmit={(contact) =>
          submitLead({
            contact: {
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              companyName: contact.company,
            },
            message: contact.notes?.trim() || `Enquiry about ${solution.label}.`,
            sourceType: "SOLUTION",
            sourceContext: { solutionSlug: solution.slug },
          })
        }
      />
    </main>
  );
}

function SolutionLoading() {
  return (
    <main id="main" className={styles.missingPage}>
      <div className={`container ${styles.missing}`}>
        <p className="eyebrow">Solutions</p>
        <p className={styles.missingCopy}>Loading…</p>
      </div>
    </main>
  );
}

export default function SolutionDetail() {
  const { slug } = useParams();
  const [status, setStatus] = useState("loading");
  const [solution, setSolution] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    getSolutionBySlug(slug)
      .then((result) => {
        if (cancelled) return;
        setSolution(result);
        setStatus(result ? "ready" : "not-found");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === "loading") return <SolutionLoading />;
  if (status !== "ready" || !solution) return <SolutionNotFound />;
  return <SolutionDetailView key={solution.slug} solution={solution} />;
}
