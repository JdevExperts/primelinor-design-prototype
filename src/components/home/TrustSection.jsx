import Icon from "../ui/Icon";
import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { trust } from "../../data/mockData";
import styles from "./TrustSection.module.css";

/**
 * Every module here is an honest reserved slot. Nothing renders a rating,
 * a customer name or a quote that PrimeLinor has not actually received —
 * real values simply replace the placeholder when the data arrives.
 */
export default function TrustSection() {
  return (
    <Section tone="muted" ariaLabelledBy="trust-title">
      <SectionHeader
        titleId="trust-title"
        eyebrow="Trusted by teams"
        title="Proof, not promises"
        description="We would rather leave these spaces open than fill them with claims we cannot show you."
      />

      <div className={styles.top}>
        <div className={styles.ratingCard}>
          <p className={styles.ratingSource}>{trust.rating.source}</p>
          <div className={styles.ratingValue}>
            <span className={styles.stars} aria-hidden="true">
              {[0, 1, 2, 3, 4].map((index) => (
                <Icon key={index} name="star" size={17} />
              ))}
            </span>
            <span className={styles.ratingPending}>Not yet connected</span>
          </div>
          <p className={styles.ratingNote}>{trust.rating.label}</p>
        </div>

        <div className={styles.logos}>
          <p className={styles.moduleLabel}>Customer logos</p>
          <ul className={styles.logoGrid}>
            {trust.companies.map((company) => (
              <li key={company} className={styles.logoSlot}>
                <span className="visually-hidden">
                  Reserved customer logo slot
                </span>
                <span aria-hidden="true">{company}</span>
              </li>
            ))}
          </ul>
          <p className={styles.moduleNote}>
            Logos are added only with written permission from the customer.
          </p>
        </div>
      </div>

      <ul className={styles.testimonials}>
        {trust.testimonials.map((testimonial) => (
          <li key={testimonial.id}>
            {testimonial.quote ? (
              <figure className={styles.testimonial}>
                <span className={styles.quoteMark} aria-hidden="true">
                  “
                </span>
                <blockquote className={styles.quote}>
                  {testimonial.quote}
                </blockquote>
                <figcaption className={styles.attribution}>
                  <span className={styles.avatar} aria-hidden="true" />
                  <span>
                    <span className={styles.name}>{testimonial.name}</span>
                    <span className={styles.role}>
                      {testimonial.role}, {testimonial.company}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ) : (
              <div className={styles.reserved}>
                <span className={styles.quoteMark} aria-hidden="true">
                  “
                </span>
                <p className={styles.reservedTitle}>
                  Verified customer story
                </p>
                <p className={styles.reservedContext}>{testimonial.context}</p>
                <p className={styles.reservedNote}>
                  Published here once the customer approves it.
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className={styles.gallery}>
        <div className={styles.galleryHead}>
          <p className={styles.moduleLabel}>Order photography</p>
          <p className={styles.moduleNote}>
            Placeholder visuals — photography from completed PrimeLinor orders
            will replace these.
          </p>
        </div>
        <ul className={styles.galleryGrid}>
          {trust.gallery.map((item) => (
            <li key={item.id} className={styles.galleryItem}>
              <ProductVisual
                art={item.art}
                color={item.color}
                src={item.image}
                alt={item.label}
                ratio="4 / 3"
                scale={0.88}
              />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
