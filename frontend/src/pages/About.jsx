import { useState } from "react";
import { Link } from "react-router-dom";
import WhatsAppDialog from "../components/common/WhatsAppDialog";
import { submitLead } from "../api/leads";
import QuoteModal from "../components/product/QuoteModal";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import ProductVisual from "../components/ui/ProductVisual";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Seo from "../components/layout/Seo";
import {
  aboutHero,
  howPrimeLinorWorks,
  qualityStatements,
  valuePoints,
  whatWeCreate,
} from "../data/companyData";
import styles from "./About.module.css";

export default function About() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);

  return (
    <main id="main">
      <Seo
        title="About PrimeLinor — Custom Products for Your Brand"
        description="PrimeLinor helps businesses create custom products with their own branding — apparel, corporate gifts, promotional products and curated kits, at quantities that suit the team."
      />
      <section className={styles.hero} aria-labelledby="about-hero-title">
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">{aboutHero.eyebrow}</p>
            <h1 id="about-hero-title" className={styles.heroTitle}>
              {aboutHero.title}
            </h1>
            <p className={styles.heroDescription}>{aboutHero.copy}</p>
            <div className={styles.heroCtas}>
              <Button as={Link} to={aboutHero.primaryCtaTo} variant="primary" size="lg">
                {aboutHero.primaryCtaLabel}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setQuoteOpen(true)}>
                {aboutHero.secondaryCtaLabel}
              </Button>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <ProductVisual
              art="kit"
              color="#3c4a63"
              ratio="1 / 1"
              scale={0.92}
              surface="tint"
              alt="PrimeLinor branded product composition, photography placeholder"
            />
          </div>
        </div>
      </section>

      <Section ariaLabelledBy="what-we-create-title">
        <SectionHeader
          titleId="what-we-create-title"
          eyebrow="What we help you create"
          title="Custom products for growing businesses"
        />
        <ul className={styles.createGrid}>
          {whatWeCreate.map((item) => (
            <li key={item.id}>
              <Link to={item.to} className={styles.createCard}>
                <div className={styles.createMedia}>
                  <ProductVisual
                    art={item.art}
                    color={item.color}
                    ratio="4 / 2.8"
                    scale={0.94}
                    alt=""
                  />
                </div>
                <div className={styles.createBody}>
                  <h3 className={styles.createTitle}>{item.title}</h3>
                  <p className={styles.createDescription}>{item.description}</p>
                  <span className={styles.createCta}>
                    Explore
                    <Icon name="arrowRight" size={16} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="tint" ariaLabelledBy="value-title">
        <SectionHeader
          titleId="value-title"
          eyebrow="Built for business orders"
          title="What businesses get from PrimeLinor"
        />
        <ul className={styles.valueGrid}>
          {valuePoints.map((point) => (
            <li key={point.title} className={styles.valueItem}>
              <Icon name="check" size={18} className={styles.valueIcon} />
              <div>
                <p className={styles.valueTitle}>{point.title}</p>
                <p className={styles.valueDescription}>{point.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section ariaLabelledBy="how-it-works-title">
        <SectionHeader
          titleId="how-it-works-title"
          eyebrow="How it works"
          title="From enquiry to delivery"
          align="center"
        />
        <ol className={styles.steps}>
          {howPrimeLinorWorks.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="tint" ariaLabelledBy="quality-title">
        <div className={styles.quality}>
          <div>
            <h2 id="quality-title" className={styles.qualityTitle}>
              One Place for Branded Business Products
            </h2>
            <p className={styles.qualityLede}>
              Apparel, gifts, merchandise and kits, discoverable and
              customizable under one workflow — instead of sourcing each
              category from a different supplier.
            </p>
            <ul className={styles.qualityList}>
              {qualityStatements.map((statement) => (
                <li key={statement}>{statement}</li>
              ))}
            </ul>
          </div>
          <div className={styles.serviceArea}>
            <p className={styles.serviceEyebrow}>Service area</p>
            <p className={styles.serviceTitle}>PAN India Supply</p>
            <p className={styles.serviceCopy}>
              PrimeLinor supplies businesses across India.
            </p>
          </div>
        </div>
      </Section>

      <section className={styles.final} aria-labelledby="about-final-title">
        <div className="container">
          <div className={styles.finalPanel}>
            <p className="eyebrow">Get in touch</p>
            <h2 id="about-final-title" className={styles.finalTitle}>
              Have a Product or Project in Mind?
            </h2>
            <div className={styles.finalCtas}>
              <Button variant="primary" size="lg" onClick={() => setQuoteOpen(true)}>
                Request a Quote
              </Button>
              <Button as={Link} to="/products" variant="secondary" size="lg">
                Browse Products
              </Button>
            </div>
            <button type="button" className={styles.talkLink} onClick={() => setWaOpen(true)}>
              Talk to Our Team
            </button>
          </div>
        </div>
      </section>

      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={{ name: "General Product Enquiry" }}
        extraSummary={["Source: About page"]}
        onSubmit={(contact) =>
          submitLead({
            contact: {
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              companyName: contact.company,
            },
            message: contact.notes?.trim() || "General enquiry from the About page.",
            sourceType: "ABOUT",
          })
        }
      />
      <WhatsAppDialog open={waOpen} onClose={() => setWaOpen(false)} />
    </main>
  );
}
