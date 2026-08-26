import { useState } from "react";
import { Link } from "react-router-dom";
import { submitLead } from "../../api/leads";
import QuoteModal from "../product/QuoteModal";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import styles from "./FinalCTA.module.css";

/**
 * The Header's "Request a Quote" CTA links here (`/#request-quote`) — this
 * is the button it ultimately resolves to. No product/quantity context is
 * available at this point, so it submits a Lead (see Phase 2 §5/§6),
 * matching the same generic-enquiry pattern used on About/Solutions.
 */
export default function FinalCTA() {
  const [quoteOpen, setQuoteOpen] = useState(false);

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
            <Button variant="primary" size="lg" onClick={() => setQuoteOpen(true)}>
              Request a Quote
            </Button>
            {/* Try Your Logo removed here (Phase: homepage simplification) —
                it only ever belongs on a real, Studio-ready product's own
                PDP/ProductCard now, not a generic homepage destination. */}
            <Button as={Link} to="/products" variant="secondary" size="lg">
              Browse Products
            </Button>
          </div>

          <p className={styles.note}>
            <Icon name="chat" size={16} className={styles.noteIcon} />
            No account needed. Prefer to talk it through? Continue on WhatsApp.
          </p>
        </div>
      </div>

      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={{ name: "General Product Enquiry" }}
        extraSummary={["Source: Header / Home CTA"]}
        onSubmit={(contact) =>
          submitLead({
            contact: {
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              companyName: contact.company,
            },
            message: contact.notes?.trim() || "General enquiry from the Request a Quote CTA.",
            sourceType: "HEADER_QUOTE",
          })
        }
      />
    </section>
  );
}
