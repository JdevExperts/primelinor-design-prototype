import { useState } from "react";
import { Link } from "react-router-dom";
import ContactForm from "../components/contact/ContactForm";
import WhatsAppDialog from "../components/common/WhatsAppDialog";
import QuoteModal from "../components/product/QuoteModal";
import Button from "../components/ui/Button";
import Seo from "../components/layout/Seo";
import { contactChannels, contactHero } from "../data/companyData";
import { businessConfig } from "../data/siteConfig";
import { track } from "../analytics/track";
import styles from "./Contact.module.css";

export default function Contact() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);

  return (
    <main id="main">
      <Seo
        title="Contact PrimeLinor"
        description="Tell us what you need using the form and the PrimeLinor team will follow up directly — apparel, corporate gifts, promotional products and custom kits."
      />
      <section className={styles.hero} aria-labelledby="contact-hero-title">
        <div className={`container ${styles.heroInner}`}>
          <p className="eyebrow">{contactHero.eyebrow}</p>
          <h1 id="contact-hero-title" className={styles.heroTitle}>
            {contactHero.title}
          </h1>
          <p className={styles.heroCopy}>{contactHero.copy}</p>
        </div>
      </section>

      <section className={styles.body}>
        <div className={`container ${styles.layout}`}>
          <div className={styles.info}>
            <ul className={styles.channels}>
              {contactChannels.map((channel) => (
                <li key={channel.id} className={styles.channel}>
                  <p className={styles.channelTitle}>{channel.title}</p>
                  <p className={styles.channelDescription}>{channel.description}</p>
                  {channel.action === "whatsapp" ? (
                    <button
                      type="button"
                      className={styles.channelAction}
                      onClick={() => {
                        track("WHATSAPP_CLICK", { metadata: { context: "contact_channel" } });
                        setWaOpen(true);
                      }}
                    >
                      Continue on WhatsApp
                    </button>
                  ) : null}
                  {channel.action === "email" ? (
                    <a
                      className={styles.channelAction}
                      href={`mailto:${businessConfig.supportEmail}`}
                      onClick={() => track("CONTACT_CLICK", { metadata: { channel: "email" } })}
                    >
                      {businessConfig.supportEmail}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>

            <div className={styles.quotePanel}>
              <p className={styles.quotePanelTitle}>Visit or Call Us</p>
              <p className={styles.quotePanelCopy}>
                {businessConfig.addressLines.join(", ")}
                <br />
                <a href={`tel:${businessConfig.phoneE164}`}>{businessConfig.phoneDisplay}</a>
              </p>
            </div>

            <div className={styles.quotePanel}>
              <p className={styles.quotePanelTitle}>Already Know What You Need?</p>
              <p className={styles.quotePanelCopy}>
                Browse products and request a quote from the product page.
              </p>
              <div className={styles.quotePanelCtas}>
                <Button as={Link} to="/products" variant="primary" size="md">
                  Browse Products
                </Button>
                <Button variant="secondary" size="md" onClick={() => setQuoteOpen(true)}>
                  Request a Quote
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.formCol}>
            <h2 className={styles.formTitle}>Send a General Enquiry</h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={{ name: "General Product Enquiry" }}
        extraSummary={["Source: Contact page"]}
      />
      <WhatsAppDialog open={waOpen} onClose={() => setWaOpen(false)} />
    </main>
  );
}
